import { Tween } from 'svelte/motion';
import { parseMove } from './moveParser';
import { gridToSvg } from './coordinateConverter';

export interface PathAnimationState {
  animatedLength: Tween<number>;
  previousMoves: string[];
  previousPathString: string;
  previousPathLength: number;
  isPathInitialized: boolean;
  isAnimatingBackwards: boolean;
  backwardsAnimationTimeout: ReturnType<typeof setTimeout> | null;
}

/**
 * Creates and manages path animation state
 */
export function createPathAnimation(): PathAnimationState {
  const animatedLength = new Tween(0, {
    duration: 1000,
    easing: (t) => t // Linear easing for smooth drawing without bounce
  });

  return {
    animatedLength,
    previousMoves: [],
    previousPathString: '',
    previousPathLength: 0,
    isPathInitialized: false,
    isAnimatingBackwards: false,
    backwardsAnimationTimeout: null,
  };
}

/**
 * Calculates the length of the common prefix between two move arrays
 */
function calculateCommonPathLength(
  moves: string[],
  commonLength: number,
  startX: number,
  startY: number,
  cellSize: number
): number {
  if (commonLength === 0) return 0;

  let x = startX;
  let y = startY;
  const svgPoints: Array<{ x: number; y: number }> = [gridToSvg(x, y, cellSize)];

  for (let i = 0; i < commonLength; i++) {
    const { dx, dy } = parseMove(moves[i]);
    x += dx;
    y += dy;
    svgPoints.push(gridToSvg(x, y, cellSize));
  }

  let commonPathLength = 0;
  for (let i = 1; i < svgPoints.length; i++) {
    const dx = svgPoints[i].x - svgPoints[i - 1].x;
    const dy = svgPoints[i].y - svgPoints[i - 1].y;
    commonPathLength += Math.sqrt(dx * dx + dy * dy);
  }

  return commonPathLength;
}

/**
 * Finds the common prefix length between two move arrays
 */
function findCommonPrefixLength(previousMoves: string[], currentMoves: string[]): number {
  let commonLength = 0;
  for (let i = 0; i < Math.min(previousMoves.length, currentMoves.length); i++) {
    if (previousMoves[i] === currentMoves[i]) {
      commonLength++;
    } else {
      break;
    }
  }
  return commonLength;
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
  cellSize: number
): void {
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
  const movesChanged = JSON.stringify(currentMoves) !== JSON.stringify(state.previousMoves);

  if (!movesChanged) return;

  // Capture previous path info BEFORE updating (needed for reverse animation)
  const oldPathString = state.previousPathString || currentPathString;
  const oldPathLength = state.previousPathLength || currentPathLength;

  // Get current animated length
  const currentAnimated = state.animatedLength.current;

  // Calculate the length of the common prefix (unchanged moves)
  const commonLength = findCommonPrefixLength(state.previousMoves, currentMoves);
  const commonPathLength = calculateCommonPathLength(
    currentMoves,
    commonLength,
    startX,
    startY,
    cellSize
  );

  // Calculate the remaining length to animate
  let remainingLength: number;
  let animationDuration: number;

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
    state.animatedLength.set(currentPathLength, {
      duration: animationDuration,
      easing: (t) => t // Linear easing - smooth reverse drawing
    });

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
    animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));

    // Continue the animation forward
    state.animatedLength.set(currentPathLength, {
      duration: animationDuration,
      easing: (t) => t // Linear easing for smooth drawing without bounce
    });
  } else {
    // Same length but different path - animate from common portion
    remainingLength = Math.abs(currentPathLength - commonPathLength);
    animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));

    // Only reset if common path is different from current
    if (commonPathLength !== currentAnimated) {
      state.animatedLength.set(commonPathLength, { duration: 0 });
    }
    state.animatedLength.set(currentPathLength, {
      duration: animationDuration,
      easing: (t) => t // Linear easing
    });
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

/**
 * Cleans up path animation state
 */
export function cleanupPathAnimation(state: PathAnimationState): void {
  if (state.backwardsAnimationTimeout) {
    clearTimeout(state.backwardsAnimationTimeout);
  }
}
