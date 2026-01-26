<script lang="ts">
  interface Props {
    isMasked: boolean;
    onToggle: () => void;
  }

  let { isMasked, onToggle }: Props = $props();
</script>

<wired-button
  class="mask-toggle"
  onclick={onToggle}
  aria-label={isMasked ? "Показать поле" : "Скрыть поле"}
>
  {isMasked ? "Показать" : "Скрыть"}
</wired-button>

<style>
  .mask-toggle {
    font-size: 1em;
  }

</style>
