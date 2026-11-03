import { Expense, Task, UserSettings, VoiceLog } from '../types';
import { formatDate } from './nlpParser';

const EXPENSES_KEY = 'voxtrack_expenses';
const TASKS_KEY = 'voxtrack_tasks';
const LOGS_KEY = 'voxtrack_voice_logs';
const SETTINGS_KEY = 'voxtrack_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  voiceFeedbackEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  autoListen: false,
};

// Seed sample data for high-impact initial hackathon demo
export function getInitialExpenses(): Expense[] {
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  return [
    {
      id: 'exp-1',
      amount: 250,
      currency: 'INR',
      category: 'Food & Dining',
      description: 'Lunch at Cafe Bistro',
      date: formatDate(today),
      paymentMethod: 'UPI / Card',
      createdAt: Date.now() - 3600000 * 2,
      voiceLogged: true,
    },
    {
      id: 'exp-2',
      amount: 1200,
      currency: 'INR',
      category: 'Bills & Utilities',
      description: 'Electricity & Wifi Bill',
      date: formatDate(today),
      paymentMethod: 'Net Banking',
      createdAt: Date.now() - 3600000 * 5,
      voiceLogged: false,
    },
    {
      id: 'exp-3',
      amount: 450,
      currency: 'INR',
      category: 'Groceries',
      description: 'Weekly organic groceries',
      date: formatDate(yest),
      paymentMethod: 'UPI',
      createdAt: Date.now() - 3600000 * 24,
      voiceLogged: true,
    },
    {
      id: 'exp-4',
      amount: 180,
      currency: 'INR',
      category: 'Transport',
      description: 'Uber cab to campus',
      date: formatDate(yest),
      paymentMethod: 'Wallet',
      createdAt: Date.now() - 3600000 * 28,
      voiceLogged: true,
    },
    {
      id: 'exp-5',
      amount: 899,
      currency: 'INR',
      category: 'Shopping',
      description: 'Wireless ergonomic mouse',
      date: formatDate(twoDaysAgo),
      paymentMethod: 'Credit Card',
      createdAt: Date.now() - 3600000 * 48,
      voiceLogged: false,
    },
  ];
}

export function getInitialTasks(): Task[] {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 3);

  return [
    {
      id: 'tsk-1',
      title: 'Submit Machine Learning assignment',
      dueDate: formatDate(tomorrow),
      dueTime: '17:00',
      priority: 'high',
      category: 'Study',
      completed: false,
      createdAt: Date.now() - 3600000 * 3,
      voiceLogged: true,
    },
    {
      id: 'tsk-2',
      title: 'Review VoxTrack pitch deck for hackathon',
      dueDate: formatDate(today),
      dueTime: '20:00',
      priority: 'high',
      category: 'Work',
      completed: false,
      createdAt: Date.now() - 3600000 * 6,
      voiceLogged: true,
    },
    {
      id: 'tsk-3',
      title: 'Call mom in the evening',
      dueDate: formatDate(today),
      priority: 'medium',
      category: 'Personal',
      completed: true,
      completedAt: Date.now() - 1800000,
      createdAt: Date.now() - 3600000 * 12,
      voiceLogged: true,
    },
    {
      id: 'tsk-4',
      title: 'Pick up medical prescription from pharmacy',
      dueDate: formatDate(nextWeek),
      priority: 'medium',
      category: 'Health',
      completed: false,
      createdAt: Date.now() - 3600000 * 16,
      voiceLogged: false,
    },
  ];
}

export function getInitialVoiceLogs(): VoiceLog[] {
  return [
    {
      id: 'log-1',
      transcript: 'I spent 250 rupees on lunch',
      type: 'expense',
      actionTaken: 'Added ₹250 to Food & Dining (Lunch at Cafe Bistro)',
      spokenResponse: 'Saved ₹250 for Lunch at Cafe Bistro under Food and Dining.',
      source: 'gemini-3.8-flash',
      timestamp: Date.now() - 3600000 * 2,
      status: 'success',
    },
    {
      id: 'log-2',
      transcript: 'Remind me to submit Machine Learning assignment tomorrow at 5pm',
      type: 'task',
      actionTaken: 'Created Task: Submit Machine Learning assignment',
      spokenResponse: 'Task added: Submit Machine Learning assignment, due tomorrow at 17:00.',
      source: 'gemini-3.8-flash',
      timestamp: Date.now() - 3600000 * 3,
      status: 'success',
    },
  ];
}

// LocalStorage helpers
export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (!data) {
      const initial = getInitialExpenses();
      saveExpenses(initial);
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load expenses', e);
    return getInitialExpenses();
  }
}

export function saveExpenses(expenses: Expense[]) {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load tasks', e);
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadVoiceLogs(): VoiceLog[] {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) {
      const initial = getInitialVoiceLogs();
      saveVoiceLogs(initial);
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveVoiceLogs(logs: VoiceLog[]) {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.error('Failed to save voice logs', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function resetAllData() {
  localStorage.removeItem(EXPENSES_KEY);
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
