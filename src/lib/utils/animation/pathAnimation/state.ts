import { Tween } from "svelte/motion";
import type { PathAnimationState } from "../../../types";

/**
 * Creates and manages path animation state
 */
export function createPathAnimation(): PathAnimationState {
  const animatedLength = new Tween(0, {
    duration: 1000,
    easing: (t) => t, // Linear easing for smooth drawing without bounce
  });

  return {
    animatedLength,
    previousMoves: [],
    previousPathString: "",
    previousPathLength: 0,
    isPathInitialized: false,
    isAnimatingBackwards: false,
    backwardsAnimationTimeout: null,
    customDuration: null,
    isPaused: false,
    pausedTarget: null,
    pausedRemainingDuration: null,
    animationStartTime: null,
  };
}

/**
 * Cleans up path animation state
 */
export function cleanupPathAnimation(state: PathAnimationState): void {
  if (state.backwardsAnimationTimeout) {
    clearTimeout(state.backwardsAnimationTimeout);
  }
}
