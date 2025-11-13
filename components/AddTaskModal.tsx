// components/AddTaskModal.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import Spinner from './ui/Spinner';

const AddTaskModal: React.FC = () => {
    const { closeAddTaskModal, addTask, customers, addTaskInitialData } = useApp();
    const { addToast } = useToast();
    
    const [customerId, setCustomerId] = useState(addTaskInitialData?.customerId || '');
    const [task, setTask] = useState(addTaskInitialData?.task || '');
    const [dueDate, setDueDate] = useState(addTaskInitialData?.dueDate || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ customerId?: string; task?: string; dueDate?: string }>({});

    useEffect(() => {
        if (addTaskInitialData) {
            setCustomerId(addTaskInitialData.customerId);
            setTask(addTaskInitialData.task);
            setDueDate(addTaskInitialData.dueDate);
        }
    }, [addTaskInitialData]);

    const validate = () => {
        const newErrors: { customerId?: string; task?: string; dueDate?: string } = {};
        if (!customerId) newErrors.customerId = "Please select a customer.";
        if (!task.trim()) newErrors.task = "Task description is required.";
        if (!dueDate) newErrors.dueDate = "Due date is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const customerName = customers.find(c => c.id === customerId)?.name;
            await addTask({ customerId, customerName, task, dueDate: new Date(dueDate).toISOString() });
            addToast('Task added successfully!', 'success');
            closeAddTaskModal();
        } catch (error) {
            addToast('Failed to add task.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeAddTaskModal}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Add New Task</h3>
                    <button onClick={closeAddTaskModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Customer</label>
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full input-style">
                                <option value="">Select a customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Task Description</label>
                            <textarea value={task} onChange={e => setTask(e.target.value)} className="w-full input-style" rows={3}></textarea>
                            {errors.task && <p className="text-red-500 text-xs mt-1">{errors.task}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full input-style" />
                            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                        </div>
                    </div>
                     <div className="p-5 border-t dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={closeAddTaskModal} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center">
                             {isSubmitting && <Spinner size="sm" className="mr-2" />}
                            {isSubmitting ? 'Saving...' : 'Add Task'}
                        </button>
                    </div>
                </form>
                 <style>{`
                    .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; background-color: white; }
                    .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                    .input-style:focus { outline: none; box-shadow: 0 0 0 2px #3B82F6; }
                    .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #2563EB; border-radius: 0.375rem; }
                    .btn-primary:hover { background-color: #1D4ED8; }
                    .btn-primary:disabled { background-color: #93C5FD; cursor: not-allowed; }
                    .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
                `}</style>
            </div>
        </div>
    );
};

export default AddTaskModal;