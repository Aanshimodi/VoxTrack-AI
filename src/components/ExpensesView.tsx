import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Mic,
  Calendar,
  ArrowUpDown,
  Tag,
  CreditCard,
  Download,
} from 'lucide-react';
import { Expense, ExpenseCategory, UserSettings } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  settings: UserSettings;
  onDeleteExpense: (id: string) => void;
  onOpenManualExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  settings,
  onDeleteExpense,
  onOpenManualExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const categories = [
    'All',
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

  // Filtering
  const filtered = expenses.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount.toString().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const totalFilteredAmount = sorted.reduce((sum, item) => sum + Number(item.amount), 0);
  const voiceFilteredCount = sorted.filter((item) => item.voiceLogged).length;

  // Export CSV
  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Payment Method', 'Voice Logged'];
    const rows = sorted.map((e) => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      e.currency,
      e.paymentMethod || 'Default',
      e.voiceLogged ? 'Yes' : 'No',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VoxTrack_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#11122e] to-[#17143c] border border-purple-900/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Expense Ledger</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track and audit all expenditures logged via voice recognition and manual entries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={sorted.length === 0}
            className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1b38] hover:bg-[#22244a] border border-purple-900/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenManualExpense}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-900/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary metric banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Filtered Spend</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {settings.currencySymbol}
              {totalFilteredAmount.toLocaleString()}
            </p>
          </div>
          <Receipt className="w-6 h-6 text-purple-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Records</p>
            <p className="text-xl font-bold text-white mt-0.5">{sorted.length} transactions</p>
          </div>
          <Tag className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-[#11122a] border border-purple-900/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Voice-Captured</p>
            <p className="text-xl font-bold text-white mt-0.5">{voiceFilteredCount} items</p>
          </div>
          <Mic className="w-6 h-6 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description, amount, or category..."
              className="w-full pl-10 pr-4 py-2 bg-[#12132a] border border-purple-900/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#12132a] border border-purple-900/40 rounded-xl text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-[#12132a]">Date (Newest first)</option>
                <option value="date-asc" className="bg-[#12132a]">Date (Oldest first)</option>
                <option value="amount-desc" className="bg-[#12132a]">Amount (Highest first)</option>
                <option value="amount-asc" className="bg-[#12132a]">Amount (Lowest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-900/30 font-semibold'
                  : 'bg-[#141530] text-slate-400 hover:text-slate-200 hover:bg-[#1c1d42] border border-purple-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="rounded-2xl bg-[#101128]/90 border border-purple-900/30 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm">No expenses found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search filters.'
                : 'Say "Spent 250 rupees on lunch" to log your first expense!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-purple-900/20">
            {sorted.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-4 hover:bg-[#151636]/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-purple-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm sm:text-base truncate">
                        {exp.description}
                      </span>
                      {exp.voiceLogged && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Mic className="w-2.5 h-2.5 mr-0.5" /> Voice AI
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-purple-300 font-medium">{exp.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {exp.date}
                      </span>
                      {exp.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            {exp.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-white">
                      {settings.currencySymbol}
                      {Number(exp.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">{exp.currency || settings.currency}</p>
                  </div>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
