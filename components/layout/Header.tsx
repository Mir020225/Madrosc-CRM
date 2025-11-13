import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { openAddCustomerModal, openBulkImportModal, openCommandPalette, currentView, setCurrentView } = useApp();

    const getButtonClass = (view: 'dashboard' | 'analytics') => {
        return currentView === view 
            ? 'bg-[var(--primary-light)] dark:bg-[var(--primary-dark)] text-white shadow-sm' 
            : 'text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:bg-black/5 dark:hover:bg-white/10';
    };

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-[var(--border-light)] dark:border-[var(--border-dark)] p-3 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <i className="fas fa-headset text-2xl text-[var(--primary-light)] dark:text-[var(--primary-dark)]"></i>
                    <h1 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] hidden sm:block">ClientConnect</h1>
                </div>
                
                {/* View Switcher */}
                <div className="flex items-center bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                    <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${getButtonClass('dashboard')}`}>
                        <i className="fas fa-tachometer-alt mr-2 opacity-80"></i>Dashboard
                    </button>
                    <button onClick={() => setCurrentView('analytics')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${getButtonClass('analytics')}`}>
                        <i className="fas fa-chart-pie mr-2 opacity-80"></i>Analytics
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={openCommandPalette}
                    className="w-40 sm:w-56 text-left text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] bg-gray-100 dark:bg-black/20 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-black/30 transition-colors"
                >
                    <i className="fas fa-search mr-2 opacity-60"></i>
                    Search...
                    <kbd className="hidden sm:inline-block float-right bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs">Ctrl+K</kbd>
                </button>
                
                <button onClick={openAddCustomerModal} className="btn-secondary hidden md:flex items-center">
                    <i className="fas fa-plus mr-2"></i>Add Client
                </button>

                <button onClick={openBulkImportModal} className="btn-secondary hidden md:flex items-center">
                    <i className="fas fa-upload mr-2"></i>Bulk Import
                </button>

                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] bg-gray-100 dark:bg-black/20 rounded-full hover:bg-gray-200 dark:hover:bg-black/30"
                    aria-label="Toggle theme"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
            </div>
            <style>{`
                .btn-secondary { 
                  padding: 0.5rem 1rem; font-weight: 500; border: 1px solid var(--border-light); border-radius: 0.375rem; 
                  background-color: var(--card-bg-light); transition: background-color 0.2s, border-color 0.2s;
                  color: var(--text-primary-light);
                }
                .dark .btn-secondary { 
                  border-color: var(--border-dark); background-color: var(--card-bg-dark);
                  color: var(--text-primary-dark);
                }
                .btn-secondary:hover { background-color: #f8f9fa; border-color: #ced4da; }
                .dark .btn-secondary:hover { background-color: #ffffff10; border-color: #484f58; }
            `}</style>
        </header>
    );
};

export default Header;