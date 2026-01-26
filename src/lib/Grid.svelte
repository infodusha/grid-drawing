<script lang="ts">
  import rough from "roughjs";
  import type { RoughSVG } from "roughjs/bin/svg";
  import { MoveSequence } from "./MoveSequence";
  import {
    calculatePathCoordinates,
    buildPathString,
    calculatePathLength,
    getVisiblePoints,
  } from "./utils/pathCalculator";
  import { gridToSvg } from "./utils/coordinateConverter";
  import {
    createPathAnimation,
    updatePathAnimation,
    cleanupPathAnimation,
  } from "./utils/pathAnimation";
  import {
    createStartDotAnimation,
    updateStartDotAnimation,
    cleanupStartDotAnimation,
  } from "./utils/startDotAnimation";
  import GridBackground from "./components/GridBackground.svelte";
  import PathLine from "./components/PathLine.svelte";
  import StartDot from "./components/StartDot.svelte";

  interface Props {
    moveSequence?: MoveSequence;
    animationDuration?: number | null;
    isPlaying?: boolean;
  }

  let {
    moveSequence,
    animationDuration = null,
    isPlaying = true,
  }: Props = $props();

  // Extract values from MoveSequence if provided, otherwise use defaults
  const effectiveGridWidth = $derived(moveSequence?.gridWidth ?? 10);
  const effectiveGridHeight = $derived(moveSequence?.gridHeight ?? 10);
  const effectiveStartX = $derived(moveSequence?.startX ?? 0);
  const effectiveStartY = $derived(moveSequence?.startY ?? 0);
  const effectiveMoves = $derived(moveSequence?.moves ?? []);

  let containerElement: SVGSVGElement | undefined = $state();
  let containerWidth = $state(800);
  let containerHeight = $state(600);

  // Initialize Rough.js SVG instance
  let roughSvg: RoughSVG | undefined = $state();

  $effect(() => {
    if (containerElement) {
      roughSvg = rough.svg(containerElement);
    }
  });

  // Calculate cell size based on container dimensions
  const cellSize = $derived(
    Math.min(
      containerWidth / effectiveGridWidth,
      containerHeight / effectiveGridHeight,
    ),
  );

  // Calculate SVG dimensions
  const svgWidth = $derived(effectiveGridWidth * cellSize);
  const svgHeight = $derived(effectiveGridHeight * cellSize);

  // Calculate path coordinates from moves
  const pathCoordinates = $derived(
    calculatePathCoordinates(effectiveMoves, effectiveStartX, effectiveStartY),
  );

  // Build SVG path string (kept for animation state tracking)
  const pathString = $derived(buildPathString(pathCoordinates, cellSize));

  // Calculate path length for animation
  const pathLength = $derived(calculatePathLength(pathCoordinates, cellSize));

  // Initialize path animation state
  const pathAnimationState = createPathAnimation();

  // Track animated length reactively
  const animatedLength = $derived(pathAnimationState.animatedLength.current);

  // Get visible points for Rough.js based on animation progress
  const visiblePoints = $derived(
    getVisiblePoints(pathCoordinates, cellSize, animatedLength),
  );

  // Animate path when moves change, animation duration changes, or playing state changes
  $effect(() => {
    updatePathAnimation(
      pathAnimationState,
      effectiveMoves,
      pathString,
      pathLength,
      effectiveStartX,
      effectiveStartY,
      cellSize,
      animationDuration,
      isPlaying,
    );

    return () => {
      cleanupPathAnimation(pathAnimationState);
    };
  });

  // Starting point SVG coordinates
  const startPoint = $derived(
    gridToSvg(effectiveStartX, effectiveStartY, cellSize),
  );

  // Track if starting coordinates changed (for animation)
  let shouldAnimateDot = $state(false);
  const startDotAnimationState = createStartDotAnimation();

  // Detect coordinate changes and trigger animation
  $effect(() => {
    updateStartDotAnimation(
      startDotAnimationState,
      effectiveStartX,
      effectiveStartY,
      (value) => {
        shouldAnimateDot = value;
      },
    );

    return () => {
      cleanupStartDotAnimation(startDotAnimationState);
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
    {#if roughSvg}
      <GridBackground
        {roughSvg}
        {svgWidth}
        {svgHeight}
        {cellSize}
        gridWidth={effectiveGridWidth}
        gridHeight={effectiveGridHeight}
      />

      <PathLine {roughSvg} points={visiblePoints} />

      <StartDot
        {roughSvg}
        x={startPoint.x}
        y={startPoint.y}
        shouldAnimate={shouldAnimateDot}
      />
    {/if}
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
    background-color: var(--color-bg-surface);
    border-radius: 8px;
    padding: 1rem;
  }

  .grid-svg {
    max-width: 100%;
    max-height: 100%;
  }
</style>
