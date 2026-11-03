import React, { useEffect, useState } from 'react';
import {
  loadExpenses,
  saveExpenses,
  loadTasks,
  saveTasks,
  loadVoiceLogs,
  saveVoiceLogs,
  loadSettings,
  saveSettings,
  getInitialExpenses,
  getInitialTasks,
  getInitialVoiceLogs,
  DEFAULT_SETTINGS,
  resetAllData,
} from './utils/storage';
import { Expense, Task, VoiceLog, UserSettings, ParsedVoiceResult, ExpenseCategory, TaskCategory, TaskPriority } from './types';
import { parseVoiceInputLocally, formatDate } from './utils/nlpParser';
import { speechOutput } from './utils/speechSynthesis';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { TasksView } from './components/TasksView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { SettingsView } from './components/SettingsView';
import { ManualExpenseModal } from './components/ManualExpenseModal';
import { ManualTaskModal } from './components/ManualTaskModal';
import { VoiceHeroModal } from './components/VoiceHeroModal';
import { VoiceCommandCheatSheetModal } from './components/VoiceCommandCheatSheetModal';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Modals state
  const [isVoiceHeroOpen, setIsVoiceHeroOpen] = useState(false);
  const [isManualExpenseOpen, setIsManualExpenseOpen] = useState(false);
  const [isManualTaskOpen, setIsManualTaskOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize storage
  useEffect(() => {
    const loadedExpenses = loadExpenses();
    const loadedTasks = loadTasks();
    const loadedLogs = loadVoiceLogs();
    const loadedSettings = loadSettings();

    setExpenses(loadedExpenses);
    setTasks(loadedTasks);
    setVoiceLogs(loadedLogs);
    setSettings(loadedSettings);
    speechOutput.setMuted(!loadedSettings.voiceFeedbackEnabled);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Main Voice Processing Engine (Gemini 3.8 Flash server endpoint + high-accuracy Local NLP fallback)
  const handleProcessVoice = async (transcript: string): Promise<ParsedVoiceResult | null> => {
    const currentDate = formatDate(new Date());
    let parsed: ParsedVoiceResult;

    try {
      // Call server Gemini endpoint
      const response = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          currentDate,
          currency: settings.currency,
        }),
      });

      const json = await response.json();

      if (!json.fallback && json.data) {
        parsed = {
          type: json.data.type || 'unknown',
          expense: json.data.expense,
          task: json.data.task,
          voiceFeedback: json.data.voiceFeedback || 'Voice command processed.',
          confidence: json.data.confidence ?? 0.98,
          source: 'gemini-3.8-flash',
        };
      } else {
        // High accuracy rule-based local NLP fallback
        parsed = parseVoiceInputLocally(transcript, new Date(), settings.currency);
      }
    } catch (err) {
      // Offline or network error -> use local parser
      parsed = parseVoiceInputLocally(transcript, new Date(), settings.currency);
    }

    // Execute real action based on classification
    if (parsed.type === 'expense' && parsed.expense) {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        amount: parsed.expense.amount,
        currency: parsed.expense.currency || settings.currency,
        category: (parsed.expense.category as ExpenseCategory) || 'Other',
        description: parsed.expense.description || 'Expense',
        date: parsed.expense.date || currentDate,
        createdAt: Date.now(),
        voiceLogged: true,
      };

      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      saveExpenses(updated);

      const log: VoiceLog = {
        id: `log-${Date.now()}`,
        transcript,
        type: 'expense',
        actionTaken: `Recorded ${settings.currencySymbol}${newExpense.amount} for "${newExpense.description}" under ${newExpense.category}`,
        spokenResponse: parsed.voiceFeedback,
        source: parsed.source,
        timestamp: Date.now(),
        status: 'success',
      };
      const updatedLogs = [log, ...voiceLogs];
      setVoiceLogs(updatedLogs);
      saveVoiceLogs(updatedLogs);

      showToast(`Saved ${settings.currencySymbol}${newExpense.amount} for ${newExpense.description}!`);
    } else if (parsed.type === 'task' && parsed.task) {
      const newTask: Task = {
        id: `tsk-${Date.now()}`,
        title: parsed.task.title,
        dueDate: parsed.task.dueDate || currentDate,
        dueTime: parsed.task.dueTime,
        priority: (parsed.task.priority as TaskPriority) || 'medium',
        category: (parsed.task.category as TaskCategory) || 'General',
        completed: false,
        createdAt: Date.now(),
        voiceLogged: true,
      };

      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveTasks(updated);

      const log: VoiceLog = {
        id: `log-${Date.now()}`,
        transcript,
        type: 'task',
        actionTaken: `Created task "${newTask.title}" due on ${newTask.dueDate}`,
        spokenResponse: parsed.voiceFeedback,
        source: parsed.source,
        timestamp: Date.now(),
        status: 'success',
      };
      const updatedLogs = [log, ...voiceLogs];
      setVoiceLogs(updatedLogs);
      saveVoiceLogs(updatedLogs);

      showToast(`Task created: "${newTask.title}"`);
    } else {
      const log: VoiceLog = {
        id: `log-${Date.now()}`,
        transcript,
        type: 'unknown',
        actionTaken: 'Command recognized but unclassified',
        spokenResponse: parsed.voiceFeedback,
        source: parsed.source,
        timestamp: Date.now(),
        status: 'warning',
      };
      const updatedLogs = [log, ...voiceLogs];
      setVoiceLogs(updatedLogs);
      saveVoiceLogs(updatedLogs);
    }

    return parsed;
  };

  // Task Actions
  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (settings.voiceFeedbackEnabled) {
          const spoken = nextState
            ? `Completed task: ${t.title}`
            : `Reopened task: ${t.title}`;
          speechOutput.speak(spoken, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
            voiceName: settings.selectedVoiceName,
          });
        }
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? Date.now() : undefined,
        };
      }
      return t;
    });

    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
    showToast(`Deleted task "${target?.title || ''}"`, 'info');
  };

  const handleClearCompletedTasks = () => {
    const updated = tasks.filter((t) => !t.completed);
    setTasks(updated);
    saveTasks(updated);
    showToast('Cleared all completed tasks', 'info');
  };

  // Expense Actions
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    showToast(`Removed expense "${target?.description || ''}"`, 'info');
  };

  // Manual Creation
  const handleAddManualExpense = (data: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    paymentMethod?: string;
  }) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      amount: data.amount,
      currency: settings.currency,
      category: data.category,
      description: data.description,
      date: data.date,
      paymentMethod: data.paymentMethod,
      createdAt: Date.now(),
      voiceLogged: false,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);

    if (settings.voiceFeedbackEnabled) {
      speechOutput.speak(
        `Added expense of ${settings.currencySymbol}${data.amount} for ${data.description}.`,
        {
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          voiceName: settings.selectedVoiceName,
        }
      );
    }
    showToast(`Added ${settings.currencySymbol}${data.amount} for ${data.description}`);
  };

  const handleAddManualTask = (data: {
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: TaskPriority;
    category: TaskCategory;
  }) => {
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      title: data.title,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority,
      category: data.category,
      completed: false,
      createdAt: Date.now(),
      voiceLogged: false,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);

    if (settings.voiceFeedbackEnabled) {
      speechOutput.speak(`Created task: ${data.title}.`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceName: settings.selectedVoiceName,
      });
    }
    showToast(`Created task "${data.title}"`);
  };

  // Voice Mute Toggle
  const handleToggleVoiceMute = () => {
    const nextState = !settings.voiceFeedbackEnabled;
    const updatedSettings = { ...settings, voiceFeedbackEnabled: nextState };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    speechOutput.setMuted(!nextState);
    showToast(nextState ? 'Voice speech synthesis activated' : 'Voice output muted', 'info');
  };

  // Settings Updates
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    if (newSettings.voiceFeedbackEnabled !== undefined) {
      speechOutput.setMuted(!newSettings.voiceFeedbackEnabled);
    }
    showToast('Settings updated', 'info');
  };

  // Reset demo data
  const handleResetData = () => {
    resetAllData();
    const initialExp = getInitialExpenses();
    const initialTsk = getInitialTasks();
    const initialLogs = getInitialVoiceLogs();
    setExpenses(initialExp);
    setTasks(initialTsk);
    setVoiceLogs(initialLogs);
    setSettings(DEFAULT_SETTINGS);
    saveExpenses(initialExp);
    saveTasks(initialTsk);
    saveVoiceLogs(initialLogs);
    saveSettings(DEFAULT_SETTINGS);
    showToast('Reset data to initial hackathon sample dataset', 'success');
  };

  // Export & Import
  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      expenses,
      tasks,
      voiceLogs,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VoxTrack_AI_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full backup exported successfully', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.expenses)) {
          setExpenses(parsed.expenses);
          saveExpenses(parsed.expenses);
        }
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          saveTasks(parsed.tasks);
        }
        if (Array.isArray(parsed.voiceLogs)) {
          setVoiceLogs(parsed.voiceLogs);
          saveVoiceLogs(parsed.voiceLogs);
        }
        if (parsed.settings) {
          setSettings(parsed.settings);
          saveSettings(parsed.settings);
        }
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        showToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
          <div
            className={`p-3.5 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : toast.type === 'info'
                ? 'bg-[#151638]/90 border-indigo-600 text-indigo-200'
                : 'bg-[#10192e]/90 border-emerald-500 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 ml-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onToggleVoiceMute={handleToggleVoiceMute}
        onOpenVoiceHero={() => setIsVoiceHeroOpen(true)}
        onOpenManualExpense={() => setIsManualExpenseOpen(true)}
        onOpenManualTask={() => setIsManualTaskOpen(true)}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingTasksCount={tasks.filter((t) => !t.completed).length}
          expensesCount={expenses.length}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onOpenVoiceCheatSheet={() => setIsCheatSheetOpen(true)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              expenses={expenses}
              tasks={tasks}
              settings={settings}
              onDeleteExpense={handleDeleteExpense}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenManualExpense={() => setIsManualExpenseOpen(true)}
              onOpenManualTask={() => setIsManualTaskOpen(true)}
              onProcessTranscript={handleProcessVoice}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              settings={settings}
              onDeleteExpense={handleDeleteExpense}
              onOpenManualExpense={() => setIsManualExpenseOpen(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onOpenManualTask={() => setIsManualTaskOpen(true)}
              onClearCompletedTasks={handleClearCompletedTasks}
            />
          )}

          {activeTab === 'voice-studio' && (
            <VoiceStudioView
              voiceLogs={voiceLogs}
              settings={settings}
              onProcessTranscript={handleProcessVoice}
              onClearVoiceLogs={() => {
                setVoiceLogs([]);
                saveVoiceLogs([]);
                showToast('Voice activity logs cleared', 'info');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </main>
      </div>

      {/* Floating Speak Action for Mobile Screens */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={() => setIsVoiceHeroOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 shadow-xl shadow-purple-950 flex items-center justify-center text-white ring-4 ring-purple-500/30 active:scale-95 transition-all cursor-pointer"
          aria-label="Speak voice command"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Global Modals */}
      <VoiceHeroModal
        isOpen={isVoiceHeroOpen}
        onClose={() => setIsVoiceHeroOpen(false)}
        onProcessTranscript={handleProcessVoice}
        settings={settings}
      />

      <ManualExpenseModal
        isOpen={isManualExpenseOpen}
        onClose={() => setIsManualExpenseOpen(false)}
        onAddExpense={handleAddManualExpense}
        settings={settings}
      />

      <ManualTaskModal
        isOpen={isManualTaskOpen}
        onClose={() => setIsManualTaskOpen(false)}
        onAddTask={handleAddManualTask}
      />

      <VoiceCommandCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        onRunCommand={handleProcessVoice}
      />
    </div>
  );
}
