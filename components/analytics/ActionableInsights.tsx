// components/analytics/ActionableInsights.tsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer } from '../../types';

const InsightCategory: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="card-base p-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left flex justify-between items-center">
                <h4 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{title}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2.5 py-0.5 rounded-full">{count} Clients</span>
                    <i className={`fas fa-chevron-down transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                </div>
            </button>
            {isOpen && <div className="mt-4 max-h-48 overflow-y-auto">{children}</div>}
        </div>
    );
};

const CustomerRow: React.FC<{customer: Customer, metric: React.ReactNode, action?: React.ReactNode}> = ({customer, metric, action}) => {
    const { openDetailModal } = useApp();
    return (
        <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5">
            <div onClick={() => openDetailModal(customer)} className="cursor-pointer flex-grow">
                <p className="font-semibold">{customer.name}</p>
                <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{customer.district}, {customer.state}</p>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-sm font-mono text-right">{metric}</p>
                {action}
            </div>
        </div>
    );
}

const ActionableInsights: React.FC = () => {
    const { customers, openAddTaskModal } = useApp();

    const insights = useMemo(() => {
        const noSalesThisMonth = customers.filter(c => c.salesThisMonth === 0 && c.tier !== 'Dead');
        const salesBelowAvg = customers.filter(c => c.salesThisMonth > 0 && c.salesThisMonth < c.avg6MoSales);
        const inactive60days = customers.filter(c => c.daysSinceLastOrder > 60 && c.tier !== 'Dead');
        const churnRisk = customers.filter(c => c.tier !== 'Dead' && c.salesThisMonth < (c.avg6MoSales * 0.5));
        const engagementOpportunities = customers.filter(c => 
            (c.tier === 'Gold' || c.tier === 'Silver') && 
            c.daysSinceLastOrder > 30 &&
            c.daysSinceLastOrder <= 60
        );

        return { noSalesThisMonth, salesBelowAvg, inactive60days, churnRisk, engagementOpportunities };
    }, [customers]);

    return (
        <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4">Actionable Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InsightCategory title="Engagement Opportunities" count={insights.engagementOpportunities.length}>
                    {insights.engagementOpportunities.map(c => {
                        const handleCreateTask = () => {
                            const dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days
                            openAddTaskModal({
                                customerId: c.id,
                                task: `Schedule a check-in call with ${c.name}`,
                                dueDate: dueDate.toISOString().slice(0, 16) // Format for datetime-local
                            });
                        };
                        return <CustomerRow 
                                key={c.id} 
                                customer={c} 
                                metric={`${c.daysSinceLastOrder} days inactive`} 
                                action={<button onClick={handleCreateTask} className="btn-secondary-sm whitespace-nowrap">Create Task</button>}
                               />
                    })}
                </InsightCategory>
                <InsightCategory title="No Sales This Month" count={insights.noSalesThisMonth.length}>
                    {insights.noSalesThisMonth.map(c => <CustomerRow key={c.id} customer={c} metric={`Avg: ₹${c.avg6MoSales.toLocaleString('en-IN')}`} />)}
                </InsightCategory>
                <InsightCategory title="Sales Below Average" count={insights.salesBelowAvg.length}>
                     {insights.salesBelowAvg.map(c => <CustomerRow key={c.id} customer={c} metric={`↓ from ₹${c.avg6MoSales.toLocaleString('en-IN')}`} />)}
                </InsightCategory>
                <InsightCategory title="Inactive (60+ Days)" count={insights.inactive60days.length}>
                     {insights.inactive60days.map(c => <CustomerRow key={c.id} customer={c} metric={`${c.daysSinceLastOrder} days`} />)}
                </InsightCategory>
                <InsightCategory title="Potential Churn Risk" count={insights.churnRisk.length}>
                    {insights.churnRisk.map(c => <CustomerRow key={c.id} customer={c} metric={`Sale: ₹${c.salesThisMonth.toLocaleString('en-IN')}`} />)}
                </InsightCategory>
            </div>
             <style>{`
                 .btn-secondary-sm { padding: 0.3rem 0.8rem; font-size: 0.8rem; font-weight: 500; border: 1px solid var(--border-light); border-radius: 0.375rem; background-color: var(--card-bg-light); transition: background-color 0.2s, border-color 0.2s; }
                .dark .btn-secondary-sm { border-color: var(--border-dark); background-color: var(--card-bg-dark); }
                .btn-secondary-sm:hover { background-color: #f8f9fa; border-color: #ced4da; }
                .dark .btn-secondary-sm:hover { background-color: #ffffff10; border-color: #484f58; }
            `}</style>
        </div>
    );
};

export default ActionableInsights;