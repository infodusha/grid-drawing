<script lang="ts">
  interface Props {
    message: string;
  }

  let { message }: Props = $props();
</script>

<div class="error-container">
  <p class="error-message">Ошибка: {message}</p>
</div>

<style>
  .error-container {
    padding: 2rem;
    background-color: var(--color-bg-surface);
    border-radius: 8px;
    border: 1px solid var(--color-border-error);
  }

  .error-message {
    color: var(--color-error);
    margin: 0;
    font-size: 1.1rem;
  }
</style>
