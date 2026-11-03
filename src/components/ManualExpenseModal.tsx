import React, { useState } from 'react';
import { X, Receipt, Plus, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { ExpenseCategory, UserSettings } from '../types';
import { formatDate } from '../utils/nlpParser';

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (data: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    paymentMethod?: string;
  }) => void;
  settings: UserSettings;
}

export const ManualExpenseModal: React.FC<ManualExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  settings,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState(formatDate(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('UPI / Card');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories: ExpenseCategory[] = [
    'Food & Dining',
    'Groceries',
    'Transport',
    'Bills & Utilities',
    'Shopping',
    'Entertainment',
    'Health',
    'Education',
    'Travel',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    onAddExpense({
      amount: num,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    });

    // Reset and close
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f1026] border border-purple-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Manual Expense Entry</h2>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Lunch at Cafe Bistro, Electricity Bill"
              className="w-full px-3.5 py-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0f1026]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. UPI, Credit Card, Cash"
              className="w-full px-3.5 py-2.5 bg-[#151636] border border-purple-900/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
            />
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
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-md shadow-purple-900/30 active:scale-95"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
