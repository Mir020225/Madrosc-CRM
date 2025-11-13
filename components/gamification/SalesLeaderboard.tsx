import React from 'react';
import Skeleton from '../ui/Skeleton';

const MOCK_LEADERBOARD_DATA = [
    { name: 'Ravi Kumar', sales: 125000, avatar: 'https://i.pravatar.cc/150?u=sales1' },
    { name: 'Sunita Sharma', sales: 112000, avatar: 'https://i.pravatar.cc/150?u=sales2' },
    { name: 'Anil Desai', sales: 98000, avatar: 'https://i.pravatar.cc/150?u=sales3' },
    { name: 'Priya Mehta', sales: 85000, avatar: 'https://i.pravatar.cc/150?u=sales4' },
    { name: 'Vikram Singh', sales: 76000, avatar: 'https://i.pravatar.cc/150?u=sales5' },
];

const SalesLeaderboard: React.FC = () => {
    const loading = false; // In a real app, this would come from a context/hook.

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-2">Sales Leaderboard</h3>
            <ul className="space-y-3">
                {MOCK_LEADERBOARD_DATA.map((user, index) => (
                    <li key={user.name} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <span className="font-bold text-lg w-8 text-center text-gray-400 dark:text-gray-500">{index + 1}</span>
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mx-3" />
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-green-600 dark:text-green-400 font-mono">₹{user.sales.toLocaleString('en-IN')}</p>
                        </div>
                        {index < 3 && (
                            <i className={`fas fa-trophy ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'}`}></i>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SalesLeaderboard;
