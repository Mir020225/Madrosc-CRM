

import React from 'react';
import { useApp } from '../contexts/AppContext';
import TableSkeleton from './skeletons/TableSkeleton';
import { Customer } from '../types';

const CustomerRow: React.FC<{ customer: Customer }> = ({ customer }) => {
    const { openDetailModal } = useApp();
    const TIER_STYLES: { [key in Customer['tier']]: string } = {
        Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        Silver: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        Bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
        Dead: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    };

    return (
        <tr 
            className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            onClick={() => openDetailModal(customer)}
            style={{ cursor: 'pointer' }}
        >
            <td className="p-4">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800" src={customer.avatar} alt={customer.name} />
                    <div className="ml-4">
                        <p className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{customer.name}</p>
                        <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{customer.contact}</p>
                        {customer.alternateContact && <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Alt: {customer.alternateContact}</p>}
                        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">{customer.district}, {customer.state}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TIER_STYLES[customer.tier]}`}>
                    {customer.tier}
                </span>
            </td>
            <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">
                ₹{customer.salesThisMonth.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-right font-mono text-red-600 dark:text-red-400">
                ₹{customer.outstandingBalance.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                {customer.daysSinceLastOrder} days
            </td>
            <td className="p-4 text-center">
                <button
                    className="text-sm font-medium text-[var(--primary-light)] dark:text-[var(--primary-dark)] hover:underline"
                >
                    View Details
                </button>
            </td>
        </tr>
    );
};


const CustomerTable: React.FC = () => {
    const { filteredCustomers: customers, loading } = useApp();

    return (
        <div className="card-base p-4">
             <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4 px-2">Customer Overview</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-white/5">
                        <tr>
                            <th scope="col" className="p-4 font-semibold min-w-[250px]">Customer</th>
                            <th scope="col" className="p-4 font-semibold text-center">Tier</th>
                            <th scope="col" className="p-4 font-semibold text-right">Month's Sales</th>
                            <th scope="col" className="p-4 font-semibold text-right">Balance</th>
                            <th scope="col" className="p-4 font-semibold text-center">Last Order</th>
                            <th scope="col" className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <TableSkeleton rows={5} cols={6} /> : customers.map(customer => (
                            <CustomerRow key={customer.id} customer={customer} />
                        ))}
                    </tbody>
                </table>
            </div>
             {!loading && customers.length === 0 && (
                <div className="text-center py-16 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    <i className="fas fa-users-slash text-4xl mb-3"></i>
                    <p className="font-medium">No customers found.</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;