// Speech Recognition abstraction with cross-browser support

export interface SpeechRecognitionHookState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// Browser API declarations
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (finalText: string, interimText: string) => void;
  private onStatusChangeCallback?: (isListening: boolean, error?: string | null) => void;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as any) : {};
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Works great for Indian English, US English & numbers

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusChangeCallback?.(true, null);
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          this.onResultCallback?.(final.trim(), interim.trim());
        };

        this.recognition.onerror = (event: any) => {
          let errorMsg = 'Speech recognition error occurred.';
          if (event.error === 'not-allowed') {
            errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          } else if (event.error === 'no-speech') {
            errorMsg = 'No speech was detected. Please try speaking closer to your microphone.';
          } else if (event.error === 'network') {
            errorMsg = 'Network error occurred during speech recognition.';
          } else if (event.error === 'audio-capture') {
            errorMsg = 'No microphone device was found.';
          }
          this.isListening = false;
          this.onStatusChangeCallback?.(false, errorMsg);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStatusChangeCallback?.(false, null);
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public setCallbacks(
    onResult: (finalText: string, interimText: string) => void,
    onStatusChange: (isListening: boolean, error?: string | null) => void
  ) {
    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;
  }

  public start() {
    if (!this.recognition) return;
    try {
      this.recognition.abort(); // Cancel any prior session
      this.recognition.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  }

  public stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn('Could not stop recognition:', e);
    }
  }

  public abort() {
    if (!this.recognition) return;
    try {
      this.recognition.abort();
    } catch (e) {
      console.warn('Could not abort recognition:', e);
    }
  }
}

export const speechService = new SpeechRecognitionService();
