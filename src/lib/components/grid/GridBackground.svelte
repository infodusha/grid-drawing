<script lang="ts">
  import type { RoughSVG } from "roughjs/bin/svg";

  interface Props {
    roughSvg: RoughSVG;
    svgWidth: number;
    svgHeight: number;
    cellSize: number;
    gridWidth: number;
    gridHeight: number;
  }

  let {
    roughSvg,
    svgWidth,
    svgHeight,
    cellSize,
    gridWidth,
    gridHeight,
  }: Props = $props();

  // Consistent seed for stable grid rendering
  const baseSeed = 12345;

  // Grid line options
  const gridLineOptions = {
    roughness: 0.5,
    strokeWidth: 1,
    stroke: "var(--color-grid-line)",
    bowing: 0.3,
  };

  // Border options
  const borderOptions = {
    roughness: 0.8,
    strokeWidth: 2,
    stroke: "var(--color-grid-border)",
    fill: "none",
    bowing: 0.5,
  };

  // Generate vertical grid lines
  const verticalLines = $derived(
    Array.from({ length: gridWidth + 1 }, (_, i) => {
      const x = i * cellSize;
      return roughSvg.line(x, 0, x, svgHeight, {
        ...gridLineOptions,
        seed: baseSeed + i,
      });
    }),
  );

  // Generate horizontal grid lines
  const horizontalLines = $derived(
    Array.from({ length: gridHeight + 1 }, (_, i) => {
      const y = i * cellSize;
      return roughSvg.line(0, y, svgWidth, y, {
        ...gridLineOptions,
        seed: baseSeed + 1000 + i,
      });
    }),
  );

  // Generate border rectangle
  const borderRect = $derived(
    roughSvg.rectangle(0, 0, svgWidth, svgHeight, {
      ...borderOptions,
      seed: baseSeed + 2000,
    }),
  );
</script>

<g class="grid-background">
  <!-- Vertical lines -->
  {#each verticalLines as line}
    {@html line.outerHTML}
  {/each}

  <!-- Horizontal lines -->
  {#each horizontalLines as line}
    {@html line.outerHTML}
  {/each}

  <!-- Border -->
  {@html borderRect.outerHTML}
</g>
