<script lang="ts">
  interface Props {
    current: number;
    total: number;
  }

  let { current, total }: Props = $props();

  const percentage = $derived(
    total > 0 ? Math.round((current / total) * 100) : 0,
  );
</script>

<div class="progress-container">
  <div class="progress-bar">
    <div
      class="progress-fill"
      style="width: {percentage}%"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Прогресс ходов"
    ></div>
  </div>
  <div class="progress-text">
    {current} / {total} ({percentage}%)
  </div>
</div>

<style>
  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: var(--color-progress-bg);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-progress-fill);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .progress-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-align: center;
  }
</style>
