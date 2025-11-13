import React, { useEffect } from 'react';
import { useApp } from './contexts/AppContext';
import Header from './components/layout/Header';
import Dashboard from './components/Dashboard';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import CustomerDetailModal from './components/CustomerDetailModal';
import AddCustomerModal from './components/AddCustomerModal';
import BulkImportModal from './components/BulkImportModal';
import AddTaskModal from './components/AddTaskModal';
import CommandPalette from './components/command/CommandPalette';
import Filters from './components/layout/Filters';


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