import { Customer, Sale, Remark, Task, Goal, Milestone } from '../types';

const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Rohan Sharma', contact: '9876543210', alternateContact: '8877665544', avatar: `https://i.pravatar.cc/150?u=1`, tier: 'Gold', state: 'Maharashtra', district: 'Mumbai', salesThisMonth: 15000, avg6MoSales: 25000, outstandingBalance: 5000, daysSinceLastOrder: 10, lastUpdated: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: '2', name: 'Priya Patel', contact: '9876543211', avatar: `https://i.pravatar.cc/150?u=2`, tier: 'Silver', state: 'Gujarat', district: 'Ahmedabad', salesThisMonth: 8000, avg6MoSales: 12000, outstandingBalance: 1200, daysSinceLastOrder: 25, lastUpdated: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  { id: '3', name: 'Amit Singh', contact: '9876543212', avatar: `https://i.pravatar.cc/150?u=3`, tier: 'Bronze', state: 'Uttar Pradesh', district: 'Lucknow', salesThisMonth: 0, avg6MoSales: 5000, outstandingBalance: 8000, daysSinceLastOrder: 45, lastUpdated: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
  { id: '4', name: 'Sunita Rao', contact: '9876543213', alternateContact: '7766554433', avatar: `https://i.pravatar.cc/150?u=4`, tier: 'Gold', state: 'Karnataka', district: 'Bengaluru Urban', salesThisMonth: 30000, avg6MoSales: 45000, outstandingBalance: 0, daysSinceLastOrder: 5, lastUpdated: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { id: '5', name: 'Vikram Reddy', contact: '9876543214', avatar: `https://i.pravatar.cc/150?u=5`, tier: 'Silver', state: 'Telangana', district: 'Hyderabad', salesThisMonth: 12000, avg6MoSales: 10000, outstandingBalance: 3000, daysSinceLastOrder: 15, lastUpdated: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
  { id: '6', name: 'Anjali Gupta', contact: '9876543215', avatar: `https://i.pravatar.cc/150?u=6`, tier: 'Dead', state: 'Delhi', district: 'New Delhi', salesThisMonth: 0, avg6MoSales: 2000, outstandingBalance: 500, daysSinceLastOrder: 120, lastUpdated: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString() },
];

const MOCK_SALES: Sale[] = [
    { id: 's1', customerId: '1', amount: 15000, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
    { id: 's2', customerId: '1', amount: 25000, date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString() },
    { id: 's3', customerId: '1', amount: 35000, date: new Date(Date.now() - 70 * 24 * 3600 * 1000).toISOString() },
    { id: 's4', customerId: '2', amount: 8000, date: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() },
    { id: 's5', customerId: '4', amount: 30000, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
];

const MOCK_REMARKS: Remark[] = [
    { id: 'r1', customerId: '1', remark: 'Followed up about new product line. Seemed interested.', timestamp: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(), user: 'Sales Team', sentiment: 'Positive' },
    { id: 'r2', customerId: '3', remark: 'Called to check on outstanding balance. Promised to pay by end of week.', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), user: 'Accounts', sentiment: 'Neutral' },
    { id: 'r3', customerId: '1', remark: 'He was very happy with the last delivery, great feedback!', timestamp: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), user: 'Sales Team', sentiment: 'Positive' },
    { id: 'r4', customerId: '2', remark: 'Customer is complaining about the product quality. Needs immediate attention.', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), user: 'Support', sentiment: 'Negative' },
];

const MOCK_TASKS: Task[] = [
    // Overdue task
    { id: 't1', customerId: '3', customerName: 'Amit Singh', task: 'Follow up on overdue payment of ₹8000', dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), completed: false },
    // Today's task
    { id: 't2', customerId: '1', customerName: 'Rohan Sharma', task: 'Send quote for new product line', dueDate: new Date().toISOString(), completed: false },
    // Upcoming task
    { id: 't3', customerId: '4', customerName: 'Sunita Rao', task: 'Schedule Q3 business review meeting', dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), completed: false },
    // Completed task
    { id: 't4', customerId: '2', customerName: 'Priya Patel', task: 'Send welcome kit', dueDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), completed: true },
];

const MOCK_GOALS: Goal[] = [
    { id: 'g1', customerId: '1', title: 'Q3 Sales Push', targetAmount: 75000, currentAmount: 40000, deadline: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(), status: 'InProgress' },
    { id: 'g2', customerId: '4', title: 'Achieve Premier Partner Status', targetAmount: 150000, currentAmount: 30000, deadline: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(), status: 'InProgress' },
    { id: 'g3', customerId: '4', title: 'Q2 Onboarding Sales', targetAmount: 45000, currentAmount: 50000, deadline: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), status: 'Achieved' },
];

const MOCK_MILESTONES: Milestone[] = [
    { id: 'm1', goalId: 'g1', description: 'Initial pitch for new product line', targetDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), completed: true },
    { id: 'm2', goalId: 'g1', description: 'Send follow-up quote', targetDate: new Date().toISOString(), completed: false },
    { id: 'm3', goalId: 'g1', description: 'Finalize order', targetDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), completed: false },
    { id: 'm4', goalId: 'g2', description: 'Business review meeting', targetDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), completed: true },
    { id: 'm5', goalId: 'g2', description: 'Secure volume discount agreement', targetDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(), completed: false },
];


export { MOCK_CUSTOMERS, MOCK_SALES, MOCK_REMARKS, MOCK_TASKS, MOCK_GOALS, MOCK_MILESTONES };
