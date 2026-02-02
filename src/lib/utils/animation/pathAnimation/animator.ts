import type { PathAnimationState } from "../../../types";
import {
  calculateCommonPathLength,
  findCommonPrefixLength,
} from "./calculator";

/**
 * Pauses the current animation at its current position
 */
export function pausePathAnimation(state: PathAnimationState): void {
  if (state.isPaused) return;

  const currentValue = state.animatedLength.current;

  // Calculate remaining duration if we have animation start time and target
  if (
    state.animationStartTime !== null &&
    state.pausedTarget !== null &&
    state.pausedRemainingDuration !== null
  ) {
    const elapsed = Date.now() - state.animationStartTime;
    const remaining = Math.max(0, state.pausedRemainingDuration - elapsed);
    state.pausedRemainingDuration = remaining;
  }

  // Stop the animation by setting it to current value with duration 0
  state.animatedLength.set(currentValue, { duration: 0 });
  state.isPaused = true;
}

/**
 * Resumes the animation from its current position
 */
export function resumePathAnimation(state: PathAnimationState): void {
  if (!state.isPaused) return;

  const currentValue = state.animatedLength.current;

  // If we have a target and remaining duration, resume the animation
  if (
    state.pausedTarget !== null &&
    state.pausedRemainingDuration !== null &&
    state.pausedRemainingDuration > 0
  ) {
    const distanceToTarget = Math.abs(state.pausedTarget - currentValue);
    if (distanceToTarget > 0.1) {
      // Resume with remaining duration
      state.animatedLength.set(state.pausedTarget, {
        duration: state.pausedRemainingDuration,
        easing: (t) => t,
      });
      state.animationStartTime = Date.now();
    } else {
      // Already at target, clear pause state
      state.pausedTarget = null;
      state.pausedRemainingDuration = null;
      state.animationStartTime = null;
    }
  } else if (state.pausedTarget !== null) {
    // If duration expired or no duration, just set to target immediately
    const distanceToTarget = Math.abs(state.pausedTarget - currentValue);
    if (distanceToTarget > 0.1) {
      state.animatedLength.set(state.pausedTarget, { duration: 0 });
    }
    state.pausedTarget = null;
    state.pausedRemainingDuration = null;
    state.animationStartTime = null;
  }

  state.isPaused = false;
}

/**
 * Updates path animation based on changes to moves
 */
