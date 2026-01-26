<script lang="ts">
  import { p } from "sv-router/generated";
</script>

<div class="not-found-container">
  <div class="error-content">
    <div class="error-number">404</div>

    <h1>Страница не найдена</h1>

    <p class="error-message">
      Похоже, вы забрели на не ту страницу. Страница, которую вы ищете, не
      существует.
    </p>

    <a href={p("/")}>
      <wired-button class="home-button">Вернуться на главную</wired-button>
    </a>
  </div>
</div>

<style>
  .not-found-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: var(--color-bg);
  }

  .error-content {
    text-align: center;
    max-width: 600px;
  }

  .error-number {
    font-size: clamp(5rem, 15vw, 8rem);
    font-weight: 900;
    line-height: 1;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin: 1rem 0;
    color: var(--color-text-primary);
  }

  .error-message {
    font-size: clamp(1rem, 2vw, 1.1rem);
    color: var(--color-text-muted);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .home-button {
    font-size: 1rem;
  }
</style>
