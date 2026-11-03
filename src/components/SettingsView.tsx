import React, { useEffect, useState } from 'react';
import {
  Settings,
  Volume2,
  DollarSign,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { UserSettings } from '../types';
import { speechOutput } from '../utils/speechSynthesis';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    const list = speechOutput.getVoices();
    setVoices(list);
  }, []);

  const handleCurrencyChange = (curr: 'INR' | 'USD' | 'EUR' | 'GBP') => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    onUpdateSettings({ currency: curr, currencySymbol: symbols[curr] });
  };

  const handleTestVoice = () => {
    speechOutput.speak('Hello! VoxTrack AI voice assistant is operating smoothly.', {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceName: settings.selectedVoiceName,
    });
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12132e] to-[#17143c] border border-purple-900/30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Application Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize voice speech synthesis, default currency, and manage offline persistent data.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Preference */}
      <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Default Currency</h2>
        </div>
        <p className="text-xs text-slate-400">
          Select the base currency for tracking and spoken confirmation.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
            { code: 'USD', symbol: '$', label: 'US Dollar' },
            { code: 'EUR', symbol: '€', label: 'Euro' },
            { code: 'GBP', symbol: '£', label: 'British Pound' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => handleCurrencyChange(item.code as any)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.currency === item.code
                  ? 'bg-purple-900/40 border-purple-500 text-white shadow-sm shadow-purple-900/30'
                  : 'bg-[#151636]/60 border-purple-950 text-slate-400 hover:text-white hover:border-purple-800'
              }`}
            >
              <div className="text-xl font-bold text-white mb-0.5">{item.symbol}</div>
              <div className="text-xs font-semibold text-slate-200">{item.code}</div>
              <div className="text-[10px] text-slate-400">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Output Settings */}
      <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white">Speech Synthesis (Voice Response)</h2>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.voiceFeedbackEnabled}
              onChange={(e) => onUpdateSettings({ voiceFeedbackEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <p className="text-xs text-slate-400">
          When enabled, VoxTrack AI will read out confirmation messages whenever an expense or task is created or modified.
        </p>

        {settings.voiceFeedbackEnabled && (
          <div className="space-y-4 pt-2 border-t border-purple-900/30">
            {/* Voice dropdown */}
            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Voice Persona</label>
                <select
                  value={settings.selectedVoiceName || ''}
                  onChange={(e) => onUpdateSettings({ selectedVoiceName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#141535] border border-purple-900/40 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Default System Voice</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate & Pitch sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Speed / Rate</span>
                  <span className="font-mono text-purple-400">{settings.speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={settings.speechRate}
                  onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Pitch</span>
                  <span className="font-mono text-purple-400">{settings.speechPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.1"
                  value={settings.speechPitch}
                  onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={handleTestVoice}
                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {testSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{testSuccess ? 'Speaking Audio...' : 'Test Voice Output'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Management & Storage */}
      <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Data Management & Persistence</h2>
        </div>
        <p className="text-xs text-slate-400">
          All data is stored securely in your browser's LocalStorage. You can back up or restore data at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onExportData}
            className="px-3.5 py-2 rounded-xl bg-[#16173a] hover:bg-[#202250] border border-purple-900/40 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-[#16173a] hover:bg-[#202250] border border-purple-900/40 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Restore Backup (JSON)</span>
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>

          <button
            onClick={onResetData}
            className="px-3.5 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-medium text-rose-300 flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Hackathon Project Technical Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10112c] to-[#15123d] border border-purple-800/40 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">VoxTrack AI Architecture & Tech Stack</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
          <div className="p-2.5 rounded-lg bg-[#0c0d20] border border-purple-950">
            <span className="text-slate-500 block">AI Model</span>
            <span className="font-semibold text-purple-300">Gemini 3.8 Flash</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0c0d20] border border-purple-950">
            <span className="text-slate-500 block">Voice Input</span>
            <span className="font-semibold text-cyan-300">Web Speech API</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0c0d20] border border-purple-950">
            <span className="text-slate-500 block">Voice Output</span>
            <span className="font-semibold text-emerald-300">SpeechSynthesis</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0c0d20] border border-purple-950">
            <span className="text-slate-500 block">Storage</span>
            <span className="font-semibold text-amber-300">LocalStorage Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
