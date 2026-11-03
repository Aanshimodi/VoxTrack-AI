import React from 'react';
import { Mic, Volume2, VolumeX, Sparkles, Menu, X, Plus, ShieldCheck } from 'lucide-react';
import { UserSettings } from '../types';

interface NavbarProps {
  settings: UserSettings;
  onToggleVoiceMute: () => void;
  onOpenVoiceHero: () => void;
  onOpenManualExpense: () => void;
  onOpenManualTask: () => void;
  activeTab: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onToggleVoiceMute,
  onOpenVoiceHero,
  onOpenManualExpense,
  onOpenManualTask,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0c0d21]/80 backdrop-blur-md border-b border-purple-900/30 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-purple-950/40"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 p-[1.5px] shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#0a0b1e] rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  VoxTrack<span className="text-purple-400">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Voice-Powered Expense & Task Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* AI Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
            <span>Voice Engine Ready</span>
          </div>

          {/* Quick Speak Trigger */}
          <button
            onClick={onOpenVoiceHero}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-purple-900/40 hover:shadow-purple-700/50 transition-all cursor-pointer group active:scale-95"
          >
            <Mic className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">Speak Command</span>
          </button>

          {/* Quick Add Dropdown or Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#141530] p-1 rounded-xl border border-purple-900/40">
            <button
              onClick={onOpenManualExpense}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-purple-400" />
              <span>Expense</span>
            </button>
            <button
              onClick={onOpenManualTask}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-indigo-400" />
              <span>Task</span>
            </button>
          </div>

          {/* Voice Response Mute Toggle */}
          <button
            onClick={onToggleVoiceMute}
            title={settings.voiceFeedbackEnabled ? 'Voice responses active (Click to mute)' : 'Voice responses muted (Click to unmute)'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              settings.voiceFeedbackEnabled
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
            }`}
            aria-label="Toggle voice output"
          >
            {settings.voiceFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
