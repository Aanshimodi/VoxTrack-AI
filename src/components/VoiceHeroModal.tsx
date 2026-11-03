import React from 'react';
import { X } from 'lucide-react';
import { VoiceMicHero } from './VoiceMicHero';
import { UserSettings } from '../types';

interface VoiceHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessTranscript: (text: string) => Promise<any>;
  settings: UserSettings;
}

export const VoiceHeroModal: React.FC<VoiceHeroModalProps> = ({
  isOpen,
  onClose,
  onProcessTranscript,
  settings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <VoiceMicHero onProcessTranscript={onProcessTranscript} settings={settings} />
      </div>
    </div>
  );
};
