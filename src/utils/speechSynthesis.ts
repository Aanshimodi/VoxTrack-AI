// Speech Synthesis (Text to Speech) wrapper

export interface VoiceOption {
  name: string;
  lang: string;
  default: boolean;
}

class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public isVoiceMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onEnd?: () => void;
    }
  ): void {
    if (!this.synth || this.isMuted || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;

      const availableVoices = this.getVoices();
      if (options?.voiceName) {
        const found = availableVoices.find((v) => v.name === options.voiceName);
        if (found) utterance.voice = found;
      } else {
        // Preferred pleasant English voices
        const preferred = availableVoices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Victoria'))
        ) || availableVoices.find((v) => v.lang.startsWith('en'));

        if (preferred) utterance.voice = preferred;
      }

      if (options?.onEnd) {
        utterance.onend = () => options.onEnd?.();
        utterance.onerror = () => options.onEnd?.();
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      options?.onEnd?.();
    }
  }
}

export const speechOutput = new SpeechSynthesisService();
