<script lang="ts">
  interface Props {
    isMasked: boolean;
    onToggle: () => void;
  }

  let { isMasked, onToggle }: Props = $props();
</script>

<button
  class="mask-toggle"
  onclick={onToggle}
  aria-label={isMasked ? "Показать поле" : "Скрыть поле"}
>
  {isMasked ? "Показать" : "Скрыть"}
</button>

<style>
  .mask-toggle {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    color: rgba(255, 255, 255, 0.87);
    cursor: pointer;
    transition: all 0.25s;
  }

  .mask-toggle:hover {
    border-color: #646cff;
    background-color: #242424;
  }

  @media (prefers-color-scheme: light) {
    .mask-toggle {
      background-color: #ffffff;
      color: #213547;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .mask-toggle:hover {
      background-color: #f0f0f0;
    }
  }
</style>
