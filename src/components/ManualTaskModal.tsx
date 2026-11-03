import React, { useState } from 'react';
import { X, CheckSquare, Plus, Calendar, Clock, Flag, Tag } from 'lucide-react';
import { TaskCategory, TaskPriority } from '../types';
import { formatDate } from '../utils/nlpParser';

interface ManualTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (data: {
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: TaskPriority;
    category: TaskCategory;
  }) => void;
}

export const ManualTaskModal: React.FC<ManualTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(formatDate(new Date()));
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('General');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories: TaskCategory[] = [
    'Work',
    'Personal',
    'Study',
    'Health',
    'Finance',
    'Urgent',
    'General',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    onAddTask({
      title: title.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
    });

    setTitle('');
    setDueTime('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f1026] border border-purple-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Manual Task Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-purple-950/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Task Title / Action</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Submit Machine Learning assignment, Buy flight tickets"
              className="w-full px-3.5 py-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Due Time (Optional)</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0f1026]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="high" className="bg-[#0f1026]">High Priority</option>
                <option value="medium" className="bg-[#0f1026]">Medium Priority</option>
                <option value="low" className="bg-[#0f1026]">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer shadow-md shadow-indigo-900/30 active:scale-95"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
