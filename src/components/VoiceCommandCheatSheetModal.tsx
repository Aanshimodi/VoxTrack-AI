import React from 'react';
import { X, Sparkles, Mic, ArrowRight, Check } from 'lucide-react';

interface VoiceCommandCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCommand: (command: string) => void;
}

export const VoiceCommandCheatSheetModal: React.FC<VoiceCommandCheatSheetModalProps> = ({
  isOpen,
  onClose,
  onRunCommand,
}) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Expense Commands',
      description: 'Say how much you spent and what it was for:',
      examples: [
        'I spent 250 rupees on lunch',
        'Paid 1200 for electricity bill',
        'Bought groceries for 450 rs',
        'Spent 180 on Uber cab',
        'Bought medicine for 320 rupees',
        'Coffee at Starbucks 150 rs',
        'Dinner with friends 850 inr',
        'Bought new shoes for 1499',
      ],
    },
    {
      title: 'Task & Reminder Commands',
      description: 'Say what you need to do and when it is due:',
      examples: [
        'Remind me to submit my assignment tomorrow',
        'Schedule project meeting on Friday at 4pm',
        'Call doctor today at 5pm',
        'Need to buy milk tonight',
        'Review pull request tonight',
        'Don\'t forget to pay internet bill next Monday',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f1026] border border-purple-800/40 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Voice Command Cheatsheet</h2>
              <p className="text-xs text-slate-400">Click any example to execute it immediately in the app.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-purple-950/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto space-y-6 py-4 pr-1">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2.5">
              <div>
                <h3 className="text-sm font-bold text-purple-300">{sec.title}</h3>
                <p className="text-xs text-slate-400">{sec.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sec.examples.map((ex, exIdx) => (
                  <button
                    key={exIdx}
                    onClick={() => {
                      onRunCommand(ex);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#141535] hover:bg-purple-900/30 border border-purple-950 hover:border-purple-600/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium">
                      "{ex}"
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Speech Recognition handles Indian & US English accents</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
