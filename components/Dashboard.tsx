import React from 'react';
import CustomerTable from './CustomerTable';
import UpcomingTasks from './UpcomingTasks';
import KPIRow from './analytics/KPIRow'; 
import { useApp } from '../contexts/AppContext';
import FadeIn from './ui/FadeIn';

const Dashboard: React.FC = () => {
    // Skeletons are handled inside child components
    return (
        <div className="space-y-6">
            <FadeIn>
                <KPIRow />
            </FadeIn>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <FadeIn className="xl:col-span-2">
                   <CustomerTable />
                </FadeIn>
                <FadeIn>
                   <UpcomingTasks />
                </FadeIn>
            </div>
        </div>
    );
};

export default Dashboard;