import React, { useEffect } from 'react';
import { useApp } from './src/contexts/AppContext';
import Header from './src/components/layout/Header';
import Dashboard from './src/components/Dashboard';
import AnalyticsPage from './src/components/analytics/AnalyticsPage';
import CustomerDetailModal from './src/components/CustomerDetailModal';
import AddCustomerModal from './src/components/AddCustomerModal';
import BulkImportModal from './src/components/BulkImportModal';
import AddTaskModal from './src/components/AddTaskModal';
import CommandPalette from './src/components/command/CommandPalette';
import Filters from './src/components/layout/Filters';

const App: React.FC = () => {
    const { 
        currentView,
        isDetailModalOpen,
        isAddCustomerModalOpen,
        isBulkImportModalOpen,
        isAddTaskModalOpen,
        openCommandPalette
    } = useApp();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openCommandPalette]);

    return (
        <div className="min-h-screen font-sans">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                {currentView === 'dashboard' && <Filters />}
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'analytics' && <AnalyticsPage />}
            </main>
            
            {/* Modals & Overlays */}
            {isDetailModalOpen && <CustomerDetailModal />}
            {isAddCustomerModalOpen && <AddCustomerModal />}
            {isBulkImportModalOpen && <BulkImportModal />}
            {isAddTaskModalOpen && <AddTaskModal />}
            <CommandPalette />
        </div>
    );
};

export default App;

