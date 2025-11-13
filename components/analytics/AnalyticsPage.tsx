// components/analytics/AnalyticsPage.tsx
import React, { useMemo } from 'react';
import KPIRow from './KPIRow';
import SalesByStateChart from './SalesByStateChart';
import TierDistributionChart from './TierDistributionChart';
import OverallSalesTrendChart from './OverallSalesTrendChart';
import AIAnalyticsInsight from './AIAnalyticsInsight';
import SalesLeaderboard from '../gamification/SalesLeaderboard';
import { useApp } from '../../contexts/AppContext';
import DashboardSkeleton from '../skeletons/DashboardSkeleton';
import AnalyticsFilters from './AnalyticsFilters';
import CustomerPerformanceDetail from './CustomerPerformanceDetail';
import ActionableInsights from './ActionableInsights';
import OverallPerformanceTable from './OverallPerformanceTable';
import FadeIn from '../ui/FadeIn';
import SalesForecast from './SalesForecast';

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers } = useApp();

    const selectedCustomerData = useMemo(() => {
        if (analyticsFilters.selectedCustomer === 'all') return null;
        return customers.find(c => c.id === analyticsFilters.selectedCustomer);
    }, [analyticsFilters.selectedCustomer, customers]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
              <AnalyticsFilters />
            </FadeIn>
            
            {selectedCustomerData ? (
                <FadeIn>
                    <CustomerPerformanceDetail customer={selectedCustomerData} />
                </FadeIn>
            ) : (
                <>
                    <FadeIn>
                      <KPIRow />
                    </FadeIn>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <FadeIn className="lg:col-span-2 card-base p-4">
                            <OverallSalesTrendChart />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <OverallPerformanceTable />
                        </FadeIn>
                    </div>
                    
                    <FadeIn>
                      <ActionableInsights />
                    </FadeIn>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FadeIn className="card-base p-4">
                            <SalesByStateChart />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <TierDistributionChart />
                        </FadeIn>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         <FadeIn className="card-base p-4">
                            <SalesLeaderboard />
                        </FadeIn>
                         <FadeIn className="card-base p-4">
                            <AIAnalyticsInsight />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <SalesForecast />
                        </FadeIn>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;