import { MoveSequence } from "../MoveSequence";

export interface PlaybackState {
  isPlaying: boolean;
  currentMoveIndex: number;
  speedMultiplier: number;
}

export class PlaybackController {
  private moveSequence: MoveSequence;
  private state: PlaybackState;
  private timeouts: number[] = [];
  private startTime: number | null = null;
  private pausedTime: number = 0;
  private onStateChangeCallback?: (state: PlaybackState) => void;
  private onMoveRevealedCallback?: (revealedMoves: string[]) => void;

  // Base duration per unit of move (in milliseconds)
  private readonly BASE_DURATION_PER_UNIT = 500; // 0.5 seconds

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
   */
  private getMoveValue(move: string): number {
    const match = move.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  /**
   * Calculate the duration for a specific move based on its value
   */
  private getMoveDuration(move: string): number {
    const moveValue = this.getMoveValue(move);
    return (this.BASE_DURATION_PER_UNIT * moveValue) / this.state.speedMultiplier;
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

    this.scheduleNextMove();
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
      this.notifyStateChange();
      return;
    }

    const currentMove = this.moveSequence.moves[this.state.currentMoveIndex];
    const duration = this.getMoveDuration(currentMove);

    const timeoutId = window.setTimeout(() => {
      this.state.currentMoveIndex++;
      this.notifyStateChange();

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
  }
}
