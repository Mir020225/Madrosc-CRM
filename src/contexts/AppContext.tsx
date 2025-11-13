// contexts/AppContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { Customer } from '../types';

// The return type of useCrmData
type CrmDataHook = ReturnType<typeof useCrmData>;

interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  selectedCustomer: string; // 'all' or customer ID
}

interface AddTaskInitialData {
  customerId: string;
  task: string;
  dueDate: string; // Should be in 'YYYY-MM-DDTHH:mm' format for datetime-local input
}

interface AppContextType extends CrmDataHook {
  // View management
  currentView: 'dashboard' | 'analytics';
  setCurrentView: (view: 'dashboard' | 'analytics') => void;

  // Modal states and handlers
  isDetailModalOpen: boolean;
  detailModalCustomer: Customer | null;
  openDetailModal: (customer: Customer) => void;
  closeDetailModal: () => void;

  isAddCustomerModalOpen: boolean;
  openAddCustomerModal: () => void;
  closeAddCustomerModal: () => void;
  
  isBulkImportModalOpen: boolean;
  openBulkImportModal: () => void;
  closeBulkImportModal: () => void;

  isAddTaskModalOpen: boolean;
  openAddTaskModal: (initialData?: AddTaskInitialData) => void;
  closeAddTaskModal: () => void;
  addTaskInitialData: AddTaskInitialData | null;

  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  
  // Analytics filters
  analyticsFilters: AnalyticsFilters;
  setAnalyticsFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to get the start of the current month
const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const crmData = useCrmData();
  
  // View state
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalCustomer, setDetailModalCustomer] = useState<Customer | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [addTaskInitialData, setAddTaskInitialData] = useState<AddTaskInitialData | null>(null);

  // Analytics Filters State
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: getMonthStart(new Date()).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    selectedCustomer: 'all',
  });


  // Modal handlers
  const openDetailModal = (customer: Customer) => {
    setDetailModalCustomer(customer);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => setIsDetailModalOpen(false);

  const openAddCustomerModal = () => setIsAddCustomerModalOpen(true);
  const closeAddCustomerModal = () => setIsAddCustomerModalOpen(false);
  
  const openBulkImportModal = () => setIsBulkImportModalOpen(true);
  const closeBulkImportModal = () => setIsBulkImportModalOpen(false);

  const openAddTaskModal = (initialData?: AddTaskInitialData) => {
    if (initialData) {
      setAddTaskInitialData(initialData);
    }
    setIsAddTaskModalOpen(true);
  };
  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setAddTaskInitialData(null); // Clear data on close
  };
  
  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const value: AppContextType = {
    ...crmData,
    currentView,
    setCurrentView,
    isDetailModalOpen,
    detailModalCustomer,
    openDetailModal,
    closeDetailModal,
    isAddCustomerModalOpen,
    openAddCustomerModal,
    closeAddCustomerModal,
    isBulkImportModalOpen,
    openBulkImportModal,
    closeBulkImportModal,
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    addTaskInitialData,
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    analyticsFilters,
    setAnalyticsFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
