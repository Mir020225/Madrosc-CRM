// components/CustomerDetailModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Sale, Remark, Task, CustomerFormData, Customer } from '../types';
import { generateAIPerformanceReview, generateTaskFromRemark, generateSummaryFromNotes, suggestBestContactTime } from '../services/geminiService';
import Spinner from './ui/Spinner';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { indianStatesAndDistricts } from '../data/indianStatesAndDistricts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const DetailCard: React.FC<{ title: string; value: React.ReactNode; className?: string }> = ({ title, value, className = '' }) => (
    <div className={`p-3 bg-gray-50 dark:bg-white/5 rounded-lg ${className}`}>
        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{title}</p>
        <p className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{value}</p>
    </div>
);

// --- TABS ---

const AIContactSuggestion: React.FC<{ remarks: Remark[] }> = ({ remarks }) => {
    const [suggestion, setSuggestion] = useState<{ suggestion: string; reasoning: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const generateSuggestion = useCallback(async () => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            const result = await suggestBestContactTime(remarks);
            setSuggestion(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [remarks]);

    useEffect(() => {
        generateSuggestion();
    }, [generateSuggestion]);

    return (
        <div className="bg-green-50 dark:bg-green-900/40 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-base flex items-center"><i className="fas fa-clock mr-2 text-green-600 dark:text-green-400"></i> Best Time to Contact</h4>
                <button onClick={generateSuggestion} disabled={isLoading} className="text-xs text-green-600 hover:underline disabled:opacity-50">Regenerate</button>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-16"><Spinner size="sm" /></div>
            ) : suggestion ? (
                <div>
                    <p className="font-bold text-lg text-green-800 dark:text-green-200">{suggestion.suggestion}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{suggestion.reasoning}</p>
                </div>
            ) : (
                <p className="text-sm text-center text-green-700 dark:text-green-300">Could not generate suggestion.</p>
            )}
        </div>
    );
};

const OverviewTab: React.FC<{ customer: any, sales: Sale[], remarks: Remark[], onEditMode: () => void }> = ({ customer, sales, remarks, onEditMode }) => {
    const [aiReview, setAiReview] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const handleRegenerate = useCallback(async () => {
        setIsLoading(true);
        setAiReview('');
        try {
            const review = await generateAIPerformanceReview(customer, sales, remarks);
            setAiReview(review);
        } catch (e) { setAiReview("Error generating review.") }
        finally { setIsLoading(false); }
    }, [customer, sales, remarks]);

    useEffect(() => {
        handleRegenerate();
    }, [handleRegenerate]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg">Key Metrics</h4>
                        <button onClick={onEditMode} className="btn-secondary-sm">
                            <i className="fas fa-pencil-alt mr-2"></i>Edit Details
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <DetailCard title="Contact" value={<>{customer.contact}{customer.alternateContact && <span className="block text-xs mt-1">Alt: {customer.alternateContact}</span>}</>} />
                        <DetailCard title="Location" value={`${customer.district}, ${customer.state}`} />
                        <DetailCard title="Tier" value={customer.tier} />
                        <DetailCard title="Sales This Month" value={`₹${customer.salesThisMonth.toLocaleString('en-IN')}`} />
                        <DetailCard title="Outstanding" value={`₹${customer.outstandingBalance.toLocaleString('en-IN')}`} className="text-red-600 dark:text-red-400" />
                        <DetailCard title="Last Order" value={`${customer.daysSinceLastOrder} days ago`} />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                 <AIContactSuggestion remarks={remarks} />
                <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold flex items-center"><i className="fas fa-brain mr-2 text-blue-500"></i> AI Review</h4>
                        <button onClick={handleRegenerate} disabled={isLoading} className="text-xs text-blue-600 hover:underline disabled:opacity-50">Regenerate</button>
                    </div>
                     {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Spinner />
                            <p className="mt-2 text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Generating insights...</p>
                        </div>
                    ) : (
                        <MarkdownRenderer content={aiReview} />
                    )}
                </div>
            </div>
        </div>
    )
}

