<script lang="ts">
  interface Props {
    id: string;
    name: string;
    tags: string[];
    href: string;
  }

  let { id, name, tags, href }: Props = $props();
</script>

<a class="grid-card-link" {href}>
  <wired-card class="grid-card">
    <h3 class="grid-name">{name}</h3>
    <div class="tags-container">
      {#each tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </wired-card>
</a>

<style>
  .grid-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .grid-card {
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .grid-card-link:hover .grid-card {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow-primary);
  }

  .grid-card-link:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: 8px;
  }

  .grid-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    background-color: var(--color-bg-tag);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
</style>
