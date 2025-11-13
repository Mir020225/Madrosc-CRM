// components/analytics/SalesByStateChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sale, Customer } from '../../types';
import Skeleton from '../ui/Skeleton';

const SalesByStateChart: React.FC = () => {
    const { customers, getAllSales, analyticsFilters } = useApp();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            const salesData = await getAllSales();
            setAllSales(salesData);
            setLoading(false);
        };
        fetchSales();
    }, [getAllSales]);

    const chartData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        
        const salesInRange = allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const customerMap = new Map<string, Customer>(customers.map(c => [c.id, c]));
        const salesByState: { [key: string]: number } = {};

        salesInRange.forEach(sale => {
            const customer = customerMap.get(sale.customerId);
            if(customer) {
                salesByState[customer.state] = (salesByState[customer.state] || 0) + sale.amount;
            }
        });

        return Object.entries(salesByState)
            .map(([name, sales]) => ({ name, sales }))
            .filter(item => item.sales > 0)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10); // Show top 10 states
    }, [customers, allSales, analyticsFilters.dateRange]);
    
    if (loading) {
        return (
            <div className="h-[400px]">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-[calc(100%-2rem)] w-full" />
            </div>
        );
    }

    return (
        <div className="h-[400px]">
             <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4 px-2">Top States by Sales (Period)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #dee2e6)" className="dark:stroke-[var(--border-dark)]" />
                    <XAxis type="number" tickFormatter={(value) => `₹${Number(value)/1000}k`} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]} />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--primary-light, #8884d8)" className="dark:fill-[var(--primary-dark)]" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesByStateChart;