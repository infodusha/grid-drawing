<script lang="ts">
  interface Props {
    id: string;
    name: string;
    tags: string[];
    href: string;
  }

  let { id, name, tags, href }: Props = $props();
</script>

<a class="grid-card" href={href}>
  <h3 class="grid-name">{name}</h3>
  <div class="tags-container">
    {#each tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</a>

<style>
  .grid-card {
    padding: 1.5rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
  }

  .grid-card:hover {
    border-color: #646cff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(100, 108, 255, 0.2);
  }

  .grid-card:focus-visible {
    outline: 2px solid #646cff;
    outline-offset: 2px;
  }

  .grid-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.87);
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    background-color: #242424;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (prefers-color-scheme: light) {
    .grid-card {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .grid-card:hover {
      border-color: #646cff;
      box-shadow: 0 4px 12px rgba(100, 108, 255, 0.15);
    }

    .grid-name {
      color: #213547;
    }

    .tag {
      background-color: #ffffff;
      border-color: rgba(0, 0, 0, 0.1);
      color: rgba(33, 53, 71, 0.7);
    }
  }
</style>
