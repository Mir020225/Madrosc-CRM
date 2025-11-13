// components/GoalsTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Customer, Sale, Goal, Milestone } from '../types';
import { suggestGoalsAndMilestones, AIGoalSuggestion } from '../services/geminiService';
import Spinner from './ui/Spinner';

const GoalProgressBar: React.FC<{ current: number, target: number }> = ({ current, target }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const MilestoneItem: React.FC<{ milestone: Milestone, onToggle: (id: string) => void }> = ({ milestone, onToggle }) => {
    return (
        <div className="flex items-center space-x-3 py-1">
            <input
                type="checkbox"
                checked={milestone.completed}
                onChange={() => onToggle(milestone.id)}
                className="form-checkbox h-4 w-4 text-[var(--primary-light)] dark:text-[var(--primary-dark)] border-gray-300 rounded focus:ring-0"
            />
            <div className="flex-1">
                <p className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : ''}`}>{milestone.description}</p>
                <p className="text-xs text-gray-400">Due: {new Date(milestone.targetDate).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const AddGoalForm: React.FC<{ customerId: string, onGoalAdded: () => void }> = ({ customerId, onGoalAdded }) => {
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addGoal } = useApp();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !targetAmount || !deadline) {
            addToast('All fields are required.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await addGoal({
                customerId,
                title,
                targetAmount: parseFloat(targetAmount),
                deadline: new Date(deadline).toISOString()
            });
            addToast('Goal added successfully!', 'success');
            setTitle('');
            setTargetAmount('');
            setDeadline('');
            onGoalAdded();
        } catch (err) {
            addToast('Failed to add goal.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3">
             <h4 className="font-semibold text-lg">Add New Goal</h4>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal Title (e.g., Q4 Sales Target)" className="input-style" />
            <div className="flex gap-2">
                <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount (₹)" className="input-style" />
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input-style" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Spinner size="sm"/> : 'Save Goal'}
            </button>
        </form>
    );
};


const GoalsTab: React.FC<{ customer: Customer, sales: Sale[] }> = ({ customer, sales }) => {
    const { getGoalsForCustomer, deleteGoal, addGoal, addMilestone, toggleMilestoneComplete } = useApp();
    const { addToast } = useToast();

    const [goals, setGoals] = useState<Goal[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIGoalSuggestion[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { goals: goalsData, milestones: milestonesData } = await getGoalsForCustomer(customer.id);
            setGoals(goalsData);
            setMilestones(milestonesData);
        } catch (err) {
            addToast('Could not fetch goals.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [customer.id, getGoalsForCustomer, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleGetAiSuggestions = async () => {
        setIsAiLoading(true);
        setAiSuggestions([]);
        try {
            const suggestions = await suggestGoalsAndMilestones(customer, sales);
            setAiSuggestions(suggestions);
        } catch (err) {
            addToast('Could not get AI suggestions.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleAcceptSuggestion = async (suggestion: AIGoalSuggestion) => {
        try {
            const newGoal = await addGoal({
                customerId: customer.id,
                title: suggestion.title,
                targetAmount: suggestion.targetAmount,
                deadline: suggestion.deadline
            });
            
            for (const ms of suggestion.milestones) {
                await addMilestone({
                    goalId: newGoal.id,
                    description: ms.description,
                    targetDate: ms.targetDate
                });
            }
            
            addToast(`Goal "${suggestion.title}" added!`, 'success');
            setAiSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
            fetchData();
        } catch (err) {
            addToast('Failed to add suggested goal.', 'error');
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if(window.confirm("Are you sure you want to delete this goal and its milestones?")) {
            try {
                await deleteGoal(goalId);
                addToast('Goal deleted.', 'success');
                fetchData();
            } catch (err) {
                addToast('Failed to delete goal.', 'error');
            }
        }
    };
    
    const handleToggleMilestone = async (milestoneId: string) => {
        try {
            await toggleMilestoneComplete(milestoneId);
            fetchData(); // Refetch to update list
        } catch(err) {
            addToast('Failed to update milestone.', 'error');
        }
    }

    if(isLoading) return <div className="flex justify-center items-center h-48"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <AddGoalForm customerId={customer.id} onGoalAdded={fetchData} />
            
             <div className="p-4 bg-purple-50 dark:bg-purple-900/40 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg"><i className="fas fa-magic-wand-sparkles mr-2 text-purple-500"></i> AI Goal Suggestions</h4>
                     <button onClick={handleGetAiSuggestions} disabled={isAiLoading} className="btn-secondary-sm">
                        {isAiLoading ? <Spinner size="sm" /> : 'Get Suggestions'}
                    </button>
                </div>
                {isAiLoading && <p className="text-sm text-center mt-2">AI is analyzing customer data...</p>}
                 {aiSuggestions.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {aiSuggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-md">
                                <p className="font-bold">{s.title}</p>
                                <p className="text-sm">Target: ₹{s.targetAmount.toLocaleString()}</p>
                                <p className="text-sm">Deadline: {new Date(s.deadline).toLocaleDateString()}</p>
                                <ul className="list-disc pl-5 mt-1 text-xs">
                                    {s.milestones.map((m, j) => <li key={j}>{m.description}</li>)}
                                </ul>
                                <button onClick={() => handleAcceptSuggestion(s)} className="btn-primary-sm mt-2 w-full">Accept Suggestion</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {goals.map(goal => {
                    const goalMilestones = milestones.filter(m => m.goalId === goal.id);
                    const completedMilestones = goalMilestones.filter(m => m.completed).length;
                    return (
                         <div key={goal.id} className="card-base p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg">{goal.title}</h4>
                                    <p className="text-sm text-gray-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                                </div>
                                 <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                            </div>
                            <div className="mt-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>₹{goal.currentAmount.toLocaleString()}</span>
                                    <span className="text-gray-500">Target: ₹{goal.targetAmount.toLocaleString()}</span>
                                </div>
                                <GoalProgressBar current={goal.currentAmount} target={goal.targetAmount} />
                            </div>
                            <div className="mt-3">
                                <h5 className="font-semibold text-sm">Milestones ({completedMilestones}/{goalMilestones.length})</h5>
                                 <div className="mt-1">
                                    {goalMilestones.map(ms => <MilestoneItem key={ms.id} milestone={ms} onToggle={handleToggleMilestone} />)}
                                </div>
                            </div>
                         </div>
                    )
                })}
            </div>
             <style>{`
                .btn-primary-sm { 
                  padding: 0.3rem 0.8rem; font-size: 0.8rem; font-weight: 500; color: white; background-color: var(--primary-light, #0d6efd); 
                  border-radius: 0.375rem; transition: background-color 0.2s; 
                }
                .dark .btn-primary-sm { background-color: var(--primary-dark, #2f81f7); }
                .btn-primary-sm:hover { background-color: var(--primary-hover-light, #0b5ed7); }
                .dark .btn-primary-sm:hover { background-color: var(--primary-hover-dark, #58a6ff); }
            `}</style>
        </div>
    );
};

export default GoalsTab;
