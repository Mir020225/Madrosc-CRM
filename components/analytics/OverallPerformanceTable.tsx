// components/analytics/OverallPerformanceTable.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';
import Skeleton from '../ui/Skeleton';

const TrendIndicator: React.FC<{change: number}> = ({ change }) => {
    if (change > 0) return <span className="text-green-500"><i className="fas fa-arrow-up mr-1"></i>{change.toFixed(1)}%</span>;
    if (change < 0) return <span className="text-red-500"><i className="fas fa-arrow-down mr-1"></i>{Math.abs(change).toFixed(1)}%</span>;
    return <span className="text-gray-500">-</span>;
};

const OverallPerformanceTable: React.FC = () => {
    const { getAllSales, analyticsFilters } = useApp();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const salesData = await getAllSales();
            setAllSales(salesData);
            setLoading(false);
        };
        fetchData();
    }, [getAllSales]);

    const performanceData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const salesInRange = allSales.filter(s => {
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
        const tableData = sortedMonths.map((month, index) => {
            const data = monthlyData[month];
            const change = index > 0 && lastMonthSales > 0 ? ((data.sales - lastMonthSales) / lastMonthSales) * 100 : 0;
            lastMonthSales = data.sales;
            return { month, ...data, change };
        });

        return tableData.reverse();
    }, [allSales, analyticsFilters.dateRange]);
    
    if (loading) {
        return <div className="h-[400px]">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-[340px] w-full" />
        </div>
    }

    return (
         <div className="h-[400px] flex flex-col">
            <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4">Overall Monthly Performance</h3>
             <div className="overflow-y-auto flex-grow">
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-white/5 sticky top-0">
                        <tr>
                            <th className="p-3 text-left font-semibold">Month</th>
                            <th className="p-3 text-right font-semibold">Total Sales</th>
                            <th className="p-3 text-center font-semibold">Total Orders</th>
                            <th className="p-3 text-center font-semibold">% Change (MoM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData.length > 0 ? performanceData.map(row => (
                             <tr key={row.month} className="border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
                                <td className="p-3 font-semibold">{row.month}</td>
                                <td className="p-3 text-right font-mono">₹{row.sales.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-center font-mono">{row.orders}</td>
                                <td className="p-3 text-center font-semibold"><TrendIndicator change={row.change} /></td>
                             </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                                    <p>No sales data for the selected period.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverallPerformanceTable;