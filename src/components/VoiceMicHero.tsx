import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { speechService } from '../utils/speechRecognition';
import { speechOutput } from '../utils/speechSynthesis';
import { ParsedVoiceResult, UserSettings } from '../types';

interface VoiceMicHeroProps {
  onProcessTranscript: (text: string) => Promise<ParsedVoiceResult | null>;
  settings: UserSettings;
  compact?: boolean;
}

export const VoiceMicHero: React.FC<VoiceMicHeroProps> = ({
  onProcessTranscript,
  settings,
  compact = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ParsedVoiceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Demo commands for rapid 1-click test in presentations
  const demoCommands = [
    { text: 'I spent 250 rupees on lunch', label: '🍛 Lunch 250 rs', type: 'expense' },
    { text: 'Paid 1200 for electricity bill', label: '⚡ Electricity 1200', type: 'expense' },
    { text: 'Remind me to submit my assignment tomorrow', label: '📚 Submit assignment', type: 'task' },
    { text: 'Bought groceries for 450 rs', label: '🛒 Groceries 450 rs', type: 'expense' },
    { text: 'Call doctor at 4pm today', label: '🩺 Call doctor 4pm', type: 'task' },
    { text: 'Spent 180 on Uber cab', label: '🚕 Uber 180 rs', type: 'expense' },
  ];

  useEffect(() => {
    const supported = speechService.isSupported();
    setIsSupported(supported);

    speechService.setCallbacks(
      // onResult
      (finalText, interim) => {
        setInterimText(interim);
        if (finalText) {
          setLastTranscript(finalText);
          handleFinalSpeech(finalText);
        }
      },
      // onStatusChange
      (listening, error) => {
        setIsListening(listening);
        if (error) {
          setErrorMessage(error);
          setIsProcessing(false);
        } else if (listening) {
          setErrorMessage(null);
          setLastResult(null);
        }
      }
    );

    return () => {
      speechService.stop();
    };
  }, []);

  const handleToggleListen = () => {
    if (isListening) {
      speechService.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setLastResult(null);
      setInterimText('');
      speechService.start();
    }
  };

  const handleFinalSpeech = async (transcript: string) => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await onProcessTranscript(transcript);
      if (result) {
        setLastResult(result);
        // Play voice response using SpeechSynthesis
        if (settings.voiceFeedbackEnabled && result.voiceFeedback) {
          speechOutput.speak(result.voiceFeedback, {
            rate: settings.speechRate,
            pitch: settings.speechPitch,
            voiceName: settings.selectedVoiceName,
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to analyze voice command');
    } finally {
      setIsProcessing(false);
      setInterimText('');
    }
  };

  const handleDemoClick = (text: string) => {
    setLastTranscript(text);
    handleFinalSpeech(text);
  };

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-[#101128] via-[#141233] to-[#19153d] border border-purple-800/40 p-5 sm:p-7 overflow-hidden shadow-xl shadow-purple-950/20 ${
        compact ? 'max-w-xl mx-auto' : ''
      }`}
    >
      {/* Background glow effects */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Title & Status */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice Command Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isListening
              ? 'Listening to your voice...'
              : isProcessing
              ? 'AI Analyzing speech...'
              : 'Speak your expense or task'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Say anything like <span className="text-purple-300">"I spent 250 rupees on lunch"</span> or{' '}
            <span className="text-indigo-300">"Remind me to submit assignment tomorrow"</span>
          </p>
        </div>

        {/* Big Animated Microphone Button */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-purple-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full bg-indigo-500/15 animate-voice-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={handleToggleListen}
            disabled={isProcessing}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            className={`relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 shadow-rose-600/50 ring-4 ring-rose-400/50'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/40 ring-4 ring-purple-500/30 hover:ring-purple-400/50'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin" />
            ) : isListening ? (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Audio Wave Bars when listening */}
        {isListening ? (
          <div className="flex items-center gap-1.5 h-8 my-2">
            {[40, 75, 100, 60, 90, 45, 80, 55].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full animate-wave-bar"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                  height: `${h * 0.3}px`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-400 my-2">
            Click the microphone to start speaking
          </div>
        )}

        {/* Live Transcript / Interim Output */}
        {(interimText || lastTranscript || isListening) && (
          <div className="w-full max-w-lg mt-3 p-3.5 rounded-xl bg-[#0b0c20]/90 border border-purple-900/40 text-left">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-purple-400">
                {isListening ? 'Live Speech Input' : 'Recognized Command'}
              </span>
              {isListening && <span className="text-rose-400 animate-pulse font-mono">● Recording</span>}
            </div>

            <p className="text-sm font-medium text-slate-200 min-h-[1.5rem]">
              {interimText ? (
                <>
                  <span className="text-slate-300">{lastTranscript} </span>
                  <span className="text-cyan-300 italic">{interimText}...</span>
                </>
              ) : (
                lastTranscript || 'Listening for speech...'
              )}
            </p>
          </div>
        )}

        {/* Action Result Confirmation Card */}
        {lastResult && (
          <div className="w-full max-w-lg mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-indigo-950/40 border border-emerald-500/30 text-left flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Action Executed ({lastResult.type})
                </span>
                <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/40">
                  {lastResult.source}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">{lastResult.voiceFeedback}</p>
              {settings.voiceFeedbackEnabled && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Voice response spoken via SpeechSynthesis</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="w-full max-w-lg mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <p className="font-semibold">Microphone issue detected</p>
              <p className="text-rose-300/80 mt-0.5">{errorMessage}</p>
              <p className="text-[11px] text-purple-300 mt-1">
                Tip: You can use the quick demo chips below to test all features instantly!
              </p>
            </div>
          </div>
        )}

        {!isSupported && (
          <div className="w-full max-w-lg mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-semibold">Web Speech API not detected in this browser.</span>
              <p className="text-amber-300/80 mt-0.5">
                Speech recognition works best in Chrome, Edge, and Safari. You can still test voice processing with the demo chips below.
              </p>
            </div>
          </div>
        )}

        {/* Demo Commands for Hackathon Testing */}
        <div className="w-full max-w-2xl mt-5 pt-4 border-t border-purple-900/30">
          <div className="flex items-center justify-between mb-2.5 text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Quick Demo Commands (1-Click Test)
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Tap any chip to run & speak</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {demoCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleDemoClick(cmd.text)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141638] hover:bg-purple-900/40 text-slate-300 hover:text-white border border-purple-900/40 hover:border-purple-600/60 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <span>{cmd.label}</span>
                <ArrowRight className="w-3 h-3 text-purple-400 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
