// components/analytics/AnalyticsFilters.tsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const AnalyticsFilters: React.FC = () => {
    const { customers, analyticsFilters, setAnalyticsFilters } = useApp();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAnalyticsFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, [name]: value }
        }));
    };
    
    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAnalyticsFilters(prev => ({
            ...prev,
            selectedCustomer: e.target.value
        }));
    };

    return (
        <div className="card-base p-4 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="start" className="text-sm font-medium">From:</label>
                <input
                    type="date"
                    id="start"
                    name="start"
                    value={analyticsFilters.dateRange.start}
                    onChange={handleDateChange}
                    className="input-style"
                />
            </div>
            <div className="flex items-center gap-2">
                 <label htmlFor="end" className="text-sm font-medium">To:</label>
                <input
                    type="date"
                    id="end"
                    name="end"
                    value={analyticsFilters.dateRange.end}
                    onChange={handleDateChange}
                    className="input-style"
                />
            </div>
             <div className="flex items-center gap-2 flex-grow">
                 <label htmlFor="customer" className="text-sm font-medium">Client:</label>
                <select
                    id="customer"
                    name="customer"
                    value={analyticsFilters.selectedCustomer}
                    onChange={handleCustomerChange}
                    className="input-style w-full max-w-xs"
                >
                    <option value="all">All Customers</option>
                    {customers.sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
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
            `}</style>
        </div>
    );
};

export default AnalyticsFilters;