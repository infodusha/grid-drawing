export interface SpeechAnnouncerOptions {
  /** Speech rate (0.1 to 10, default: 1.0) */
  rate?: number;
  /** Speech pitch (0 to 2, default: 1.0) */
  pitch?: number;
  /** Speech volume (0 to 1, default: 1.0) */
  volume?: number;
  /** Voice to use */
  voice: SpeechSynthesisVoice;
}
