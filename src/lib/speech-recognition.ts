/**
 * `SpeechRecognition` never got a standard-track TypeScript definition (it's
 * still vendor-prefixed as `webkitSpeechRecognition` outside Chrome/Edge),
 * so lib.dom.d.ts doesn't declare it — this is the minimal ambient surface
 * this app actually uses, not the full spec.
 */
export interface SpeechRecognitionResultEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; [altIndex: number]: { transcript: string } };
  };
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/** Chrome/Edge support this; Firefox and Safari support is partial or
 * absent — callers must treat `null` as "hide the mic button", not an
 * error. */
export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}
