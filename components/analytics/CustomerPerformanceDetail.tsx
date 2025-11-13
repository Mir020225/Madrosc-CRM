// components/analytics/CustomerPerformanceDetail.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer, Sale } from '../../types';
import StatCard from './StatCard';
import Skeleton from '../ui/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar, BarChart } from 'recharts';

const TrendIndicator: React.FC<{change: number}> = ({ change }) => {
    if (change > 0) return <span className="text-green-500"><i className="fas fa-arrow-up mr-1"></i>{change.toFixed(1)}%</span>;
    if (change < 0) return <span className="text-red-500"><i className="fas fa-arrow-down mr-1"></i>{Math.abs(change).toFixed(1)}%</span>;
    return <span className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">-</span>;
};


const CustomerPerformanceDetail: React.FC<{ customer: Customer }> = ({ customer }) => {
    const { analyticsFilters, getSalesForCustomer } = useApp();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const salesData = await getSalesForCustomer(customer.id);
            setSales(salesData);
            setLoading(false);
        };
        fetchData();
    }, [customer, getSalesForCustomer]);

    const performanceData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const salesInRange = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const monthlyData: { [key: string]: { sales: number; orders: number } } = {};
        salesInRange.forEach(sale => {
            const monthYear = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { sales: 0, orders: 0 };
            }
            monthlyData[monthYear].sales += sale.amount;
            monthlyData[monthYear].orders++;
        });

        const sortedMonths = Object.keys(monthlyData).sort((a,b) => new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime());
        
        let lastMonthSales = 0;
        const tableData = sortedMonths.map(month => {
            const data = monthlyData[month];
            const change = lastMonthSales > 0 ? ((data.sales - lastMonthSales) / lastMonthSales) * 100 : 0;
            lastMonthSales = data.sales;
            return { month, ...data, change };
        });

        const totalSales = salesInRange.reduce((sum, s) => sum + s.amount, 0);
        const totalOrders = salesInRange.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        return {
            kpis: { totalSales, totalOrders, avgOrderValue },
            chartData: tableData.map(d => ({name: d.month, sales: d.sales})),
            tableData: tableData.reverse(),
        }

    }, [sales, analyticsFilters.dateRange]);
    
    if (loading) return <Skeleton className="h-96 w-full" />;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon="fa-dollar-sign" label="Total Sales in Period" value={`₹${performanceData.kpis.totalSales.toLocaleString('en-IN')}`} color="text-green-500" />
                <StatCard icon="fa-box" label="Total Orders in Period" value={performanceData.kpis.totalOrders} color="text-blue-500" />
                <StatCard icon="fa-receipt" label="Average Order Value" value={`₹${performanceData.kpis.avgOrderValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-base p-4 h-[400px]">
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4">Sales Trend</h3>
                     <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={performanceData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #dee2e6)" className="dark:stroke-[var(--border-dark)]" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${Number(value)/1000}k`}/>
                            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}/>
                            <Legend />
                            <Bar dataKey="sales" fill="var(--primary-light, #0d6efd)" className="dark:fill-[var(--primary-dark)]" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="card-base p-4">
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4">Monthly Performance</h3>
                     <div className="overflow-x-auto max-h-[340px]">
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-white/5 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Month</th>
                                    <th className="p-3 text-right font-semibold">Sales</th>
                                    <th className="p-3 text-center font-semibold">Orders</th>
                                    <th className="p-3 text-center font-semibold">% Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.tableData.map(row => (
                                     <tr key={row.month} className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                                        <td className="p-3 font-semibold">{row.month}</td>
                                        <td className="p-3 text-right font-mono">₹{row.sales.toLocaleString('en-IN')}</td>
                                        <td className="p-3 text-center font-mono">{row.orders}</td>
                                        <td className="p-3 text-center font-semibold"><TrendIndicator change={row.change} /></td>
                                     </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPerformanceDetail;