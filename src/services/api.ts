// services/api.ts
import { MOCK_CUSTOMERS, MOCK_SALES, MOCK_REMARKS, MOCK_TASKS, MOCK_GOALS, MOCK_MILESTONES } from '../data/mockData';
import { Customer, Sale, Remark, Task, CustomerFormData, Goal, Milestone } from '../types';
import { analyzeRemarkSentiment } from './geminiService';

// --- LocalStorage Persistence ---
const CUSTOMERS_KEY = 'intellicrm_customers';
const SALES_KEY = 'intellicrm_sales';
const REMARKS_KEY = 'intellicrm_remarks';
const TASKS_KEY = 'intellicrm_tasks';
const GOALS_KEY = 'intellicrm_goals';
const MILESTONES_KEY = 'intellicrm_milestones';
const IDS_KEY = 'intellicrm_ids';

// A function to initialize storage only if it's not already set.
const initializeStorage = () => {
  if (localStorage.getItem(CUSTOMERS_KEY) === null) localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(MOCK_CUSTOMERS));
  if (localStorage.getItem(SALES_KEY) === null) localStorage.setItem(SALES_KEY, JSON.stringify(MOCK_SALES));
  if (localStorage.getItem(REMARKS_KEY) === null) localStorage.setItem(REMARKS_KEY, JSON.stringify(MOCK_REMARKS));
  if (localStorage.getItem(TASKS_KEY) === null) localStorage.setItem(TASKS_KEY, JSON.stringify(MOCK_TASKS));
  if (localStorage.getItem(GOALS_KEY) === null) localStorage.setItem(GOALS_KEY, JSON.stringify(MOCK_GOALS));
  if (localStorage.getItem(MILESTONES_KEY) === null) localStorage.setItem(MILESTONES_KEY, JSON.stringify(MOCK_MILESTONES));

  if (localStorage.getItem(IDS_KEY) === null) {
    const initialIds = {
      customer: MOCK_CUSTOMERS.reduce((max, c) => Math.max(max, parseInt(c.id)), 0) + 1,
      sale: MOCK_SALES.reduce((max, s) => Math.max(max, parseInt(s.id.substring(1))), 0) + 1,
      remark: MOCK_REMARKS.reduce((max, r) => Math.max(max, parseInt(r.id.substring(1))), 0) + 1,
      task: MOCK_TASKS.reduce((max, t) => Math.max(max, parseInt(t.id.substring(1))), 0) + 1,
      goal: MOCK_GOALS.reduce((max, g) => Math.max(max, parseInt(g.id.substring(1))), 0) + 1,
      milestone: MOCK_MILESTONES.reduce((max, m) => Math.max(max, parseInt(m.id.substring(1))), 0) + 1,
    };
    localStorage.setItem(IDS_KEY, JSON.stringify(initialIds));
  }
};

// Run initialization once at module load to ensure storage is ready.
initializeStorage();

const loadFromStorage = <T>(key: string): T[] => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
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
let goals: Goal[] = loadFromStorage<Goal>(GOALS_KEY);
let milestones: Milestone[] = loadFromStorage<Milestone>(MILESTONES_KEY);


// --- ID Management ---
let idCounters = (() => {
    try {
        const stored = localStorage.getItem(IDS_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Failed to parse IDs from localStorage', e); }
    return { customer: 100, sale: 100, remark: 100, task: 100, goal: 100, milestone: 100 };
})();

const saveIdCounters = () => {
    localStorage.setItem(IDS_KEY, JSON.stringify(idCounters));
};

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- CUSTOMER API ---
export const fetchCustomers = async (): Promise<Customer[]> => {
  await delay(500);
  return [...customers];
};
export const fetchCustomerById = async (id: string): Promise<Customer | undefined> => {
    await delay(100);
    return customers.find(c => c.id === id);
}
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
    customers[customerIndex] = { ...customers[customerIndex], ...updateData, lastUpdated: new Date().toISOString() };
    saveToStorage(CUSTOMERS_KEY, customers);
    return customers[customerIndex];
}
export const deleteCustomer = async (customerId: string): Promise<boolean> => {
    await delay(500);
    customers = customers.filter(c => c.id !== customerId);
    saveToStorage(CUSTOMERS_KEY, customers);
    return true;
}
export const bulkAddCustomers = async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]): Promise<Customer[]> => {
    await delay(1000);
    const addedCustomers: Customer[] = newCustomersData.map(customerData => ({
        id: String(idCounters.customer++),
        avatar: `https://i.pravatar.cc/150?u=${idCounters.customer}`,
        ...customerData,
        lastUpdated: new Date().toISOString(),
    }));
    customers = [...addedCustomers, ...customers];
    saveToStorage(CUSTOMERS_KEY, customers);
    saveIdCounters();
    return addedCustomers;
};