const EditDetailsTab: React.FC<{ customer: any, onCancel: () => void, onSave: (data: CustomerFormData) => Promise<void> }> = ({ customer, onCancel, onSave }) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        name: customer.name,
        contact: customer.contact,
        alternateContact: customer.alternateContact || '',
        state: customer.state,
        district: customer.district,
        tier: customer.tier,
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.state && indianStatesAndDistricts[formData.state]) {
            setDistricts(indianStatesAndDistricts[formData.state]);
        }
    }, [formData.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(name === 'state') {
            setFormData(prev => ({...prev, district: ''}));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    }
    
    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact</label>
                    <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className="input-style" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Alternate Contact</label>
                    <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleChange} className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <select name="state" value={formData.state} onChange={handleChange} className="input-style">
                        {Object.keys(indianStatesAndDistricts).sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                     <select name="district" value={formData.district} onChange={handleChange} className="input-style" disabled={!formData.state}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tier</label>
                    <select name="tier" value={formData.tier} onChange={handleChange} className="input-style">
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Dead">Dead</option>
                    </select>
                </div>
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="btn-secondary">Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex items-center">
                    {isSubmitting && <Spinner size="sm" className="mr-2"/>}
                    Save Changes
                </button>
             </div>
        </div>
    )
}

const SalesTab: React.FC<{ sales: Sale[] }> = ({ sales }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (saleDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (saleDate > end) return false;
            }
            return true;
        });
    }, [sales, startDate, endDate]);

    const chartData = useMemo(() => {
        const monthlySales: {[key: string]: number} = {};
        filteredSales.forEach(sale => {
            const monthYear = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlySales[monthYear] = (monthlySales[monthYear] || 0) + sale.amount;
        });
        return Object.entries(monthlySales).map(([name, amount]) => ({name, amount})).reverse();
    }, [filteredSales]);
    
    return (
        <div>
            <div className="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                 <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium">From:</label>
                    <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-style" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium">To:</label>
                    <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-style" />
                </div>
            </div>
            <h4 className="font-semibold mb-2 text-lg">Sales Chart</h4>
            <div style={{width: '100%', height: 250}}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #dee2e6)" className="dark:stroke-[var(--border-dark)]" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${Number(value)/1000}k`}/>
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}/>
                        <Legend />
                        <Bar dataKey="amount" fill="var(--primary-light, #0d6efd)" className="dark:fill-[var(--primary-dark)]" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-lg">Transaction List</h4>
             <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {filteredSales.length > 0 ? filteredSales.map(sale => (
                    <li key={sale.id} className="flex justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                        <span>{new Date(sale.date).toLocaleDateString()}</span>
                        <span className="font-mono font-semibold">₹{sale.amount.toLocaleString('en-IN')}</span>
                    </li>
                )) : <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] italic text-center py-4">No sales found for the selected period.</p>}
            </ul>
        </div>
    )
}

const SentimentIndicator: React.FC<{ sentiment?: Remark['sentiment'] }> = ({ sentiment }) => {
    if (!sentiment) return null;

    const STYLES: { [key in NonNullable<Remark['sentiment']>]: { icon: string, color: string, label: string } } = {
        Positive: { icon: 'fa-smile-beam', color: 'text-green-500', label: 'Positive' },
        Neutral: { icon: 'fa-meh', color: 'text-gray-500 dark:text-gray-400', label: 'Neutral' },
        Negative: { icon: 'fa-frown', color: 'text-red-500', label: 'Negative' },
        Mixed: { icon: 'fa-question-circle', color: 'text-blue-500', label: 'Mixed' }
    };

    const style = STYLES[sentiment];
    if (!style) return null;
    
    return (
        <div className="flex items-center text-xs" title={style.label}>
            <i className={`fas ${style.icon} ${style.color} mr-1.5`}></i>
            <span className={`${style.color}`}>{style.label}</span>
        </div>
    );
};

