// services/api.ts
import { MOCK_CUSTOMERS, MOCK_SALES, MOCK_REMARKS, MOCK_TASKS } from '../data/mockData';
import { Customer, Sale, Remark, Task, CustomerFormData } from '../types';
import { analyzeRemarkSentiment } from './geminiService';

// --- LocalStorage Persistence ---
const CUSTOMERS_KEY = 'intellicrm_customers';
const SALES_KEY = 'intellicrm_sales';
const REMARKS_KEY = 'intellicrm_remarks';
const TASKS_KEY = 'intellicrm_tasks';
const IDS_KEY = 'intellicrm_ids';

// A function to initialize storage only if it's not already set.
// This prevents overwriting existing data with mock data on page reload.
const initializeStorage = () => {
  if (localStorage.getItem(CUSTOMERS_KEY) === null) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(MOCK_CUSTOMERS));
  }
  if (localStorage.getItem(SALES_KEY) === null) {
    localStorage.setItem(SALES_KEY, JSON.stringify(MOCK_SALES));
  }
  if (localStorage.getItem(REMARKS_KEY) === null) {
    localStorage.setItem(REMARKS_KEY, JSON.stringify(MOCK_REMARKS));
  }
  if (localStorage.getItem(TASKS_KEY) === null) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(MOCK_TASKS));
  }
  if (localStorage.getItem(IDS_KEY) === null) {
    const initialIds = {
      customer: MOCK_CUSTOMERS.reduce((max, c) => Math.max(max, parseInt(c.id)), 0) + 1,
      sale: MOCK_SALES.reduce((max, s) => Math.max(max, parseInt(s.id.substring(1))), 0) + 1,
      remark: MOCK_REMARKS.reduce((max, r) => Math.max(max, parseInt(r.id.substring(1))), 0) + 1,
      task: MOCK_TASKS.reduce((max, t) => Math.max(max, parseInt(t.id.substring(1))), 0) + 1,
    };
    localStorage.setItem(IDS_KEY, JSON.stringify(initialIds));
  }
};

// Run initialization once at module load to ensure storage is ready.
initializeStorage();

const loadFromStorage = <T>(key: string): T[] => {
    try {
        const stored = localStorage.getItem(key);
        // Data should exist due to initialization. If not, return empty array to be safe.
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        // Return empty on error to prevent wiping data with a bad parse.
        return [];
    }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Data Initialization from Storage ---
let customers: Customer[] = loadFromStorage<Customer>(CUSTOMERS_KEY);
let sales: Sale[] = loadFromStorage<Sale>(SALES_KEY);
let remarks: Remark[] = loadFromStorage<Remark>(REMARKS_KEY);
let tasks: Task[] = loadFromStorage<Task>(TASKS_KEY);

// --- ID Management ---
let idCounters = (() => {
    try {
        const stored = localStorage.getItem(IDS_KEY);
        // This should exist from initialization.
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) { console.error('Failed to parse IDs from localStorage', e); }
    
    // Fallback if something went wrong, though it shouldn't be reached.
    return { customer: 100, sale: 100, remark: 100, task: 100 };
})();

const saveIdCounters = () => {
    localStorage.setItem(IDS_KEY, JSON.stringify(idCounters));
};


// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchCustomers = async (): Promise<Customer[]> => {
  await delay(500);
  return [...customers];
};

export const fetchCustomerById = async (id: string): Promise<Customer | undefined> => {
    await delay(100);
    return customers.find(c => c.id === id);
}

