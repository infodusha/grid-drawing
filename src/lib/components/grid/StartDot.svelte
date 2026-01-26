<script lang="ts">
  import type { RoughSVG } from "roughjs/bin/svg";

  interface Props {
    roughSvg: RoughSVG;
    x: number;
    y: number;
    shouldAnimate: boolean;
  }

  let { roughSvg, x, y, shouldAnimate }: Props = $props();

  // Consistent seed for stable dot rendering
  const dotSeed = 98765;

  // Dot options for sketchy circle
  const dotOptions = {
    roughness: 1,
    fill: "var(--color-start-dot)",
    fillStyle: "solid" as const,
    stroke: "none",
    seed: dotSeed,
  };

  // Diameter varies based on animation state
  const diameter = $derived(shouldAnimate ? 12 : 8);

  // Generate the rough circle element
  const dotElement = $derived(roughSvg.circle(x, y, diameter, dotOptions));
</script>

<g class="start-dot" class:animate={shouldAnimate}>
  {@html dotElement.outerHTML}
</g>

<style>
  .start-dot {
    transition: opacity 0.3s ease-out;
  }

  .start-dot.animate {
    animation: flash 1s ease-in-out;
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