// --- TRANSACTIONAL API ---
export const fetchSalesForCustomer = async (customerId: string): Promise<Sale[]> => {
  await delay(200);
  return sales.filter(s => s.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const fetchAllSales = async (): Promise<Sale[]> => {
    await delay(200);
    return [...sales];
};
export const addSale = async (customerId: string, amount: number, date: string): Promise<Sale> => {
    await delay(300);
    const newSale: Sale = { id: `s${idCounters.sale++}`, customerId, amount, date };
    sales.unshift(newSale);
    saveToStorage(SALES_KEY, sales);
    saveIdCounters();
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if(customerIndex > -1) {
        customers[customerIndex].lastUpdated = new Date().toISOString();
        saveToStorage(CUSTOMERS_KEY, customers);
    }
    return newSale;
}
export const addPayment = async (customerId: string, amount: number, date: string): Promise<Customer> => {
    await delay(300);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    customers[customerIndex].outstandingBalance -= amount;
    customers[customerIndex].lastUpdated = new Date().toISOString();
    saveToStorage(CUSTOMERS_KEY, customers);
    await addRemark(customerId, `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${new Date(date).toLocaleDateString()}.`);
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

// --- REMARKS API ---
export const fetchRemarksForCustomer = async (customerId: string): Promise<Remark[]> => {
  await delay(200);
  return remarks.filter(r => r.customerId === customerId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
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

// --- TASKS API ---
export const fetchTasks = async (): Promise<Task[]> => {
  await delay(300);
  return [...tasks];
};
export const fetchTasksForCustomer = async (customerId: string): Promise<Task[]> => {
    await delay(200);
    return tasks.filter(t => t.customerId === customerId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
export const addTask = async (taskData: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    await delay(300);
    const newTask: Task = { id: `t${idCounters.task++}`, completed: false, ...taskData };
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

// --- GOALS & MILESTONES API ---
export const fetchGoalsForCustomer = async (customerId: string): Promise<{goals: Goal[], milestones: Milestone[]}> => {
    await delay(400);
    const customerGoals = goals
        .filter(g => g.customerId === customerId)
        .map(goal => { // Recalculate currentAmount and status on fetch
            const goalSales = sales.filter(s => s.customerId === customerId && new Date(s.date) <= new Date(goal.deadline));
            const currentAmount = goalSales.reduce((sum, s) => sum + s.amount, 0);
            let status: Goal['status'] = 'InProgress';
            if (currentAmount >= goal.targetAmount) {
                status = 'Achieved';
            } else if (new Date() > new Date(goal.deadline)) {
                status = 'Missed';
            }
            return { ...goal, currentAmount, status };
        })
        .sort((a,b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    
    const goalIds = new Set(customerGoals.map(g => g.id));
    const customerMilestones = milestones.filter(m => goalIds.has(m.goalId));
    
    return { goals: customerGoals, milestones: customerMilestones };
};
export const addGoal = async (goalData: Omit<Goal, 'id' | 'currentAmount' | 'status'>): Promise<Goal> => {
    await delay(300);
    const newGoal: Goal = {
        id: `g${idCounters.goal++}`,
        ...goalData,
        currentAmount: 0,
        status: 'InProgress'
    };
    goals.unshift(newGoal);
    saveToStorage(GOALS_KEY, goals);
    saveIdCounters();
    return newGoal;
};
export const deleteGoal = async (goalId: string): Promise<void> => {
    await delay(300);
    goals = goals.filter(g => g.id !== goalId);
    milestones = milestones.filter(m => m.goalId !== goalId);
    saveToStorage(GOALS_KEY, goals);
    saveToStorage(MILESTONES_KEY, milestones);
};
export const addMilestone = async (milestoneData: Omit<Milestone, 'id' | 'completed'>): Promise<Milestone> => {
    await delay(200);
    const newMilestone: Milestone = {
        id: `m${idCounters.milestone++}`,
        ...milestoneData,
        completed: false
    };
    milestones.push(newMilestone);
    saveToStorage(MILESTONES_KEY, milestones);
    saveIdCounters();
    return newMilestone;
};
export const toggleMilestoneComplete = async (milestoneId: string): Promise<Milestone | undefined> => {
    await delay(100);
    const milestoneIndex = milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex > -1) {
        milestones[milestoneIndex].completed = !milestones[milestoneIndex].completed;
        saveToStorage(MILESTONES_KEY, milestones);
        return milestones[milestoneIndex];
    }
    return undefined;
};
