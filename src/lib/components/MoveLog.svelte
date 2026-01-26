<script lang="ts">
  interface Props {
    allMoves: string[];
    currentIndex: number;
  }

  let { allMoves, currentIndex }: Props = $props();

  let logContainer: HTMLDivElement;

  // Scroll to current move when it changes
  $effect(() => {
    if (!logContainer) return;
    
    // Find the current move element using querySelector
    const currentMoveElement = logContainer.querySelector(
      `.move-item.current`
    ) as HTMLDivElement | null;
    
    if (currentMoveElement) {
      const scrollTop = logContainer.scrollTop;
      const elementTop = currentMoveElement.offsetTop;
      const elementHeight = currentMoveElement.offsetHeight;
      const containerHeight = logContainer.clientHeight;

      // Check if element is outside visible area
      if (
        elementTop < scrollTop ||
        elementTop + elementHeight > scrollTop + containerHeight
      ) {
        // Center the current move in the viewport
        logContainer.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: "smooth",
        });
      }
    }
  });
</script>

<div class="move-log-container" bind:this={logContainer}>
  <div class="move-log">
    {#each allMoves as move, index (index)}
      {@const isPast = index < currentIndex}
      {@const isCurrent = index === currentIndex}
      {@const isFuture = index > currentIndex}
      <div
        class="move-item"
        class:past={isPast}
        class:current={isCurrent}
        class:future={isFuture}
      >
        <span class="move-number">{index + 1}.</span>
        <span class="move-text">{move}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .move-log-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
  }

  .move-item.past {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9em;
  }

  .move-item.current {
    color: #646cff;
    font-weight: 600;
    font-size: 1.1em;
    background-color: rgba(100, 108, 255, 0.1);
    transform: scale(1.02);
  }

  .move-item.future {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.95em;
  }

  .move-number {
    min-width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .move-text {
    flex: 1;
  }

  /* Scrollbar styling */
  .move-log-container::-webkit-scrollbar {
    width: 8px;
  }

  .move-log-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .move-log-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .move-log-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (prefers-color-scheme: light) {
    .move-log-container {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .move-item.past {
      color: rgba(33, 53, 71, 0.4);
    }

    .move-item.current {
      color: #646cff;
      background-color: rgba(100, 108, 255, 0.15);
    }

    .move-item.future {
      color: rgba(33, 53, 71, 0.5);
    }

    .move-log-container::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }

    .move-log-container::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }

    .move-log-container::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
</style>
