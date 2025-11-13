// components/analytics/TierDistributionChart.tsx
import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomerTier } from '../../types';

const TierDistributionChart: React.FC = () => {
    const { customers } = useApp();

    const COLORS: Record<CustomerTier, string> = {
        Gold: '#ffc107',
        Silver: '#6c757d',
        Bronze: '#fd7e14',
        Dead: '#0dcaf0'
    };

    const chartData = useMemo(() => {
        const tierCounts: Record<CustomerTier, number> = { Gold: 0, Silver: 0, Bronze: 0, Dead: 0 };
        customers.forEach(customer => {
            tierCounts[customer.tier]++;
        });
        return (Object.keys(tierCounts) as CustomerTier[]).map(tier => ({
            name: tier,
            value: tierCounts[tier]
        })).filter(d => d.value > 0);
    }, [customers]);
    
    return (
        <div className="h-[400px]">
            <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4 px-2">Client Tier Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as CustomerTier]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TierDistributionChart;