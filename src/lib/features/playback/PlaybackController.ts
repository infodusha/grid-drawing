import { MoveSequence } from "../../core/MoveSequence";
import type { PlaybackState } from "../../types";

export class PlaybackController {
  private moveSequence: MoveSequence;
  private state: PlaybackState;
  private timeouts: number[] = [];
  private startTime: number | null = null;
  private pausedTime: number = 0;
  private onStateChangeCallback?: (state: PlaybackState) => void;
  private onMoveRevealedCallback?: (revealedMoves: string[]) => void;
  private onMoveAnnounceCallback?: (move: string) => void;
  private onMoveDurationCallback?: (duration: number) => void;

  // Track remaining delay time when paused
  private currentMoveDelayStartTime: number | null = null;
  private remainingDelayTime: number | null = null;

  // Base duration per unit of move (in milliseconds)
  private readonly BASE_DURATION_PER_UNIT = 750;

  constructor(moveSequence: MoveSequence) {
    this.moveSequence = moveSequence;
    this.state = {
      isPlaying: false,
      currentMoveIndex: 0,
      speedMultiplier: 1.0,
    };
  }

  /**
   * Extract the numeric value from a move string (e.g., "5R" -> 5)
   * Adds an extra unit if the move has 2 directions (e.g., "2RB" -> 3)
   */
  private getMoveValue(move: string): number {
    const match = move.match(/^(\d+)([LRTB]+)$/);
    if (!match) return 1;

    const value = parseInt(match[1], 10);
    const directions = match[2];

    // Add an extra unit if move has 2 directions
    return directions.length === 2 ? value + 1 : value;
  }

  /**
   * Calculate the duration for a specific move based on its value
   */
  private getMoveDuration(move: string): number {
    const moveValue = this.getMoveValue(move);
    return (
      (this.BASE_DURATION_PER_UNIT * moveValue) / this.state.speedMultiplier
    );
  }

  /**
   * Get the moves that have been revealed up to the current index
   */
  getRevealedMoves(): string[] {
    return this.moveSequence.moves.slice(0, this.state.currentMoveIndex);
  }

  /**
   * Get the current playback state
   */
  getState(): Readonly<PlaybackState> {
    return { ...this.state };
  }

  /**
   * Set callback for state changes
   */
  onStateChange(callback: (state: PlaybackState) => void) {
    this.onStateChangeCallback = callback;
  }

  /**
   * Set callback for when moves are revealed
   */
  onMoveRevealed(callback: (revealedMoves: string[]) => void) {
    this.onMoveRevealedCallback = callback;
  }

  /**
   * Set callback for when a move should be announced (before the delay)
   */
  onMoveAnnounce(callback: (move: string) => void) {
    this.onMoveAnnounceCallback = callback;
  }

  /**
   * Set callback for when a move duration is available (for animation timing)
   */
  onMoveDuration(callback: (duration: number) => void) {
    this.onMoveDurationCallback = callback;
  }

