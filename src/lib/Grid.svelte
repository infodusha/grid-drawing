<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { MoveSequence } from './MoveSequence';

  interface Props {
    moveSequence?: MoveSequence;
  }

  let {
    moveSequence,
  }: Props = $props();

  // Extract values from MoveSequence if provided, otherwise use individual props
  const effectiveGridWidth = $derived(moveSequence?.gridWidth ?? 10);
  const effectiveGridHeight = $derived(moveSequence?.gridHeight ?? 10);
  const effectiveStartX = $derived(moveSequence?.startX ?? 0);
  const effectiveStartY = $derived(moveSequence?.startY ?? 0);
  const effectiveMoves = $derived(moveSequence?.moves ?? []);

  let containerElement: SVGSVGElement;
  let containerWidth = $state(800);
  let containerHeight = $state(600);

  // Calculate cell size based on container dimensions
  const cellSize = $derived(
    Math.min(containerWidth / effectiveGridWidth, containerHeight / effectiveGridHeight)
  );

  // Calculate SVG dimensions
  const svgWidth = $derived(effectiveGridWidth * cellSize);
  const svgHeight = $derived(effectiveGridHeight * cellSize);

  // Parse move command (e.g., "2R", "3B", "2RB")
  function parseMove(move: string): { dx: number; dy: number } {
    const match = move.match(/^(\d+)([LRTB]+)$/);
    if (!match) return { dx: 0, dy: 0 };

    const distance = parseInt(match[1], 10);
    const directions = match[2];

    let dx = 0;
    let dy = 0;

    for (const dir of directions) {
      switch (dir) {
        case 'L':
          dx -= distance;
          break;
        case 'R':
          dx += distance;
          break;
        case 'T':
          dy -= distance;
          break;
        case 'B':
          dy += distance;
          break;
      }
    }

    return { dx, dy };
  }

  // Calculate path coordinates from moves
  const pathCoordinates = $derived.by(() => {
    const points: Array<{ x: number; y: number }> = [];
    let currentX = effectiveStartX;
    let currentY = effectiveStartY;

    // Add starting point
    points.push({ x: currentX, y: currentY });

    // Process each move
    for (const move of effectiveMoves) {
      const { dx, dy } = parseMove(move);
      currentX += dx;
      currentY += dy;
      points.push({ x: currentX, y: currentY });
    }

    return points;
  });

  // Convert grid coordinates to SVG coordinates
  // Align with grid lines (not centered in cells)
  function gridToSvg(x: number, y: number): { x: number; y: number } {
    return {
      x: x * cellSize,
      y: y * cellSize
    };
  }

  // Build SVG path string
  const pathString = $derived.by(() => {
    if (pathCoordinates.length === 0) return '';

    const svgPoints = pathCoordinates.map((p) => gridToSvg(p.x, p.y));
    const first = svgPoints[0];
    let path = `M ${first.x} ${first.y}`;

    for (let i = 1; i < svgPoints.length; i++) {
      path += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
    }

    return path;
  });

  // Animated path length for drawing effect
  const pathLength = $derived.by(() => {
    if (pathCoordinates.length < 2) return 0;

    let totalLength = 0;
    const svgPoints = pathCoordinates.map((p) => gridToSvg(p.x, p.y));

    for (let i = 1; i < svgPoints.length; i++) {
      const dx = svgPoints[i].x - svgPoints[i - 1].x;
      const dy = svgPoints[i].y - svgPoints[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    return totalLength;
  });

  // Tweened value for path drawing animation
  const animatedLength = new Tween(0, {
    duration: 1000,
    easing: (t) => t // Linear easing for smooth drawing without bounce
  });

  // Track previous moves and path for smooth reverse animation
  let previousMoves = $state<string[]>([]);
  let previousPathString = $state('');
  let previousPathLength = $state(0);
  let isPathInitialized = $state(false);
  let isAnimatingBackwards = $state(false);
  let backwardsAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

  // Animate path when moves change
  $effect(() => {
    const currentPathLength = pathLength;
    const currentMoves = effectiveMoves;
    const currentStartX = effectiveStartX;
    const currentStartY = effectiveStartY;
    
    if (!isPathInitialized) {
      // Initialize without animation
      animatedLength.set(currentPathLength, { duration: 0 });
      previousMoves = [...currentMoves];
      previousPathString = pathString;
      previousPathLength = currentPathLength;
      isPathInitialized = true;
      return;
    }
    
    // Detect if moves array changed
    const movesChanged = JSON.stringify(currentMoves) !== JSON.stringify(previousMoves);
    
    if (movesChanged) {
      // Capture previous path info BEFORE updating (needed for reverse animation)
      const oldPathString = previousPathString || pathString;
      const oldPathLength = previousPathLength || currentPathLength;
      
      // Get current animated length
      const currentAnimated = animatedLength.current;
      
      // Calculate the length of the common prefix (unchanged moves)
      let commonLength = 0;
      for (let i = 0; i < Math.min(previousMoves.length, currentMoves.length); i++) {
        if (previousMoves[i] === currentMoves[i]) {
          commonLength++;
        } else {
          break;
        }
      }
      
      // Calculate path length up to common moves
      let commonPathLength = 0;
      if (commonLength > 0) {
        let x = currentStartX;
        let y = currentStartY;
        const svgPoints: Array<{ x: number; y: number }> = [gridToSvg(x, y)];
        
        for (let i = 0; i < commonLength; i++) {
          const { dx, dy } = parseMove(currentMoves[i]);
          x += dx;
          y += dy;
          svgPoints.push(gridToSvg(x, y));
        }
        
        for (let i = 1; i < svgPoints.length; i++) {
          const dx = svgPoints[i].x - svgPoints[i - 1].x;
          const dy = svgPoints[i].y - svgPoints[i - 1].y;
          commonPathLength += Math.sqrt(dx * dx + dy * dy);
        }
      }
      
      // Calculate the remaining length to animate
      let remainingLength: number;
      let animationDuration: number;
      
      // If path got shorter (moves removed), animate backwards smoothly
      if (currentPathLength < currentAnimated) {
        // Clear any existing timeout
        if (backwardsAnimationTimeout) {
          clearTimeout(backwardsAnimationTimeout);
        }
        
        // Calculate how much to animate backwards
        remainingLength = currentAnimated - currentPathLength;
        animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));
        
        // Set flag to use previous path during reverse animation
        isAnimatingBackwards = true;
        // Update previous path info to the OLD path (before removal)
        previousPathString = oldPathString;
        previousPathLength = oldPathLength;
        
        // Animate backwards (reverse) - smooth linear animation going backwards
        // Start from current animated length and animate down to new shorter length
        animatedLength.set(currentPathLength, { 
          duration: animationDuration,
          easing: (t) => t // Linear easing - smooth reverse drawing
        });
        
        // Reset flag after animation completes
        backwardsAnimationTimeout = setTimeout(() => {
          isAnimatingBackwards = false;
          backwardsAnimationTimeout = null;
        }, animationDuration);
      } else if (currentPathLength > currentAnimated) {
        // Clear backwards flag and timeout when adding moves
        if (backwardsAnimationTimeout) {
          clearTimeout(backwardsAnimationTimeout);
          backwardsAnimationTimeout = null;
        }
        isAnimatingBackwards = false;
        // Path got longer (moves added), continue smoothly from current position
        remainingLength = currentPathLength - currentAnimated;
        animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));
        
        // Continue the animation forward - tweened will handle smooth transition
        animatedLength.set(currentPathLength, { 
          duration: animationDuration,
          easing: (t) => t // Linear easing for smooth drawing without bounce
        });
      } else {
        // Same length but different path - animate from common portion
        remainingLength = Math.abs(currentPathLength - commonPathLength);
        animationDuration = Math.max(200, Math.min(500, remainingLength * 1.5));
        
        // Only reset if common path is different from current
        if (commonPathLength !== currentAnimated) {
          animatedLength.set(commonPathLength, { duration: 0 });
        }
        animatedLength.set(currentPathLength, { 
          duration: animationDuration,
          easing: (t) => t // Linear easing
        });
      }
      
      // Update previous path info AFTER checking for changes
      // Store current values as previous for next comparison
      previousMoves = [...currentMoves];
      // Only update previous path if we're not animating backwards
      // (during backwards animation, we want to keep the old longer path)
      if (!isAnimatingBackwards) {
        previousPathString = pathString;
        previousPathLength = currentPathLength;
      }
    }
    
    return () => {
      // Cleanup timeout on effect cleanup
      if (backwardsAnimationTimeout) {
        clearTimeout(backwardsAnimationTimeout);
      }
    };
  });

  // Starting point SVG coordinates
  const startPoint = $derived(gridToSvg(effectiveStartX, effectiveStartY));

  // Track if starting coordinates just changed (for animation)
  let shouldAnimateDot = $state(false);
  let dotAnimationTimeout: ReturnType<typeof setTimeout> | null = null;
  let previousX = $state(0);
  let previousY = $state(0);
  let isInitialized = $state(false);

  // Detect coordinate changes and trigger animation
  $effect(() => {
    const x = effectiveStartX;
    const y = effectiveStartY;
    
    // Skip animation on initial mount
    if (!isInitialized) {
      previousX = x;
      previousY = y;
      isInitialized = true;
      return;
    }
    
    // Only animate if coordinates actually changed
    if (x !== previousX || y !== previousY) {
      // Clear any existing timeout
      if (dotAnimationTimeout) {
        clearTimeout(dotAnimationTimeout);
      }
      
      // Trigger animation
      shouldAnimateDot = true;
      
      // Reset animation flag after animation completes
      dotAnimationTimeout = setTimeout(() => {
        shouldAnimateDot = false;
        dotAnimationTimeout = null;
      }, 1000);
      
      previousX = x;
      previousY = y;
    }
    
    return () => {
      if (dotAnimationTimeout) {
        clearTimeout(dotAnimationTimeout);
      }
    };
  });

  // Handle resize
  function handleResize() {
    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      containerWidth = rect.width || 800;
      containerHeight = rect.height || 600;
    }
  }

  $effect(() => {
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerElement) {
      resizeObserver.observe(containerElement);
    }
    return () => resizeObserver.disconnect();
  });
