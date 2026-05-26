import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Project, Transaction, Invoice, Employee } from '../types';

interface AppState {
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  invoices: Invoice[];
  employees: Employee[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  updateEmployeeStatus: (id: string, status: Employee['status']) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useLocalStorage<Client[]>('tamcraker_clients', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('tamcraker_projects', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('tamcraker_transactions', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('tamcraker_invoices', []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('tamcraker_employees', []);

  const addClient = (data: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setClients((prev) => [...prev, newClient]);
  };

  const addProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [...prev, newTx]);
  };

  const addInvoice = (data: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: crypto.randomUUID(),
    };
    setInvoices((prev) => [...prev, newInvoice]);
  };

  const addEmployee = (data: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...data,
      id: crypto.randomUUID(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const updateProjectStatus = (id: string, status: Project['status']) => {
    setProjects((prev) => prev.map(proj => proj.id === id ? { ...proj, status } : proj));
  };

  const updateEmployeeStatus = (id: string, status: Employee['status']) => {
    setEmployees((prev) => prev.map(emp => emp.id === id ? { ...emp, status } : emp));
  };

  const value = {
    clients,
    projects,
    transactions,
    invoices,
    employees,
    addClient,
    addProject,
    addTransaction,
    addInvoice,
    addEmployee,
    updateInvoiceStatus,
    updateProjectStatus,
    updateEmployeeStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
