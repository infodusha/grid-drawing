<script lang="ts">
  interface Props {
    x: number;
    y: number;
    shouldAnimate: boolean;
  }

  let { x, y, shouldAnimate }: Props = $props();
</script>

<circle
  cx={x}
  cy={y}
  r="6"
  fill="#ff3e00"
  class="start-dot"
  class:animate={shouldAnimate}
/>

<style>
  .start-dot {
    transition:
      cx 0.3s ease-out,
      cy 0.3s ease-out;
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
