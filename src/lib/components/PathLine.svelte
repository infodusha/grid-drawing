<script lang="ts">
  import type { RoughSVG } from 'roughjs/bin/svg'

  interface Props {
    roughSvg: RoughSVG
    points: [number, number][]
  }

  let { roughSvg, points }: Props = $props()

  // Consistent seed for stable path rendering
  const pathSeed = 54321

  // Path options for sketchy line drawing
  const pathOptions = {
    roughness: 0.5,
    strokeWidth: 3,
    stroke: 'var(--color-path)',
    bowing: 0.3,
    seed: pathSeed,
    preserveVertices: true,
    disableMultiStroke: true,
  }

  // Build SVG path string from points (M x y L x y L x y...)
  function buildPathString(pts: [number, number][]): string {
    if (pts.length < 2) return ''
    const [first, ...rest] = pts
    return `M ${first[0]} ${first[1]} ` + rest.map(p => `L ${p[0]} ${p[1]}`).join(' ')
  }

  // Generate the rough path element using path() for continuous line
  const pathString = $derived(buildPathString(points))
  const pathElement = $derived(
    pathString
      ? roughSvg.path(pathString, pathOptions)
      : null
  )
</script>

{#if pathElement}
  <g class="path-line">
    {@html pathElement.outerHTML}
  </g>
{/if}

<style>
  .path-line :global(path) {
    stroke-linejoin: round;
    stroke-linecap: round;
  }
</style>
