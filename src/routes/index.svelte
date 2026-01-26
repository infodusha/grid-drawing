<script lang="ts">
  import { onMount } from "svelte";
  import { p } from "sv-router/generated";
  import GridItemCard from "../lib/components/GridItemCard.svelte";
  import TagFilter from "../lib/components/TagFilter.svelte";

  interface GridItem {
    id: string;
    name: string;
    tags: string[];
  }

  let loading = $state(true);
  let error = $state<string | null>(null);
  let gridItems = $state<GridItem[]>([]);
  let selectedTags = $state<Set<string>>(new Set());

  const availableTags = $derived.by(() => {
    const tags = new Set<string>();
    gridItems.forEach((item) => {
      item.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  const filteredItems = $derived(
    selectedTags.size === 0
      ? gridItems
      : gridItems.filter((item) => {
          return Array.from(selectedTags).every((tag) =>
            item.tags.includes(tag),
          );
        }),
  );

  onMount(async () => {
    try {
      const response = await fetch("/data.json");
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const data = await response.json();
      gridItems = data;
      loading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error occurred";
      loading = false;
    }
  });

  function toggleTag(tag: string) {
    const newSet = new Set(selectedTags);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    selectedTags = newSet;
  }

  function resetFilters() {
    selectedTags = new Set();
  }

  function handleRandomClick() {
    if (filteredItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    const randomItem = filteredItems[randomIndex];
    window.location.href = p(`/grid/${randomItem.id}`);
  }
</script>

<main>
  <h1>Grid Drawings</h1>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading grids...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p class="error-message">Error: {error}</p>
    </div>
  {:else}
    <TagFilter
      {availableTags}
      {selectedTags}
      onTagToggle={toggleTag}
      onReset={resetFilters}
    />

    <div class="actions-bar">
      <button
        class="random-button"
        onclick={handleRandomClick}
        disabled={filteredItems.length === 0}
      >
        Random
      </button>
      <span class="results-count">
        {filteredItems.length}
        {filteredItems.length === 1 ? "item" : "items"}
        {selectedTags.size > 0 ? `(filtered)` : ""}
      </span>
    </div>

    {#if gridItems.length === 0}
      <div class="empty-state">
        <p>No grids available.</p>
      </div>
    {:else if filteredItems.length === 0}
      <div class="empty-state">
        <p>No grids found matching the selected filters.</p>
        <button class="reset-link-button" onclick={resetFilters}>
          Clear filters
        </button>
      </div>
    {:else}
      <div class="grid-list">
        {#each filteredItems as item (item.id)}
          <GridItemCard
            id={item.id}
            name={item.name}
            tags={item.tags}
            href={p(`/grid/${item.id}`)}
          />
        {/each}
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    margin: 0 0 2rem 0;
    font-size: 2.5rem;
    color: rgba(255, 255, 255, 0.87);
  }

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
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #646cff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-container p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }

  .error-container {
    padding: 2rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 0, 0, 0.3);
  }

  .error-message {
    color: rgba(255, 100, 100, 0.9);
    margin: 0;
    font-size: 1.1rem;
  }

  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .random-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid transparent;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #646cff;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
  }

  .random-button:hover:not(:disabled) {
    background-color: #535bf2;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(100, 108, 255, 0.3);
  }

  .random-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results-count {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .empty-state p {
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .reset-link-button {
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

  .reset-link-button:hover {
    border-color: #646cff;
    background-color: #2a2a2a;
  }

  .grid-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (prefers-color-scheme: light) {
    h1 {
      color: #213547;
    }

    .loading-container p {
      color: rgba(33, 53, 71, 0.7);
    }

    .error-container {
      background-color: #f9f9f9;
      border-color: rgba(255, 0, 0, 0.2);
    }

    .error-message {
      color: rgba(200, 50, 50, 0.9);
    }

    .results-count {
      color: rgba(33, 53, 71, 0.7);
    }

    .empty-state {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .empty-state p {
      color: rgba(33, 53, 71, 0.7);
    }

    .reset-link-button {
      background-color: #ffffff;
      color: #213547;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .reset-link-button:hover {
      background-color: #f0f0f0;
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
    }

    .grid-list {
      grid-template-columns: 1fr;
    }

    .actions-bar {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
