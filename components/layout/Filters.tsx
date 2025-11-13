// components/layout/Filters.tsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer, CustomerTier } from '../../types';
import { indianStates } from '../../data/indianStatesAndDistricts';
import debounce from 'lodash.debounce';

const Filters: React.FC = () => {
    const { searchTerm, setSearchTerm, filters, setFilter } = useApp();

    const debouncedSetSearch = debounce(value => setSearchTerm(value), 300);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetSearch(e.target.value);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter(name as keyof typeof filters, value as CustomerTier | 'asc' | 'desc' | keyof Customer);
    };
    
    return (
        <div className="card-base p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <i className="fas fa-search text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]"></i>
                    </span>
                    <input
                        type="text"
                        name="searchTerm"
                        placeholder="Search name, contact, location..."
                        defaultValue={searchTerm}
                        onChange={handleSearchChange}
                        className="input-style pl-10"
                    />
                </div>

                <select
                    name="tier"
                    value={filters.tier}
                    onChange={handleFilterChange}
                    className="input-style"
                >
                    <option value="">All Tiers</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Dead">Dead</option>
                </select>

                <select
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className="input-style"
                >
                    <option value="">All States</option>
                    {indianStates.sort().map(state => <option key={state} value={state}>{state}</option>)}
                </select>

                <div className="flex gap-2">
                    <select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        className="input-style w-2/3"
                    >
                        <option value="lastUpdated">Last Updated</option>
                        <option value="name">Name</option>
                        <option value="salesThisMonth">Month's Sales</option>
                        <option value="outstandingBalance">Balance</option>
                        <option value="daysSinceLastOrder">Last Order</option>
                    </select>
                     <select
                        name="sortOrder"
                        value={filters.sortOrder}
                        onChange={handleFilterChange}
                        className="input-style w-1/3"
                    >
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                    </select>
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
            `}</style>
        </div>
    );
};

export default Filters;