import { Tween } from "svelte/motion";

export interface PathAnimationState {
  animatedLength: Tween<number>;
  previousMoves: string[];
  previousPathString: string;
  previousPathLength: number;
  isPathInitialized: boolean;
  isAnimatingBackwards: boolean;
  backwardsAnimationTimeout: ReturnType<typeof setTimeout> | null;
  customDuration: number | null;
  isPaused: boolean;
  pausedTarget: number | null;
  pausedRemainingDuration: number | null;
  animationStartTime: number | null;
}

export interface StartDotAnimationState {
  dotAnimationTimeout: ReturnType<typeof setTimeout> | null;
  previousX: number;
  previousY: number;
  isInitialized: boolean;
}
