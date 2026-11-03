import React from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  History,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Play,
  Layers,
  Zap,
} from 'lucide-react';
import { UserSettings, VoiceLog } from '../types';
import { VoiceMicHero } from './VoiceMicHero';
import { speechOutput } from '../utils/speechSynthesis';

interface VoiceStudioViewProps {
  voiceLogs: VoiceLog[];
  settings: UserSettings;
  onProcessTranscript: (text: string) => Promise<any>;
  onClearVoiceLogs: () => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  voiceLogs,
  settings,
  onProcessTranscript,
  onClearVoiceLogs,
}) => {
  const exampleCategories = [
    {
      title: '🍽️ Food & Dining Expenses',
      commands: [
        'I spent 250 rupees on lunch',
        'Bought coffee for 180 rs at Starbucks',
        'Paid 850 inr for dinner with team',
      ],
    },
    {
      title: '⚡ Utilities & Bills',
      commands: [
        'Paid 1200 for electricity bill',
        'Recharged mobile phone for 499 rupees',
        'Paid 1500 for wifi internet',
      ],
    },
    {
      title: '🚕 Transport & Commute',
      commands: [
        'Spent 180 on Uber cab to office',
        'Paid 500 rs for petrol',
        'Metro card recharge 200 rupees',
      ],
    },
    {
      title: '📚 Academic & Work Tasks',
      commands: [
        'Remind me to submit my assignment tomorrow',
        'Prepare presentation for project review this Friday',
        'Review code pull request tonight',
      ],
    },
    {
      title: '🩺 Health & Daily Life',
      commands: [
        'Call doctor at 4pm today',
        'Bought medicine for 320 rupees',
        'Remind me to take vitamins at 9pm',
      ],
    },
  ];

  const handleTestTTS = (text: string) => {
    speechOutput.speak(text, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceName: settings.selectedVoiceName,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#12132e] via-[#16133a] to-[#1c1544] border border-purple-900/30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Voice AI Studio
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Interactive Lab
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural speech recognition powered by Web Speech API, dual-engine AI classification, and audible SpeechSynthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Main Mic Station */}
      <VoiceMicHero onProcessTranscript={onProcessTranscript} settings={settings} />

      {/* Two Column Grid: Voice Command Cheatsheet & Voice Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Command Cheatsheet */}
        <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Interactive Command Templates</h3>
            </div>
            <span className="text-xs text-slate-400">Click any prompt to execute</span>
          </div>

          <div className="space-y-4">
            {exampleCategories.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-300">{group.title}</h4>
                <div className="space-y-1.5">
                  {group.commands.map((cmd, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => onProcessTranscript(cmd)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#151636]/60 hover:bg-purple-900/30 border border-purple-950 hover:border-purple-700/50 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Mic className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-200 group-hover:text-white font-medium">
                          "{cmd}"
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Voice Activity History Log */}
        <div className="p-5 rounded-2xl bg-[#101128]/90 border border-purple-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Voice Action Log</h3>
              </div>
              {voiceLogs.length > 0 && (
                <button
                  onClick={onClearVoiceLogs}
                  className="text-xs text-slate-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear Log
                </button>
              )}
            </div>

            {voiceLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No voice interactions recorded yet. Speak a command to see the real-time AI execution log!
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {voiceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#141535]/80 border border-purple-900/30 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-purple-300 flex items-center gap-1.5">
                        <Mic className="w-3 h-3 text-purple-400" />
                        "{log.transcript}"
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                        {log.source}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{log.actionTaken}</span>
                    </div>

                    {log.spokenResponse && (
                      <div className="p-2 rounded-lg bg-[#0b0c20] border border-purple-900/20 text-[11px] text-slate-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="italic">"{log.spokenResponse}"</span>
                        </div>
                        <button
                          onClick={() => handleTestTTS(log.spokenResponse)}
                          title="Re-speak response"
                          className="p-1 hover:text-purple-300 text-slate-400 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> SpeechSynthesis Active
            </span>
            <span className="text-[11px]">Browser Native Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
