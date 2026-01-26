import type { SpeechAnnouncerOptions } from "../../types";

/**
 * Utility for announcing moves using the Web SpeechSynthesis API
 */

/**
 * Converts a move string (e.g., "2R", "3B", "2RB") to a readable text format
 */
function moveToText(move: string) {
  const match = move.match(/^(\d+)([LRTB]+)$/);
  if (!match) {
    return move;
  }

  const [, distance, directions] = match;

  const directionMap: Record<string, string> = {
    L: "влево",
    R: "вправо",
    T: "наверх",
    B: "вниз",
  };

  const directionNames = directions
    .split("")
    .map((d) => directionMap[d])
    .filter(Boolean);

  if (directionNames.length === 0) {
    return `${distance}`;
  }

  if (directionNames.length === 1) {
    return `${distance} ${directionNames[0]}`;
  }

  if (directionNames.length === 2) {
    return `${distance} ${directionNames[0]} и ${directionNames[1]}`;
  }
}

export class SpeechAnnouncer {
  private options: Required<SpeechAnnouncerOptions>;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = true;

  constructor(options: SpeechAnnouncerOptions) {
    this.options = {
      rate: options.rate ?? 1.0,
      pitch: options.pitch ?? 1.0,
      volume: options.volume ?? 1.0,
      voice: options.voice,
    };
  }

  /**
   * Check if speech synthesis is available
   */
  static isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window
    );
  }

  /**
   * Enable or disable speech announcements
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.currentUtterance) {
      this.cancel();
    }
  }

  /**
   * Check if announcements are enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Update speech options
   */
  updateOptions(options: Partial<SpeechAnnouncerOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  /**
   * Announce a move
   */
  announceMove(move: string): void {
    if (!this.isEnabled || !SpeechAnnouncer.isAvailable()) {
      return;
    }

    // Cancel any ongoing speech
    this.cancel();

    const text = moveToText(move);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.options.rate;
    utterance.pitch = this.options.pitch;
    utterance.volume = this.options.volume;

    if (this.options.voice) {
      utterance.voice = this.options.voice;
    }

    this.currentUtterance = utterance;

    // Clean up reference when speech ends
    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
    };

    utterance.onerror = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Announce multiple moves (e.g., when catching up)
   */
  announceMoves(moves: string[], startIndex: number = 0): void {
    if (
      !this.isEnabled ||
      !SpeechAnnouncer.isAvailable() ||
      moves.length === 0
    ) {
      return;
    }

    this.cancel();

    const lastMove = moves[moves.length - 1];
    this.announceMove(lastMove);
  }

  /**
   * Cancel any ongoing speech
   */
  cancel(): void {
    if (SpeechAnnouncer.isAvailable()) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.cancel();
  }
}
