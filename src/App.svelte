<script lang="ts">
  import Grid from './lib/Grid.svelte'

  let gridWidth = $state(15)
  let gridHeight = $state(15)
  let startX = $state(2)
  let startY = $state(2)
  let moves = $state(['2R', '3B', '1L', '2RB', '3T', '4R'])

  function addMove() {
    const moveOptions = ['1R', '2R', '3R', '1L', '2L', '3L', '1B', '2B', '3B', '1T', '2T', '3T', '2RB', '2LB', '2RT', '2LT']
    const randomMove = moveOptions[Math.floor(Math.random() * moveOptions.length)]
    moves = [...moves, randomMove]
  }

  function removeMove() {
    if (moves.length > 0) {
      moves = moves.slice(0, -1)
    }
  }

  function resetMoves() {
    moves = []
  }
</script>

<main>
  <h1>Grid Drawing</h1>

  <div class="controls">
    <div class="control-group">
      <label>
        Grid Width:
        <input type="number" bind:value={gridWidth} min="5" max="30" />
      </label>
      <label>
        Grid Height:
        <input type="number" bind:value={gridHeight} min="5" max="30" />
      </label>
    </div>
    <div class="control-group">
      <label>
        Start X:
        <input type="number" bind:value={startX} min="0" max={gridWidth - 1} />
      </label>
      <label>
        Start Y:
        <input type="number" bind:value={startY} min="0" max={gridHeight - 1} />
      </label>
    </div>
    <div class="control-group">
      <button onclick={addMove}>Add Random Move</button>
      <button onclick={removeMove}>Remove Last Move</button>
      <button onclick={resetMoves}>Reset Moves</button>
    </div>
    <div class="moves-display">
      <strong>Moves:</strong> {moves.join(', ') || '(none)'}
    </div>
  </div>

  <div class="grid-wrapper">
    <Grid
      {gridWidth}
      {gridHeight}
      {startX}
      {startY}
      {moves}
    />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    margin: 0;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .control-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .control-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .control-group input {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: #242424;
    color: inherit;
    width: 80px;
  }

  .control-group button {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    border: 1px solid transparent;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }

  .control-group button:hover {
    border-color: #646cff;
  }

  .moves-display {
    padding: 0.5rem;
    background-color: #242424;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .grid-wrapper {
    width: 100%;
    height: 600px;
    min-height: 400px;
  }
</style>
