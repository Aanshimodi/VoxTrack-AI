import React from 'react';
import {
  TrendingUp,
  Receipt,
  CheckCircle,
  Clock,
  Mic,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Plus,
  Trash2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Expense, Task, UserSettings, ExpenseCategory } from '../types';
import { VoiceMicHero } from './VoiceMicHero';

interface DashboardViewProps {
  expenses: Expense[];
  tasks: Task[];
  settings: UserSettings;
  onDeleteExpense: (id: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenManualExpense: () => void;
  onOpenManualTask: () => void;
  onProcessTranscript: (text: string) => Promise<any>;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  tasks,
  settings,
  onDeleteExpense,
  onToggleTask,
  onDeleteTask,
  onOpenManualExpense,
  onOpenManualTask,
  onProcessTranscript,
  onNavigateToTab,
}) => {
  // Calculations
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const voiceLoggedExpenses = expenses.filter((e) => e.voiceLogged).length;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const taskCompletionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Category Breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';

  // Category color map
  const categoryColorMap: Record<string, string> = {
    'Food & Dining': 'from-amber-500 to-orange-500',
    Groceries: 'from-emerald-500 to-teal-500',
    Transport: 'from-blue-500 to-cyan-500',
    'Bills & Utilities': 'from-purple-500 to-indigo-500',
    Shopping: 'from-pink-500 to-rose-500',
    Entertainment: 'from-violet-500 to-fuchsia-500',
    Health: 'from-red-500 to-rose-400',
    Education: 'from-teal-500 to-sky-500',
    Travel: 'from-sky-500 to-indigo-500',
    Other: 'from-slate-500 to-zinc-400',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Voice Area */}
      <VoiceMicHero onProcessTranscript={onProcessTranscript} settings={settings} />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12132e] to-[#17153a] border border-purple-900/40 relative overflow-hidden group hover:border-purple-600/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {settings.currencySymbol}
            {totalExpenses.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">{expenses.length} transactions</span>
            <span className="text-purple-300 font-medium flex items-center gap-1">
              <Mic className="w-3 h-3 text-purple-400" />
              {voiceLoggedExpenses} by voice
            </span>
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12132e] to-[#17153a] border border-purple-900/40 relative overflow-hidden group hover:border-indigo-600/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {pendingTasks.length}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">Due today or upcoming</span>
            <span className="text-indigo-300 font-medium">{completedTasks.length} done</span>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12132e] to-[#17153a] border border-purple-900/40 relative overflow-hidden group hover:border-emerald-600/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Task Completion</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {taskCompletionRate}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12132e] to-[#17153a] border border-purple-900/40 relative overflow-hidden group hover:border-violet-600/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Top Spend Area</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate">{topCategory}</div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>
              {categoryTotals[topCategory]
                ? `${settings.currencySymbol}${categoryTotals[topCategory].toLocaleString()}`
                : 'No data'}
            </span>
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Expenses & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses List */}
        <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Recent Transactions</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenManualExpense}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Manual Add</span>
              </button>
              <button
                onClick={() => onNavigateToTab('expenses')}
                className="text-xs text-slate-400 hover:text-purple-300 font-medium cursor-pointer"
              >
                See all
              </button>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No expenses recorded yet. Speak a command or add one manually!
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenses.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#151636]/60 border border-purple-950 hover:border-purple-800/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate">{exp.description}</p>
                        {exp.voiceLogged && (
                          <span
                            title="Logged via Voice AI"
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          >
                            <Mic className="w-2.5 h-2.5 mr-0.5" /> Voice
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300">{exp.category}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-white text-sm">
                      {settings.currencySymbol}
                      {Number(exp.amount).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks List */}
        <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Tasks & Reminders</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenManualTask}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Manual Add</span>
              </button>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs text-slate-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                See all
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No tasks scheduled. Say "Remind me to do homework tomorrow"!
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-[#12132a]/40 border-slate-800/40 opacity-70'
                      : 'bg-[#151636]/60 border-purple-950 hover:border-indigo-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400 bg-slate-900/40'
                      }`}
                      aria-label="Toggle complete"
                    >
                      {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                        </span>
                        <span>•</span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/40 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown & Spend Visualizer */}
      <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-base">Expense Category Distribution</h3>
          </div>
          <span className="text-xs text-slate-400">Total: {settings.currencySymbol}{totalExpenses.toLocaleString()}</span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No categories to display</p>
        ) : (
          <div className="space-y-3.5">
            {sortedCategories.map(([cat, amount]) => {
              const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
              const gradient = categoryColorMap[cat] || 'from-purple-500 to-indigo-500';
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{pct}%</span>
                      <span className="font-semibold text-white">
                        {settings.currencySymbol}
                        {amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/70 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
