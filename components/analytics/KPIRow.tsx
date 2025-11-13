// components/analytics/KPIRow.tsx
import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import { useApp } from '../../contexts/AppContext';
import Skeleton from '../ui/Skeleton';
import { Sale } from '../../types';
import FadeIn from '../ui/FadeIn';

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
        </div>
    </div>
);

const KPIRow: React.FC = () => {
    const { customers, loading, getAllSales, analyticsFilters } = useApp();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            setSalesLoading(true);
            const salesData = await getAllSales();
            setAllSales(salesData);
            setSalesLoading(false);
        };
        fetchSales();
    }, [getAllSales]);

    const dateFilteredSales = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        if (!start || !end) return allSales;

        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        
        return allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
    }, [allSales, analyticsFilters.dateRange]);

    const kpis = useMemo(() => {
        const activeCustomerIds = new Set(dateFilteredSales.map(sale => sale.customerId));

        const totalSales = dateFilteredSales.reduce((sum, sale) => sum + sale.amount, 0);

        const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

        return {
            totalCustomers: customers.length,
            activeCustomers: activeCustomerIds.size,
            totalSales,
            totalOutstanding
        };

    }, [customers, dateFilteredSales]);

    if (loading || salesLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                icon="fa-users" 
                label="Total Clients" 
                value={kpis.totalCustomers} 
                color="text-blue-500"
            />
            <StatCard 
                icon="fa-user-check" 
                label="Active Clients in Period" 
                value={kpis.activeCustomers} 
                color="text-green-500"
            />
            <StatCard 
                icon="fa-chart-line" 
                label="Sales in Period" 
                value={`₹${(kpis.totalSales / 1000).toFixed(1)}k`}
                color="text-purple-500"
            />
            <StatCard 
                icon="fa-file-invoice-dollar" 
                label="Total Outstanding" 
                value={`₹${(kpis.totalOutstanding / 1000).toFixed(1)}k`}
                color="text-red-500"
            />
        </div>
    );
};

export default KPIRow;