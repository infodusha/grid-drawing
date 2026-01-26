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
    <h2 class="filter-title">Filters</h2>
    <button
      class="reset-button"
      onclick={onReset}
      disabled={selectedTags.size === 0}
    >
      Reset
    </button>
  </div>
  <div class="tags-list">
    {#each availableTags as tag}
      <label class="tag-checkbox">
        <input
          type="checkbox"
          checked={selectedTags.has(tag)}
          onchange={() => onTagToggle(tag)}
        />
        <span class="tag-label">{tag}</span>
      </label>
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
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    background-color: #242424;
    color: rgba(255, 255, 255, 0.87);
    cursor: pointer;
    transition: all 0.25s;
  }

  .reset-button:hover:not(:disabled) {
    border-color: #646cff;
    background-color: #2a2a2a;
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

  .tag-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    background-color: #242424;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    transition: all 0.25s;
  }

  .tag-checkbox:hover {
    border-color: #646cff;
    background-color: #2a2a2a;
  }

  .tag-checkbox input[type="checkbox"] {
    cursor: pointer;
    accent-color: #646cff;
  }

  .tag-checkbox input[type="checkbox"]:checked + .tag-label {
    color: #646cff;
    font-weight: 500;
  }

  .tag-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    user-select: none;
    transition: color 0.25s;
  }

  @media (prefers-color-scheme: light) {
    .filter-container {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .filter-title {
      color: #213547;
    }

    .reset-button {
      background-color: #ffffff;
      color: #213547;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .reset-button:hover:not(:disabled) {
      background-color: #f0f0f0;
    }

    .tag-checkbox {
      background-color: #ffffff;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .tag-checkbox:hover {
      background-color: #f5f5f5;
    }

    .tag-label {
      color: rgba(33, 53, 71, 0.7);
    }
  }
</style>