</script>

<div class="grid-container">
  <svg
    bind:this={containerElement}
    class="grid-svg"
    viewBox="0 0 {svgWidth} {svgHeight}"
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
  >
    <!-- Grid lines -->
    <defs>
      <pattern
        id="grid"
        width={cellSize}
        height={cellSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M {cellSize} 0 L 0 0 0 {cellSize}"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          stroke-width="1"
        />
      </pattern>
    </defs>

    <!-- Grid background -->
    <rect width="100%" height="100%" fill="url(#grid)" />

    <!-- Grid border -->
    <rect
      x="0"
      y="0"
      width={svgWidth}
      height={svgHeight}
      fill="none"
      stroke="rgba(255, 255, 255, 0.4)"
      stroke-width="2"
    />

    <!-- Path -->
    {#if pathString}
      {@const displayPath = isAnimatingBackwards && previousPathString ? previousPathString : pathString}
      {@const displayPathLength = isAnimatingBackwards && previousPathLength > 0 ? previousPathLength : pathLength}
      <path
        d={displayPath}
        fill="none"
        stroke="#646cff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-dasharray={displayPathLength}
        stroke-dashoffset={Math.max(0, displayPathLength - animatedLength.current)}
        class="path-line"
      />
    {/if}

    <!-- Starting point dot -->
    <circle
      cx={startPoint.x}
      cy={startPoint.y}
      r="6"
      fill="#ff3e00"
      class="start-dot"
      class:animate={shouldAnimateDot}
    />
  </svg>
</div>

<style>
  .grid-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
    border-radius: 8px;
    padding: 1rem;
  }

  .grid-svg {
    max-width: 100%;
    max-height: 100%;
  }


  .start-dot {
    transition: cx 0.3s ease-out, cy 0.3s ease-out;
  }

  .start-dot.animate {
    animation: flash 1s ease-in-out;
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
</style>