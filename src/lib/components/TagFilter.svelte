<script lang="ts">
  interface Props {
    availableTags: string[];
    selectedTags: Set<string>;
    onTagToggle: (tag: string) => void;
    onReset: () => void;
  }

  let { availableTags, selectedTags, onTagToggle, onReset }: Props = $props();
</script>

<div class="filter-container">
  <div class="filter-header">
    <h2 class="filter-title">Фильтры</h2>
    <wired-button
      class="reset-button"
      onclick={onReset}
      disabled={selectedTags.size === 0}
    >
      Сбросить
    </wired-button>
  </div>
  <div class="tags-list">
    {#each availableTags as tag}
      <wired-button class="tag-button" onclick={() => onTagToggle(tag)}>
        <wired-checkbox
          checked={selectedTags.has(tag)}
          onclick={(e) => {
            e.stopPropagation();
            onTagToggle(tag);
          }}
        ></wired-checkbox>
        {tag}
      </wired-button>
    {/each}
  </div>
</div>

<style>
  .filter-container {
    padding: 1.5rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 2rem;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .filter-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.87);
  }

  .reset-button {
    font-size: 0.875rem;
  }

  .reset-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .tag-button {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tag-button wired-checkbox {
    cursor: pointer;
    flex-shrink: 0;
  }

  @media (prefers-color-scheme: light) {
    .filter-container {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .filter-title {
      color: #213547;
    }
  }
</style>
