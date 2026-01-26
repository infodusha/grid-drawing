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
        throw new Error(`Не удалось загрузить данные: ${response.statusText}`);
      }
      const data = await response.json();
      gridItems = data;
      loading = false;
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Произошла неизвестная ошибка";
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
    window.location.href = p(`/grid/${randomItem.id}?mask`);
  }
</script>

<main>
  <h1>Графические диктанты</h1>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка диктантов...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p class="error-message">Ошибка: {error}</p>
    </div>
  {:else}
    <TagFilter
      {availableTags}
      {selectedTags}
      onTagToggle={toggleTag}
      onReset={resetFilters}
    />

    <div class="actions-bar">
      <wired-button
        class="random-button"
        onclick={handleRandomClick}
        disabled={filteredItems.length === 0}
      >
        Случайный
      </wired-button>
      <span class="results-count">
        {filteredItems.length}
        {filteredItems.length === 1
          ? " элемент"
          : filteredItems.length < 5
            ? " элемента"
            : " элементов"}
        {selectedTags.size > 0 ? ` (отфильтровано)` : ""}
      </span>
    </div>

    {#if gridItems.length === 0}
      <div class="empty-state">
        <p>Нет доступных диктантов.</p>
      </div>
    {:else if filteredItems.length === 0}
      <div class="empty-state">
        <p>Не найдено диктантов, соответствующих выбранным фильтрам.</p>
        <wired-button class="reset-link-button" onclick={resetFilters}>
          Очистить фильтры
        </wired-button>
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
    color: var(--color-text-primary);
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

  .actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .random-button {
    font-size: 1em;
  }

  .random-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results-count {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: var(--color-bg-surface);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .empty-state p {
    color: var(--color-text-muted);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .reset-link-button {
    font-size: 0.875rem;
  }

  .grid-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
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
