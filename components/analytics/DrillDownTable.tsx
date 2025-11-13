// components/analytics/DrillDownTable.tsx
import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer } from '../../types';

const DrillDownTable: React.FC = () => {
    const { customers, openDetailModal } = useApp();
    const [sortKey, setSortKey] = useState<keyof Customer>('outstandingBalance');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortedCustomers = useMemo(() => {
        return [...customers].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            let comparison = 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [customers, sortKey, sortOrder]);
    
    const handleSort = (key: keyof Customer) => {
        if(sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };
    
    const headers: {key: keyof Customer; label: string}[] = [
        { key: 'name', label: 'Customer' },
        { key: 'outstandingBalance', label: 'Outstanding' },
        { key: 'daysSinceLastOrder', label: 'Last Order (Days)' },
        { key: 'avg6MoSales', label: '6mo Avg Sales' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-2">Customer Analysis Table</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {headers.map(header => (
                                <th key={header.key} scope="col" className="p-3 cursor-pointer" onClick={() => handleSort(header.key)}>
                                    {header.label}
                                    {sortKey === header.key && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2`}></i>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCustomers.slice(0, 7).map(customer => (
                             <tr key={customer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:underline" onClick={() => openDetailModal(customer)}>{customer.name}</p>
                                    <p className="text-xs text-gray-500">{customer.district}</p>
                                </td>
                                <td className="p-3 font-mono text-red-500">₹{customer.outstandingBalance.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-center">{customer.daysSinceLastOrder}</td>
                                <td className="p-3 font-mono">₹{customer.avg6MoSales.toLocaleString('en-IN')}</td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrillDownTable;
