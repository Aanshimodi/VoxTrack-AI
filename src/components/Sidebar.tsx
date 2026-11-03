import React from 'react';
import { LayoutDashboard, Receipt, CheckSquare, Mic, Settings, Sparkles, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingTasksCount: number;
  expensesCount: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onOpenVoiceCheatSheet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  expensesCount,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onOpenVoiceCheatSheet,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
      badge: expensesCount > 0 ? expensesCount : null,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'voice-studio',
      label: 'Voice Studio',
      icon: Mic,
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono text-[9px]',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0b1c] border-r border-purple-900/30 flex flex-col justify-between p-4 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo in mobile sidebar */}
          <div className="flex items-center gap-2.5 px-2 pt-2 pb-1 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">VoxTrack AI</span>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/30 text-white border border-purple-500/40 shadow-sm shadow-purple-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#13142e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Helper Card */}
        <div className="space-y-3 pt-4 border-t border-purple-900/20">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#12132e] to-[#18153d] border border-purple-800/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-200">Voice Quick Tip</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Say <span className="text-purple-300 font-mono">"Spent 250 rs on lunch"</span> or{' '}
              <span className="text-indigo-300 font-mono">"Remind me to submit assignment tomorrow"</span>
            </p>
            <button
              onClick={onOpenVoiceCheatSheet}
              className="mt-2 text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>View all voice commands</span>
            </button>
          </div>

          <div className="px-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>VoxTrack AI v1.0</span>
            <span className="text-emerald-400 font-medium">● Local Storage Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