export const fetchSalesForCustomer = async (customerId: string): Promise<Sale[]> => {
  await delay(200);
  return sales.filter(s => s.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const fetchRemarksForCustomer = async (customerId: string): Promise<Remark[]> => {
  await delay(200);
  return remarks.filter(r => r.customerId === customerId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const fetchTasks = async (): Promise<Task[]> => {
  await delay(300);
  return [...tasks];
};

export const fetchTasksForCustomer = async (customerId: string): Promise<Task[]> => {
    await delay(200);
    return tasks.filter(t => t.customerId === customerId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export const fetchAllSales = async (): Promise<Sale[]> => {
    await delay(200);
    return [...sales];
};

export const addCustomer = async (formData: CustomerFormData): Promise<Customer> => {
  await delay(400);
  const newCustomer: Customer = {
    id: String(idCounters.customer++),
    avatar: `https://i.pravatar.cc/150?u=${idCounters.customer}`,
    name: formData.name,
    contact: formData.contact,
    alternateContact: formData.alternateContact || undefined,
    state: formData.state,
    district: formData.district,
    tier: formData.tier,
    salesThisMonth: 0,
    avg6MoSales: 0,
    outstandingBalance: 0,
    daysSinceLastOrder: 0,
    lastUpdated: new Date().toISOString(),
  };
  customers.unshift(newCustomer);
  saveToStorage(CUSTOMERS_KEY, customers);
  saveIdCounters();
  return newCustomer;
};

export const updateCustomer = async (customerId: string, updateData: Partial<CustomerFormData>): Promise<Customer> => {
    await delay(300);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    
    customers[customerIndex] = {
        ...customers[customerIndex],
        ...updateData,
        lastUpdated: new Date().toISOString(),
    };
    saveToStorage(CUSTOMERS_KEY, customers);
    return customers[customerIndex];
}

export const deleteCustomer = async (customerId: string): Promise<boolean> => {
    await delay(500);
    const initialLength = customers.length;
    customers = customers.filter(c => c.id !== customerId);
    saveToStorage(CUSTOMERS_KEY, customers);
    return customers.length < initialLength;
}

export const bulkAddCustomers = async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]): Promise<Customer[]> => {
    await delay(1000);
    const addedCustomers: Customer[] = [];
    newCustomersData.forEach(customerData => {
        const newCustomer: Customer = {
            id: String(idCounters.customer++),
            avatar: `https://i.pravatar.cc/150?u=${idCounters.customer}`,
            ...customerData,
            lastUpdated: new Date().toISOString(),
        };
        customers.unshift(newCustomer);
        addedCustomers.push(newCustomer);
    });
    saveToStorage(CUSTOMERS_KEY, customers);
    saveIdCounters();
    return addedCustomers;
};

export const addSale = async (customerId: string, amount: number, date: string): Promise<Sale> => {
    await delay(300);
    const newSale: Sale = {
        id: `s${idCounters.sale++}`,
        customerId,
        amount,
        date
    };
    sales.unshift(newSale);
    saveToStorage(SALES_KEY, sales);
    saveIdCounters();

    // Update customer record
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if(customerIndex > -1) {
        const saleDate = new Date(date);
        const today = new Date();
        
        if (saleDate.getFullYear() === today.getFullYear() && saleDate.getMonth() === today.getMonth()) {
            customers[customerIndex].salesThisMonth += amount;
        }

        const customerSales = sales.filter(s => s.customerId === customerId);
        const mostRecentSale = customerSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        if (mostRecentSale) {
            const mostRecentDate = new Date(mostRecentSale.date);
            const daysSince = Math.max(0, Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24)));
            customers[customerIndex].daysSinceLastOrder = daysSince;
        }

        customers[customerIndex].lastUpdated = new Date().toISOString();
        saveToStorage(CUSTOMERS_KEY, customers);
    }
    return newSale;
}

export const addRemark = async (customerId: string, remarkText: string): Promise<Remark> => {
    await delay(200);
    
    const sentimentResult = await analyzeRemarkSentiment(remarkText);

    const newRemark: Remark = {
        id: `r${idCounters.remark++}`,
        customerId,
        remark: remarkText,
        timestamp: new Date().toISOString(),
        user: "Sales Team", 
        sentiment: sentimentResult?.sentiment
    };
    remarks.unshift(newRemark);
    saveToStorage(REMARKS_KEY, remarks);
    saveIdCounters();
    return newRemark;
}

export const addPayment = async (customerId: string, amount: number, date: string): Promise<Customer> => {
    await delay(300);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");

    customers[customerIndex].outstandingBalance -= amount;
    customers[customerIndex].lastUpdated = new Date().toISOString();
    saveToStorage(CUSTOMERS_KEY, customers);
    
    const paymentDateString = new Date(date).toLocaleDateString();
    await addRemark(customerId, `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${paymentDateString}.`);
    
    return customers[customerIndex];
}

export const addBill = async (customerId: string, amount: number): Promise<Customer> => {
    await delay(300);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");

    customers[customerIndex].outstandingBalance += amount;
    customers[customerIndex].lastUpdated = new Date().toISOString();
    saveToStorage(CUSTOMERS_KEY, customers);

    await addRemark(customerId, `Bill of ₹${amount.toLocaleString('en-IN')} added.`);

    return customers[customerIndex];
}

export const addTask = async (taskData: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    await delay(300);
    const newTask: Task = {
        id: `t${idCounters.task++}`,
        completed: false,
        ...taskData,
    };
    tasks.unshift(newTask);
    saveToStorage(TASKS_KEY, tasks);
    saveIdCounters();
    return newTask;
};

export const toggleTaskComplete = async (taskId: string): Promise<Task | undefined> => {
    await delay(100);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveToStorage(TASKS_KEY, tasks);
        return tasks[taskIndex];
    }
    return undefined;
};