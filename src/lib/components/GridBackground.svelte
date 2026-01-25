<script lang="ts">
  interface Props {
    svgWidth: number;
    svgHeight: number;
    cellSize: number;
  }

  let { svgWidth, svgHeight, cellSize }: Props = $props();
</script>

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
