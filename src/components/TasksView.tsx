import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Mic,
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenManualTask: () => void;
  onClearCompletedTasks: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenManualTask,
  onClearCompletedTasks,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Today reference
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !task.completed) ||
      (statusFilter === 'completed' && task.completed);

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sorting: Pending first, then by dueDate, then high priority
  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate) || b.createdAt - a.createdAt;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#11122e] to-[#17143c] border border-purple-900/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Tasks & Reminders</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Stay on top of deadlines, assignments, and voice-scheduled action items.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {completedCount > 0 && (
            <button
              onClick={onClearCompletedTasks}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-rose-300 bg-[#1a1b38] hover:bg-rose-950/30 border border-purple-900/40 rounded-xl transition-all cursor-pointer"
            >
              Clear Done ({completedCount})
            </button>
          )}
          <button
            onClick={onOpenManualTask}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-md shadow-indigo-900/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Pending Tasks</p>
            <p className="text-xl font-bold text-white mt-0.5">{pendingCount} remaining</p>
          </div>
          <Clock className="w-6 h-6 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-xl font-bold text-white mt-0.5">{completedCount} tasks</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Voice-Created</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {tasks.filter((t) => t.voiceLogged).length} tasks
            </p>
          </div>
          <Mic className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or category..."
            className="w-full pl-10 pr-4 py-2 bg-[#12132a] border border-purple-900/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12132a] border border-purple-900/40 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#12132a] border border-purple-900/40 rounded-xl text-xs text-slate-300">
          <span className="text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#12132a]">All Priorities</option>
            <option value="high" className="bg-[#12132a]">High Priority</option>
            <option value="medium" className="bg-[#12132a]">Medium Priority</option>
            <option value="low" className="bg-[#12132a]">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-2xl bg-[#101128]/90 border border-purple-900/30 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try clearing your filters.'
                : 'Speak a command like "Remind me to submit assignment tomorrow"!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-purple-900/20">
            {sorted.map((task) => {
              const isOverdue = !task.completed && task.dueDate < todayStr;
              const isDueToday = !task.completed && task.dueDate === todayStr;

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    task.completed
                      ? 'bg-[#12132a]/40 opacity-70'
                      : 'hover:bg-[#151636]/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : 'border-slate-600 hover:border-indigo-400 bg-slate-900/40 text-transparent'
                      }`}
                      aria-label="Toggle task completed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm sm:text-base truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.voiceLogged && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <Mic className="w-2.5 h-2.5 mr-0.5" /> Voice
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-indigo-300 font-medium">{task.category}</span>
                        <span>•</span>

                        {/* Date badge */}
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-400 font-semibold'
                              : isDueToday
                              ? 'text-amber-300 font-semibold'
                              : 'text-slate-300'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                          {isOverdue && ' (Overdue)'}
                          {isDueToday && ' (Today)'}
                        </span>

                        <span>•</span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
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

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
