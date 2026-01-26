<script lang="ts">
  interface Props {
    message?: string;
  }

  let { message = "Загрузка..." }: Props = $props();
</script>

<div class="loading-container">
  <div class="spinner"></div>
  <p>{message}</p>
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-spinner-border);
    border-top-color: var(--color-spinner-top);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-container p {
    color: var(--color-text-muted);
    font-size: 1.1rem;
  }
</style>
