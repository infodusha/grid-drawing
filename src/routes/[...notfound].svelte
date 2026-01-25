<script lang="ts">
  import { p } from 'sv-router/generated';
</script>

<div class="not-found-container">
  <div class="error-content">
    <div class="error-number">404</div>
    
    <h1>Page Not Found</h1>
    
    <p class="error-message">
      Looks like you've wandered off the grid! The page you're looking for doesn't exist.
    </p>
    
    <a class="home-button" href={p('/')}>
      Return to Grid
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
    background-color: #242424;
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
    color: #646cff;
  }

  h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin: 1rem 0;
    color: rgba(255, 255, 255, 0.87);
  }

  .error-message {
    font-size: clamp(1rem, 2vw, 1.1rem);
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .home-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    font-family: inherit;
    color: rgba(255, 255, 255, 0.87);
    background-color: #646cff;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.25s;
  }

  .home-button:hover {
    background-color: #535bf2;
  }

  @media (prefers-color-scheme: light) {
    .not-found-container {
      background-color: #ffffff;
    }

    h1 {
      color: #213547;
    }

    .error-message {
      color: rgba(33, 53, 71, 0.7);
    }
  }
</style>