// hooks/useCrmData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { Customer, Task, CustomerFormData, CustomerTier, Sale, Remark } from '../types';

export interface Filters {
  tier: CustomerTier | '';
  state: string;
  sortBy: keyof Customer | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
}

export const useCrmData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    tier: '',
    state: '',
    sortBy: 'lastUpdated',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customersData, tasksData] = await Promise.all([
          api.fetchCustomers(),
          api.fetchTasks(),
        ]);
        setCustomers(customersData);
        setTasks(tasksData.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      } catch (error) {
        console.error("Failed to load CRM data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const setFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = customer.name.toLowerCase().includes(searchLower);
        const contactMatch = customer.contact.toLowerCase().includes(searchLower);
        const stateMatch = customer.state.toLowerCase().includes(searchLower);
        const districtMatch = customer.district.toLowerCase().includes(searchLower);
        const tierMatch = filters.tier ? customer.tier === filters.tier : true;
        const filterStateMatch = filters.state ? customer.state === filters.state : true;
        
        return (nameMatch || contactMatch || stateMatch || districtMatch) && tierMatch && filterStateMatch;
      })
      .sort((a, b) => {
        const field = filters.sortBy;
        const valA = a[field];
        const valB = b[field];
        
        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          if(field === 'lastUpdated') {
             comparison = new Date(valB).getTime() - new Date(valA).getTime();
          } else {
             comparison = valA.localeCompare(valB);
          }
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valB - valA; // Default number sort is descending
        }
        
        return filters.sortOrder === 'asc' ? -comparison : comparison;
      });
  }, [customers, searchTerm, filters]);

  // --- MUTATION FUNCTIONS ---

  const addCustomer = async (formData: CustomerFormData) => {
    try {
      const newCustomer = await api.addCustomer(formData);
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  const updateCustomer = async (customerId: string, updateData: Partial<CustomerFormData>) => {
    try {
      const updatedCustomer = await api.updateCustomer(customerId, updateData);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  const deleteCustomer = async (customerId: string) => {
    try {
      await api.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  const bulkAddCustomers = async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]) => {
    try {
      const addedCustomers = await api.bulkAddCustomers(newCustomersData);
      setCustomers(prev => [...addedCustomers, ...prev]);
      return addedCustomers;
    } catch (error) {
      console.error("Error bulk adding customers:", error);
      throw error;
    }
  };

  const addSale = async (customerId: string, amount: number, date: string): Promise<Sale> => {
    try {
      const newSale = await api.addSale(customerId, amount, date);
      // Refetch customer to get updated sales figures
      const updatedCustomer = await api.fetchCustomerById(customerId);
      if(updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      }
      return newSale;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  }

  const addRemark = async (customerId: string, remarkText: string): Promise<Remark> => {
    try {
      return await api.addRemark(customerId, remarkText);
    } catch (error) {
      console.error("Error adding remark:", error);
      throw error;
    }
  }

  const addPayment = async (customerId: string, amount: number, date: string): Promise<Customer> => {
    try {
      const updatedCustomer = await api.addPayment(customerId, amount, date);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  }

  const addBill = async (customerId: string, amount: number): Promise<Customer> => {
    try {
      const updatedCustomer = await api.addBill(customerId, amount);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error adding bill:", error);
      throw error;
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    try {
      const newTask = await api.addTask(taskData);
      setTasks(prev => [newTask, ...prev].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    try {
      const updatedTask = await api.toggleTaskComplete(taskId);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
      return updatedTask;
    } catch (error) {
      console.error("Error toggling task complete:", error);
      throw error;
    }
  };

  return {
    loading,
    customers,
    tasks,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    
    // Actions
    addCustomer,
    updateCustomer,
    deleteCustomer,
    bulkAddCustomers,
    addSale,
    addRemark,
    addPayment,
    addBill,
    addTask,
    toggleTaskComplete,

    // Data Fetchers for Detail View
    getSalesForCustomer: api.fetchSalesForCustomer,
    getRemarksForCustomer: api.fetchRemarksForCustomer,
    getTasksForCustomer: api.fetchTasksForCustomer,
    getAllSales: api.fetchAllSales,
    getGoalsForCustomer: api.fetchGoalsForCustomer,
    addGoal: api.addGoal,
    deleteGoal: api.deleteGoal,
    addMilestone: api.addMilestone,
    toggleMilestoneComplete: api.toggleMilestoneComplete,
  };
};