const RemarksTab: React.FC<{ customer: Customer, remarks: Remark[], onRemarkAdded: () => void }> = ({ customer, remarks, onRemarkAdded }) => {
    const { addRemark, addTask } = useApp();
    const { addToast } = useToast();
    const [newRemark, setNewRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suggestedTask, setSuggestedTask] = useState<{ task: string; dueDate: string } | null>(null);

    // State for Note Summarizer
    const [showSummarizer, setShowSummarizer] = useState(false);
    const [rawNotes, setRawNotes] = useState('');
    const [summaryResult, setSummaryResult] = useState<{ summary: string; actionItems: { task: string; dueDate: string }[] } | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleAddRemark = async () => {
        if(!newRemark.trim()) return;
        setIsSubmitting(true);
        setSuggestedTask(null);
        try {
            await addRemark(customer.id, newRemark);
            addToast('Remark added!', 'success');
            const suggestion = await generateTaskFromRemark(newRemark);
            if (suggestion) {
                setSuggestedTask(suggestion);
            }
            setNewRemark('');
            onRemarkAdded();
        } catch(e) { addToast('Failed to add remark', 'error'); }
        finally { setIsSubmitting(false); }
    }

    const handleAcceptSuggestion = async () => {
        if (!suggestedTask) return;
        try {
            await addTask({
                customerId: customer.id,
                customerName: customer.name,
                task: suggestedTask.task,
                dueDate: new Date(suggestedTask.dueDate).toISOString()
            });
            addToast('Task created from suggestion!', 'success');
            setSuggestedTask(null);
        } catch (e) {
            addToast('Failed to create task.', 'error');
        }
    };
    
    const handleSummarize = async () => {
        if (!rawNotes.trim()) return;
        setIsSummarizing(true);
        setSummaryResult(null);
        try {
            const result = await generateSummaryFromNotes(rawNotes);
            if (result) {
                setSummaryResult(result);
                // Also add the summary as a remark
                const summaryRemark = `**AI Summary of Notes:**\n${result.summary}`;
                await addRemark(customer.id, summaryRemark);
                onRemarkAdded();
            } else {
                addToast('Could not generate summary.', 'info');
            }
        } catch (e) {
            addToast('Error generating summary.', 'error');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleCreateTaskFromSummary = async (actionItem: { task: string; dueDate: string }) => {
        try {
            await addTask({
                customerId: customer.id,
                customerName: customer.name,
                task: actionItem.task,
                dueDate: new Date(actionItem.dueDate).toISOString()
            });
            addToast(`Task "${actionItem.task}" created!`, 'success');
        } catch(e) {
            addToast('Failed to create task.', 'error');
        }
    };


    return (
        <div>
            <div className="border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg mb-4">
                <button 
                    onClick={() => setShowSummarizer(!showSummarizer)} 
                    className="w-full p-3 text-left font-semibold flex justify-between items-center"
                >
                    <span><i className="fas fa-magic-wand-sparkles mr-2 text-purple-500"></i> AI Note Summarizer</span>
                    <i className={`fas fa-chevron-down transition-transform ${showSummarizer ? 'rotate-180' : ''}`}></i>
                </button>
                {showSummarizer && (
                    <div className="p-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] space-y-3">
                        <textarea 
                            value={rawNotes}
                            onChange={e => setRawNotes(e.target.value)}
                            placeholder="Paste your raw meeting or call notes here..."
                            className="input-style"
                            rows={5}
                        />
                        <button onClick={handleSummarize} disabled={isSummarizing || !rawNotes.trim()} className="btn-primary">
                            {isSummarizing ? <><Spinner size="sm" className="mr-2"/> Summarizing...</> : 'Summarize Notes'}
                        </button>
                        {isSummarizing && <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">AI is reading your notes...</p>}
                        {summaryResult && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <h5 className="font-bold">Summary:</h5>
                                    <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                                        <MarkdownRenderer content={summaryResult.summary} />
                                    </div>
                                </div>
                                {summaryResult.actionItems.length > 0 && (
                                    <div>
                                        <h5 className="font-bold">Action Items:</h5>
                                        <ul className="space-y-2">
                                            {summaryResult.actionItems.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                                                    <div>
                                                        <p className="font-medium text-sm">{item.task}</p>
                                                        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <button onClick={() => handleCreateTaskFromSummary(item)} className="btn-secondary-sm">Create Task</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <textarea 
                    value={newRemark}
                    onChange={e => setNewRemark(e.target.value)}
                    placeholder="Add a new remark..."
                    className="input-style mb-2"
                    rows={3}
                />
                <button onClick={handleAddRemark} disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Adding...' : 'Add Remark'}
                </button>
            </div>

            {suggestedTask && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-4 rounded-r-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold flex items-center"><i className="fas fa-lightbulb mr-2"></i>AI Suggestion</p>
                            <p className="text-sm mt-1">Create task: "{suggestedTask.task}"</p>
                            <p className="text-xs">Due: {new Date(suggestedTask.dueDate).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={handleAcceptSuggestion} className="btn-primary text-xs !bg-yellow-600">Create Task</button>
                             <button onClick={() => setSuggestedTask(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl">&times;</button>
                        </div>
                    </div>
                </div>
            )}

            <h4 className="font-semibold mb-2 text-lg">History</h4>
            <ul className="space-y-3 text-sm max-h-80 overflow-y-auto">
                 {remarks.length > 0 ? remarks.map(remark => (
                    <li key={remark.id} className="p-3 border-l-4 border-blue-400 bg-gray-50 dark:bg-white/5 rounded-r-md">
                        <MarkdownRenderer className="prose-p:italic prose-p:my-0" content={remark.remark} />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] text-right">- {remark.user} on {new Date(remark.timestamp).toLocaleString()}</p>
                            <SentimentIndicator sentiment={remark.sentiment} />
                        </div>
                    </li>
                )) : <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] italic text-center py-4">No remarks found.</p>}
            </ul>
        </div>
    )
}

const TasksTab: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { getTasksForCustomer, addTask, toggleTaskComplete } = useApp();
    const { addToast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            const tasksData = await getTasksForCustomer(customerId);
            setTasks(tasksData);
        } catch(e) {
             addToast('Could not fetch tasks.', 'error');
        }
    }, [customerId, getTasksForCustomer, addToast]);
    
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTask = async () => {
        if(!newTaskText.trim() || !newDueDate) return;
        setIsSubmitting(true);
        try {
            await addTask({customerId, task: newTaskText, dueDate: new Date(newDueDate).toISOString() });
            addToast('Task added!', 'success');
            setNewTaskText('');
            setNewDueDate('');
            await fetchTasks();
        } catch(e) {
            addToast('Failed to add task.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleToggleComplete = async (taskId: string) => {
        try {
            await toggleTaskComplete(taskId);
            await fetchTasks();
        } catch (e) {
            addToast('Failed to update task status.', 'error');
        }
    }
    
    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="New task..." className="input-style flex-grow"/>
                <input type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="input-style"/>
                <button onClick={handleAddTask} disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Adding...' : 'Add'}</button>
            </div>
             <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.id} className="flex items-center p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                        <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task.id)} className="h-5 w-5 mr-3"/>
                        <div className="flex-grow">
                            <p className={task.completed ? 'line-through text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]' : ''}>{task.task}</p>
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Due: {new Date(task.dueDate).toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const ActionsTab: React.FC<{ customer: any, onSave: () => void }> = ({ customer, onSave }) => {
    const { addSale, addPayment, addBill } = useApp();
    const { addToast } = useToast();
    const [saleAmount, setSaleAmount] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [saleDate, setSaleDate] = useState(today);
    const [paymentDate, setPaymentDate] = useState(today);
    const [isSubmitting, setIsSubmitting] = useState<'sale' | 'payment' | 'bill' | null>(null);

    const handleAction = async (action: 'sale' | 'payment' | 'bill') => {
        setIsSubmitting(action);
        try {
            if (action === 'sale') {
                if(!saleAmount || !saleDate) {
                    addToast("Amount and date are required.", "error");
                    setIsSubmitting(null);
                    return;
                }
                await addSale(customer.id, parseFloat(saleAmount), new Date(saleDate).toISOString());
                addToast("Sale added!", "success");
                setSaleAmount('');
                setSaleDate(today);
            } else if (action === 'payment') {
                if(!paymentAmount || !paymentDate) {
                     addToast("Amount and date are required.", "error");
                    setIsSubmitting(null);
                    return;
                }
                await addPayment(customer.id, parseFloat(paymentAmount), new Date(paymentDate).toISOString());
                addToast("Payment recorded!", "success");
                setPaymentAmount('');
                setPaymentDate(today);
            } else {
                 if(!billAmount) return;
                await addBill(customer.id, parseFloat(billAmount));
                addToast("Bill added!", "success");
                setBillAmount('');
            }
            onSave();
        } catch(e) {
            addToast(`Failed to perform action.`, "error");
        } finally {
            setIsSubmitting(null);
        }
    }
    
    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2 text-lg">Add Sale</h4>
                <div className="flex flex-wrap gap-2">
                    <input type="number" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} placeholder="Amount" className="input-style flex-grow" />
                    <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="input-style flex-grow" />
                    <button onClick={() => handleAction('sale')} disabled={isSubmitting === 'sale'} className="btn-primary whitespace-nowrap flex-grow sm:flex-grow-0">{isSubmitting === 'sale' ? 'Adding...' : 'Add Sale'}</button>
                </div>
            </div>
             <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2 text-lg">Record Payment</h4>
                <div className="flex flex-wrap gap-2">
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Amount" className="input-style flex-grow" />
                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="input-style flex-grow" />
                    <button onClick={() => handleAction('payment')} disabled={isSubmitting === 'payment'} className="btn-primary whitespace-nowrap flex-grow sm:flex-grow-0">{isSubmitting === 'payment' ? 'Recording...' : 'Record Payment'}</button>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2 text-lg">Add Bill (Outstanding)</h4>
                <div className="flex gap-2">
                    <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="Amount" className="input-style w-full" />
                    <button onClick={() => handleAction('bill')} disabled={isSubmitting === 'bill'} className="btn-primary whitespace-nowrap">{isSubmitting === 'bill' ? 'Adding...' : 'Add Bill'}</button>
                </div>
            </div>
        </div>
    )
}


export const CustomerDetailModal: React.FC = () => {
    const { detailModalCustomer, closeDetailModal, getSalesForCustomer, getRemarksForCustomer, updateCustomer, deleteCustomer, customers } = useApp();
    const { addToast } = useToast();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditMode, setIsEditMode] = useState(false);
    const [sales, setSales] = useState<Sale[]>([]);
    const [remarks, setRemarks] = useState<Remark[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // FIX: Derive customer from the main list to prevent stale data after updates.
    const customer = useMemo(() => {
        if (!detailModalCustomer) return null;
        return customers.find(c => c.id === detailModalCustomer.id) || detailModalCustomer;
    }, [customers, detailModalCustomer]);

    const fetchData = useCallback(async () => {
        if (!customer) return;
        setIsLoading(true);
        try {
            const [salesData, remarksData] = await Promise.all([
                getSalesForCustomer(customer.id),
                getRemarksForCustomer(customer.id),
            ]);
            setSales(salesData);
            setRemarks(remarksData);
        } catch (error) {
            console.error("Failed to fetch customer details", error);
            addToast("Could not load customer details.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [customer, getSalesForCustomer, getRemarksForCustomer, addToast]);

    useEffect(() => {
        fetchData();
        if (detailModalCustomer?.id !== customer?.id) {
            setIsEditMode(false); // Reset edit mode when customer changes
            setActiveTab('overview'); // Reset to overview tab
        }
    }, [customer, detailModalCustomer, fetchData]);

    const handleSave = async (data: CustomerFormData) => {
        if (!customer) return;
        try {
            await updateCustomer(customer.id, data);
            addToast("Customer details updated!", "success");
            setIsEditMode(false);
        } catch(e) {
            addToast("Failed to update details.", "error");
        }
    }
    
    const handleDelete = async () => {
        if(!customer) return;
        if(window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
            try {
                await deleteCustomer(customer.id);
                addToast("Customer deleted.", "success");
                closeDetailModal();
            } catch(e) {
                addToast("Failed to delete customer.", "error");
            }
        }
    }

    if (!customer) return null;

    const TABS = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
        { id: 'sales', label: 'Sales History', icon: 'fa-chart-area' },
        { id: 'remarks', label: 'Remarks', icon: 'fa-comments' },
        { id: 'tasks', label: 'Tasks', icon: 'fa-tasks' },
        { id: 'actions', label: 'Quick Actions', icon: 'fa-bolt' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeDetailModal}>
            <div className="card-base w-full max-w-4xl max-h-[90vh] flex flex-col modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center">
                        <img className="h-12 w-12 rounded-full object-cover" src={customer.avatar} alt={customer.name} />
                        <div className="ml-4">
                            <h3 className="text-xl font-semibold">{customer.name}</h3>
                            <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{customer.district}, {customer.state}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">Delete Customer</button>
                        <button onClick={closeDetailModal} className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:text-red-500 text-xl">
                            <i className="fas fa-times"></i>
                        </button>
                     </div>
                </div>
                 {/* Tabs */}
                <div className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)] flex-shrink-0">
                    <div className="flex space-x-1 p-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsEditMode(false); }}
                                className={`py-2 px-4 font-medium text-sm rounded-md transition-colors duration-200 ${activeTab === tab.id ? 'bg-black/5 dark:bg-white/10 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]' : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <i className={`fas ${tab.icon} mr-2 w-4 text-center`}></i>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Body */}
                <div className="p-6 flex-grow overflow-y-auto">
                   {isLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div> : (
                       <>
                        {activeTab === 'overview' && !isEditMode && <OverviewTab customer={customer} sales={sales} remarks={remarks} onEditMode={() => setIsEditMode(true)} />}
                        {isEditMode && <EditDetailsTab customer={customer} onCancel={() => setIsEditMode(false)} onSave={handleSave}/>}
                        {activeTab === 'sales' && <SalesTab sales={sales}/>}
                        {activeTab === 'remarks' && <RemarksTab customer={customer} remarks={remarks} onRemarkAdded={fetchData} />}
                        {activeTab === 'tasks' && <TasksTab customerId={customer.id}/>}
                        {activeTab === 'actions' && <ActionsTab customer={customer} onSave={fetchData} />}
                       </>
                   )}
                </div>
            </div>
             <style>{`
                .input-style { 
                  display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem;
                  background-color: var(--card-bg-light); border: 1px solid var(--border-light);
                  color: var(--text-primary-light);
                  transition: border-color 0.2s, box-shadow 0.2s;
                }
                .dark .input-style { background-color: var(--card-bg-dark); border-color: var(--border-dark); color: var(--text-primary-dark); }
                .input-style:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 2px var(--primary-light, #0d6efd)30; }
                .dark .input-style:focus { border-color: var(--primary-dark); box-shadow: 0 0 0 2px var(--primary-dark, #2f81f7)30; }
                
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: var(--primary-light, #0d6efd); border-radius: 0.375rem; transition: background-color 0.2s; }
                .dark .btn-primary { background-color: var(--primary-dark, #2f81f7); }
                .btn-primary:hover { background-color: var(--primary-hover-light, #0b5ed7); }
                .dark .btn-primary:hover { background-color: var(--primary-hover-dark, #58a6ff); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; border: 1px solid var(--border-light); border-radius: 0.375rem; background-color: var(--card-bg-light); transition: background-color 0.2s, border-color 0.2s; }
                .dark .btn-secondary { border-color: var(--border-dark); background-color: var(--card-bg-dark); }
                .btn-secondary:hover { background-color: #f8f9fa; border-color: #ced4da; }
                .dark .btn-secondary:hover { background-color: #ffffff10; border-color: #484f58; }

                .btn-secondary-sm { padding: 0.3rem 0.8rem; font-size: 0.8rem; font-weight: 500; border: 1px solid var(--border-light); border-radius: 0.375rem; background-color: var(--card-bg-light); transition: background-color 0.2s, border-color 0.2s; }
                .dark .btn-secondary-sm { border-color: var(--border-dark); background-color: var(--card-bg-dark); }
                .btn-secondary-sm:hover { background-color: #f8f9fa; border-color: #ced4da; }
                .dark .btn-secondary-sm:hover { background-color: #ffffff10; border-color: #484f58; }
            `}</style>
        </div>
    );
};

export default CustomerDetailModal;