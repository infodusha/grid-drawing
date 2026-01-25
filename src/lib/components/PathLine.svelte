<script lang="ts">
  interface Props {
    pathString: string;
    pathLength: number;
    animatedLength: number;
    previousPathString?: string;
    previousPathLength?: number;
    isAnimatingBackwards: boolean;
  }

  let {
    pathString,
    pathLength,
    animatedLength,
    previousPathString = '',
    previousPathLength = 0,
    isAnimatingBackwards = false,
  }: Props = $props();

  const displayPath = $derived(
    isAnimatingBackwards && previousPathString ? previousPathString : pathString
  );
  const displayPathLength = $derived(
    isAnimatingBackwards && previousPathLength > 0 ? previousPathLength : pathLength
  );
</script>

{#if pathString}
  <path
    d={displayPath}
    fill="none"
    stroke="#646cff"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-dasharray={displayPathLength}
    stroke-dashoffset={Math.max(0, displayPathLength - animatedLength)}
    class="path-line"
  />
{/if}
