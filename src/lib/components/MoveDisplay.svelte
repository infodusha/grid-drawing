<script lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    ArrowDownRight,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowUpLeft,
  } from '@lucide/svelte'

  interface Props {
    move: string;
  }

  let { move }: Props = $props();

  // Parse move string to extract number and directions
  const parsedMove = $derived(() => {
    const match = move.match(/^(\d+)([LRTB]+)$/);
    if (!match) return { number: move, directions: "" };

    return {
      number: match[1],
      directions: match[2],
    };
  });

  // Determine arrow type based on directions
  const arrowType = $derived(() => {
    const { directions } = parsedMove();

    if (directions.length === 1) {
      return directions as "L" | "R" | "T" | "B";
    } else if (directions.length === 2) {
      // Two-directional moves: RB, RT, LB, LT
      if (directions.includes("R") && directions.includes("B")) return "RB";
      if (directions.includes("R") && directions.includes("T")) return "RT";
      if (directions.includes("L") && directions.includes("B")) return "LB";
      if (directions.includes("L") && directions.includes("T")) return "LT";
    }

    return null;
  });
</script>

<span class="move-display">
  <span class="move-number">{parsedMove().number}</span>
  {#if arrowType() === "L"}
    <ArrowLeft size={20} class="arrow-icon" />
  {:else if arrowType() === "R"}
    <ArrowRight size={20} class="arrow-icon" />
  {:else if arrowType() === "T"}
    <ArrowUp size={20} class="arrow-icon" />
  {:else if arrowType() === "B"}
    <ArrowDown size={20} class="arrow-icon" />
  {:else if arrowType() === "RB"}
    <!-- Right + Bottom = ↘ -->
    <ArrowDownRight size={20} class="arrow-icon" />
  {:else if arrowType() === "RT"}
    <!-- Right + Top = ↗ -->
    <ArrowUpRight size={20} class="arrow-icon" />
  {:else if arrowType() === "LB"}
    <!-- Left + Bottom = ↙ -->
    <ArrowDownLeft size={20} class="arrow-icon" />
  {:else if arrowType() === "LT"}
    <!-- Left + Top = ↖ -->
    <ArrowUpLeft size={20} class="arrow-icon" />
  {:else}
    <span class="move-text">{move}</span>
  {/if}
</span>

<style>
  .move-display {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .move-number {
    font-variant-numeric: tabular-nums;
  }

  .arrow-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
