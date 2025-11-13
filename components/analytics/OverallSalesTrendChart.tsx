// components/analytics/OverallSalesTrendChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Skeleton from '../ui/Skeleton';

const OverallSalesTrendChart: React.FC = () => {
    const { getAllSales, analyticsFilters } = useApp();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const salesData = await getAllSales();
            setSales(salesData);
            setLoading(false);
        };
        fetchData();
    }, [getAllSales]);


    const chartData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const salesInRange = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
        
        const monthlySales: { [key: string]: number } = {};
        salesInRange.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthlySales[monthYear] = (monthlySales[monthYear] || 0) + sale.amount;
        });

        const sortedMonths = Object.keys(monthlySales).sort((a,b) => {
            const dateA = new Date(`01 ${a}`);
            const dateB = new Date(`01 ${b}`);
            return dateA.getTime() - dateB.getTime();
        });
        
        return sortedMonths.map(month => ({
            name: month,
            sales: monthlySales[month]
        }));
    }, [sales, analyticsFilters.dateRange]);
    
    if (loading) {
        return <div className="h-[400px]">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-full w-full" />
        </div>
    }

    return (
        <div className="h-[400px]">
             <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4 px-2">Overall Sales Trend</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #dee2e6)" className="dark:stroke-[var(--border-dark)]" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${Number(value)/1000}k`} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="var(--primary-light, #8884d8)" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OverallSalesTrendChart;