export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold';
export type TransactionType = 'income' | 'expense';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type EmployeeRole = 'Manager' | 'Developer' | 'Designer' | 'Sales' | 'Support';
export type EmployeeStatus = 'active' | 'on-leave' | 'terminated';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  salary: number;
  joinDate: number;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  budget: number;
  deadline: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: number;
  description: string;
  projectId?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: number;
  issueDate: number;
}