export function updatePathAnimation(
  state: PathAnimationState,
  currentMoves: string[],
  currentPathString: string,
  currentPathLength: number,
  startX: number,
  startY: number,
  cellSize: number,
  customDuration?: number | null,
  isPlaying?: boolean,
): void {
  // Store custom duration if provided
  if (customDuration !== undefined && customDuration !== null) {
    state.customDuration = customDuration;
  }

  // Initialize without animation on first run
  if (!state.isPathInitialized) {
    state.animatedLength.set(currentPathLength, { duration: 0 });
    state.previousMoves = [...currentMoves];
    state.previousPathString = currentPathString;
    state.previousPathLength = currentPathLength;
    state.isPathInitialized = true;
    return;
  }

  // Detect if moves array changed
  const movesChanged =
    JSON.stringify(currentMoves) !== JSON.stringify(state.previousMoves);

  // Handle pause/resume based on isPlaying state
  if (isPlaying !== undefined) {
    if (!isPlaying && !state.isPaused) {
      pausePathAnimation(state);
    } else if (isPlaying && state.isPaused) {
      // Resume the animation
      resumePathAnimation(state);
      // If moves changed while paused, we need to process them now
      // The resume function already started animating to pausedTarget if it existed
      // If moves changed, we'll update the target below and it will take precedence
    }
  }

  if (!movesChanged) {
    return;
  }

  // If moves changed while paused, update target but don't start animation
  if (state.isPaused) {
    if (state.backwardsAnimationTimeout) {
      clearTimeout(state.backwardsAnimationTimeout);
      state.backwardsAnimationTimeout = null;
    }
    state.isAnimatingBackwards = false;
    state.pausedTarget = null;
    state.pausedRemainingDuration = null;
    state.animationStartTime = null;
    state.animatedLength.set(currentPathLength, { duration: 0 });
    state.previousMoves = [...currentMoves];
    state.previousPathString = currentPathString;
    state.previousPathLength = currentPathLength;
    return;
  }

  // Capture previous path info BEFORE updating (needed for reverse animation)
  const oldPathString = state.previousPathString || currentPathString;
  const oldPathLength = state.previousPathLength || currentPathLength;

  // Get current animated length
  const currentAnimated = state.animatedLength.current;

  // Calculate the length of the common prefix (unchanged moves)
  const commonLength = findCommonPrefixLength(
    state.previousMoves,
    currentMoves,
  );
  const commonPathLength = calculateCommonPathLength(
    currentMoves,
    commonLength,
    startX,
    startY,
    cellSize,
  );

  // Calculate the remaining length to animate
  let remainingLength: number;
  let animationDuration: number;

  // Use custom duration if available, otherwise calculate based on length
  const useCustomDuration =
    state.customDuration !== null && currentPathLength > currentAnimated;

  // If path got shorter (moves removed), animate backwards smoothly
  if (currentPathLength < currentAnimated) {
    // Clear any existing timeout
    if (state.backwardsAnimationTimeout) {
      clearTimeout(state.backwardsAnimationTimeout);
    }

    // Calculate how much to animate backwards
    remainingLength = currentAnimated - currentPathLength;
    animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));

    // Set flag to use previous path during reverse animation
    state.isAnimatingBackwards = true;
    // Update previous path info to the OLD path (before removal)
    state.previousPathString = oldPathString;
    state.previousPathLength = oldPathLength;

    // Animate backwards (reverse) - smooth linear animation going backwards
    state.pausedTarget = currentPathLength;
    state.pausedRemainingDuration = animationDuration;

    // Only start animation if not paused
    if (!state.isPaused) {
      state.animationStartTime = Date.now();
      state.animatedLength.set(currentPathLength, {
        duration: animationDuration,
        easing: (t) => t, // Linear easing - smooth reverse drawing
      });
    }

    // Reset flag after animation completes
    state.backwardsAnimationTimeout = setTimeout(() => {
      state.isAnimatingBackwards = false;
      state.backwardsAnimationTimeout = null;
    }, animationDuration);
  } else if (currentPathLength > currentAnimated) {
    // Clear backwards flag and timeout when adding moves
    if (state.backwardsAnimationTimeout) {
      clearTimeout(state.backwardsAnimationTimeout);
      state.backwardsAnimationTimeout = null;
    }
    state.isAnimatingBackwards = false;
    // Path got longer (moves added), continue smoothly from current position
    remainingLength = currentPathLength - currentAnimated;
    // Use custom duration if available, otherwise calculate based on length
    animationDuration = useCustomDuration
      ? state.customDuration!
      : Math.max(200, Math.min(500, remainingLength * 1.5));

    // Clear custom duration after using it
    if (useCustomDuration) {
      state.customDuration = null;
    }

    // Continue the animation forward
    state.pausedTarget = currentPathLength;
    state.pausedRemainingDuration = animationDuration;

    // Only start animation if not paused
    if (!state.isPaused) {
      state.animationStartTime = Date.now();
      state.animatedLength.set(currentPathLength, {
        duration: animationDuration,
        easing: (t) => t, // Linear easing for smooth drawing without bounce
      });
    }
  } else {
    // Same length but different path - animate from common portion
    remainingLength = Math.abs(currentPathLength - commonPathLength);
    // Use custom duration if available, otherwise calculate based on length
    animationDuration = useCustomDuration
      ? state.customDuration!
      : Math.max(200, Math.min(500, remainingLength * 1.5));

    // Clear custom duration after using it
    if (useCustomDuration) {
      state.customDuration = null;
    }

    // Only reset if common path is different from current
    if (commonPathLength !== currentAnimated && !state.isPaused) {
      state.animatedLength.set(commonPathLength, { duration: 0 });
    }
    state.pausedTarget = currentPathLength;
    state.pausedRemainingDuration = animationDuration;

    // Only start animation if not paused
    if (!state.isPaused) {
      state.animationStartTime = Date.now();
      state.animatedLength.set(currentPathLength, {
        duration: animationDuration,
        easing: (t) => t, // Linear easing
      });
    }
  }

  // Update previous path info AFTER checking for changes
  // Store current values as previous for next comparison
  state.previousMoves = [...currentMoves];
  // Only update previous path if we're not animating backwards
  // (during backwards animation, we want to keep the old longer path)
  if (!state.isAnimatingBackwards) {
    state.previousPathString = currentPathString;
    state.previousPathLength = currentPathLength;
  }
}
