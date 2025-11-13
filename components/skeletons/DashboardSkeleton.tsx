import React from 'react';
import Skeleton from '../ui/Skeleton';

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
        </div>
    </div>
);

const ChartSkeleton: React.FC<{className?: string}> = ({className=""}) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg ${className}`}>
        <Skeleton className="h-6 w-3/5 mb-4" />
        <Skeleton className="h-[300px] w-full" />
    </div>
);


const DashboardSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartSkeleton className="lg:col-span-2" />
                <ChartSkeleton />
            </div>
        </div>
    );
};

export default DashboardSkeleton;
