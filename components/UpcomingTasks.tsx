// components/UpcomingTasks.tsx
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Task } from '../types';
import TableSkeleton from './skeletons/TableSkeleton';

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { toggleTaskComplete } = useApp();
    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

    return (
        <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskComplete(task.id)}
                className="mt-1 form-checkbox h-5 w-5 text-[var(--primary-light)] dark:text-[var(--primary-dark)] border-gray-300 rounded focus:ring-[var(--primary-light)] dark:focus:ring-[var(--primary-dark)] dark:bg-gray-600 dark:border-gray-500"
            />
            <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]' : 'text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]'}`}>
                    {task.task}
                </p>
                <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    For: <span className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{task.customerName}</span>
                </p>
                <p className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};


const UpcomingTasks: React.FC = () => {
    const { tasks, loading, openAddTaskModal } = useApp();
    const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming'>('today');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < todayStart && !t.completed);
    const todayTasks = tasks.filter(t => new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= todayEnd && !t.completed);
    const upcomingTasks = tasks.filter(t => new Date(t.dueDate) > todayEnd && !t.completed);

    const TABS = {
        overdue: { label: 'Overdue', data: overdueTasks, color: 'border-red-500 text-red-500' },
        today: { label: 'Today', data: todayTasks, color: 'border-blue-500 text-blue-500' },
        upcoming: { label: 'Upcoming', data: upcomingTasks, color: 'border-green-500 text-green-500' },
    };

    const currentTasks = TABS[activeTab].data;

    return (
        <div className="card-base p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">Tasks & Reminders</h3>
                 <button onClick={() => openAddTaskModal()} className="btn-primary-sm">
                    <i className="fas fa-plus mr-1"></i> New
                </button>
            </div>

            <div className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {Object.entries(TABS).map(([key, tab]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`${
                                activeTab === key
                                    ? tab.color
                                    : 'border-transparent text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            {tab.label}
                            {tab.data.length > 0 && <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === key ? tab.color.replace('border-', 'bg-').replace('text-','text-white dark:text-gray-900') : 'bg-gray-200 dark:bg-gray-600'}`}>{tab.data.length}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 mt-4 pr-2">
                {loading ? <TableSkeleton rows={4} cols={1} /> :
                    currentTasks.length > 0 ? (
                        currentTasks.map(task => <TaskItem key={task.id} task={task} />)
                    ) : (
                        <div className="text-center py-10 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                            <i className="fas fa-check-circle text-3xl mb-2"></i>
                            <p>No {activeTab} tasks. All clear!</p>
                        </div>
                    )}
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

export default UpcomingTasks;