  /**
   * Notify listeners of state changes
   */
  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
    if (this.onMoveRevealedCallback) {
      this.onMoveRevealedCallback(this.getRevealedMoves());
    }
  }

  /**
   * Clear all pending timeouts
   */
  private clearTimeouts() {
    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts = [];
  }

  /**
   * Start playing the sequence from the beginning
   */
  start() {
    this.clearTimeouts();
    this.state.isPlaying = true;
    this.state.currentMoveIndex = 0;
    this.pausedTime = 0;
    this.startTime = Date.now();
    this.remainingDelayTime = null;
    this.currentMoveDelayStartTime = null;
    this.notifyStateChange();

    this.scheduleNextMove();
  }

  /**
   * Resume playback from the current position
   */
  play() {
    if (this.state.isPlaying) {
      return; // Already playing
    }

    if (this.state.currentMoveIndex >= this.moveSequence.moves.length) {
      // Already completed, restart from beginning
      this.start();
      return;
    }

    this.state.isPlaying = true;
    this.startTime = Date.now() - this.pausedTime;
    this.notifyStateChange();

    // If we have remaining delay time, wait for it before scheduling next move
    if (this.remainingDelayTime !== null && this.remainingDelayTime > 0) {
      const timeoutId = window.setTimeout(() => {
        this.remainingDelayTime = null;
        this.currentMoveDelayStartTime = null;
        if (this.state.isPlaying) {
          this.scheduleNextMove();
        }
      }, this.remainingDelayTime);
      this.timeouts.push(timeoutId);
    } else {
      // No remaining delay, schedule next move immediately
      this.remainingDelayTime = null;
      this.currentMoveDelayStartTime = null;
      this.scheduleNextMove();
    }
  }

  /**
   * Pause the playback
   */
  pause() {
    if (!this.state.isPlaying) {
      return; // Already paused
    }

    this.clearTimeouts();
    this.state.isPlaying = false;

    if (this.startTime !== null) {
      this.pausedTime = Date.now() - this.startTime;
    }

    // Calculate remaining delay time for current move
    // Note: currentMoveIndex has already been incremented, so we need to look at the previous move
    if (this.currentMoveDelayStartTime !== null) {
      const previousMoveIndex = this.state.currentMoveIndex - 1;
      if (previousMoveIndex >= 0) {
        const previousMove = this.moveSequence.moves[previousMoveIndex];
        if (previousMove) {
          const totalDuration = this.getMoveDuration(previousMove);
          const elapsed = Date.now() - this.currentMoveDelayStartTime;
          this.remainingDelayTime = Math.max(0, totalDuration - elapsed);
        }
      }
    }

    this.notifyStateChange();
  }

  /**
   * Stop playback and reset to the beginning
   */
  stop() {
    this.clearTimeouts();
    this.state.isPlaying = false;
    this.state.currentMoveIndex = 0;
    this.pausedTime = 0;
    this.startTime = null;
    this.remainingDelayTime = null;
    this.currentMoveDelayStartTime = null;
    this.notifyStateChange();
  }

  /**
   * Set the playback speed multiplier (1.0 = normal, 2.0 = 2x speed, 0.5 = half speed)
   */
  setSpeed(multiplier: number) {
    if (multiplier <= 0) {
      throw new Error("Speed multiplier must be greater than 0");
    }

    const wasPlaying = this.state.isPlaying;

    if (wasPlaying) {
      this.pause();
    }

    this.state.speedMultiplier = multiplier;

    if (wasPlaying) {
      this.play();
    } else {
      this.notifyStateChange();
    }
  }

  /**
   * Get the current speed multiplier
   */
  getSpeed(): number {
    return this.state.speedMultiplier;
  }

  /**
   * Schedule the next move to be revealed
   */
  private scheduleNextMove() {
    if (!this.state.isPlaying) {
      return;
    }

    if (this.state.currentMoveIndex >= this.moveSequence.moves.length) {
      // All moves have been revealed
      this.state.isPlaying = false;
      this.remainingDelayTime = null;
      this.currentMoveDelayStartTime = null;
      this.notifyStateChange();
      return;
    }

    const currentMove = this.moveSequence.moves[this.state.currentMoveIndex];
    const duration = this.getMoveDuration(currentMove);

    // Notify about the duration for animation timing
    if (this.onMoveDurationCallback) {
      this.onMoveDurationCallback(duration);
    }

    // Track when this move's delay starts
    this.currentMoveDelayStartTime = Date.now();

    // Announce the move before the delay
    if (this.onMoveAnnounceCallback) {
      this.onMoveAnnounceCallback(currentMove);
    }

    // Reveal the move immediately so animation can start
    this.state.currentMoveIndex++;
    this.notifyStateChange();

    // Wait for the duration before scheduling the next move
    // (animation will run during this delay)
    const timeoutId = window.setTimeout(() => {
      this.currentMoveDelayStartTime = null;
      if (this.state.isPlaying) {
        this.scheduleNextMove();
      }
    }, duration);

    this.timeouts.push(timeoutId);
  }

  /**
   * Update the move sequence (useful if the sequence changes)
   */
  updateMoveSequence(moveSequence: MoveSequence) {
    const wasPlaying = this.state.isPlaying;

    if (wasPlaying) {
      this.pause();
    }

    this.moveSequence = moveSequence;

    // Reset if we've gone past the new sequence length
    if (this.state.currentMoveIndex > moveSequence.moves.length) {
      this.state.currentMoveIndex = moveSequence.moves.length;
    }

    if (wasPlaying) {
      this.play();
    } else {
      this.notifyStateChange();
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clearTimeouts();
    this.onStateChangeCallback = undefined;
    this.onMoveRevealedCallback = undefined;
    this.onMoveAnnounceCallback = undefined;
    this.onMoveDurationCallback = undefined;
  }
}
