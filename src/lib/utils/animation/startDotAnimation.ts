import type { StartDotAnimationState } from "../../types";

/**
 * Creates start dot animation state
 */
export function createStartDotAnimation(): StartDotAnimationState {
  return {
    dotAnimationTimeout: null,
    previousX: 0,
    previousY: 0,
    isInitialized: false,
  };
}

/**
 * Updates start dot animation state based on coordinate changes
 * Returns true if animation should be triggered
 */
export function updateStartDotAnimation(
  state: StartDotAnimationState,
  x: number,
  y: number,
  setShouldAnimate: (value: boolean) => void,
): void {
  // Skip animation on initial mount
  if (!state.isInitialized) {
    state.previousX = x;
    state.previousY = y;
    state.isInitialized = true;
    return;
  }

  // Only animate if coordinates actually changed
  if (x !== state.previousX || y !== state.previousY) {
    // Clear any existing timeout
    if (state.dotAnimationTimeout) {
      clearTimeout(state.dotAnimationTimeout);
    }

    // Trigger animation
    setShouldAnimate(true);

    // Reset animation flag after animation completes
    state.dotAnimationTimeout = setTimeout(() => {
      setShouldAnimate(false);
      state.dotAnimationTimeout = null;
    }, 1000);

    state.previousX = x;
    state.previousY = y;
  }
}

/**
 * Cleans up start dot animation state
 */
export function cleanupStartDotAnimation(state: StartDotAnimationState): void {
  if (state.dotAnimationTimeout) {
    clearTimeout(state.dotAnimationTimeout);
  }
}
