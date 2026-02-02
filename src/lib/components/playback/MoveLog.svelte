<script lang="ts">
  import MoveDisplay from "./MoveDisplay.svelte";

  interface Props {
    allMoves: string[];
    currentIndex: number;
    onSeek: (index: number) => void;
  }

  let { allMoves, currentIndex, onSeek }: Props = $props();

  let logContainer: HTMLDivElement;

  // Calculate the actual current index (currentIndex is one ahead)
  const actualCurrentIndex = $derived(currentIndex > 0 ? currentIndex - 1 : -1);

  // Scroll to current move when it changes
  $effect(() => {
    if (!logContainer) return;

    // Track actualCurrentIndex changes - accessing it makes the effect reactive
    const index = actualCurrentIndex;
    if (index < 0) return; // No current move yet

    // Use setTimeout to ensure DOM has updated with new classes
    setTimeout(() => {
      // Find the current move element using querySelector
      const currentMoveElement = logContainer.querySelector(
        `.move-item.current`,
      ) as HTMLDivElement | null;

      if (currentMoveElement) {
        // Get positions relative to the scroll container
        const containerRect = logContainer.getBoundingClientRect();
        const elementRect = currentMoveElement.getBoundingClientRect();

        // Calculate element's position relative to container's scrollable content
        // elementRect.top is relative to viewport, containerRect.top is container's top in viewport
        // Adding scrollTop gives us the absolute position in scrollable content
        const elementTopInScrollContent =
          elementRect.top - containerRect.top + logContainer.scrollTop;

        const elementHeight = elementRect.height;
        const containerHeight = logContainer.clientHeight;
        const scrollHeight = logContainer.scrollHeight;

        // Calculate scroll position to center the element
        const targetScrollTop =
          elementTopInScrollContent - containerHeight / 2 + elementHeight / 2;

        // Clamp to valid scroll range
        const maxScrollTop = Math.max(0, scrollHeight - containerHeight);
        const clampedScrollTop = Math.max(
          0,
          Math.min(targetScrollTop, maxScrollTop),
        );

        // Scroll to center the element
        logContainer.scrollTo({
          top: clampedScrollTop,
          behavior: "smooth",
        });
      }
    }, 0);
  });
</script>

<div class="move-log-container" bind:this={logContainer}>
  <div class="move-log">
    {#each allMoves as move, index (index)}
      {@const isPast = index < actualCurrentIndex}
      {@const isCurrent = index === actualCurrentIndex}
      {@const isFuture = index > actualCurrentIndex}
      <wired-button
        class="move-item"
        class:past={isPast}
        class:current={isCurrent}
        class:future={isFuture}
        onclick={() => onSeek(index)}
        aria-current={isCurrent ? 'true' : undefined}
      >
        <span class="move-number">{index + 1}.</span>
        <MoveDisplay {move} />
      </wired-button>
    {/each}
  </div>
</div>

<style>
  .move-log-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
    background-color: var(--color-bg-surface);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .move-log {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .move-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-family: monospace;
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    cursor: pointer;
  }

  .move-item.past {
    color: var(--color-text-disabled);
    font-size: 0.9em;
  }

  .move-item.current {
    color: var(--color-primary);
    font-weight: 600;
    font-size: 1.1em;
    background-color: var(--color-accent-bg);
    transform: scale(1.02);
  }

  .move-item.future {
    color: var(--color-text-muted);
    font-size: 0.95em;
  }

  .move-item:hover {
    transform: translateY(-1px);
  }

  .move-item.current:hover {
    transform: scale(1.02);
  }

  .move-item:active {
    transform: translateY(0);
  }

  .move-item.current:active {
    transform: scale(1.02);
  }

  .move-number {
    min-width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* Scrollbar styling */
  .move-log-container::-webkit-scrollbar {
    width: 8px;
  }

  .move-log-container::-webkit-scrollbar-track {
    background: var(--color-scrollbar-track);
    border-radius: 4px;
  }

  .move-log-container::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 4px;
  }

  .move-log-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-scrollbar-thumb-hover);
  }
</style>
