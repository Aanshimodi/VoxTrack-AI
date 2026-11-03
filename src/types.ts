export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  createdAt: number;
  voiceLogged?: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'Urgent' | 'General';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "17:00"
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  voiceLogged?: boolean;
}

export interface VoiceLog {
  id: string;
  transcript: string;
  type: 'expense' | 'task' | 'query' | 'unknown';
  actionTaken: string;
  spokenResponse: string;
  source: 'gemini-3.8-flash' | 'local-nlp';
  timestamp: number;
  status: 'success' | 'warning' | 'error';
}

export interface UserSettings {
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  voiceFeedbackEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoiceName?: string;
  autoListen: boolean;
}

export interface ParsedVoiceResult {
  type: 'expense' | 'task' | 'query' | 'unknown';
  expense?: {
    amount: number;
    currency?: string;
    category: ExpenseCategory;
    description: string;
    date: string;
  };
  task?: {
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: TaskPriority;
    category: TaskCategory;
  };
  voiceFeedback: string;
  confidence?: number;
  source: 'gemini-3.8-flash' | 'local-nlp';
}
