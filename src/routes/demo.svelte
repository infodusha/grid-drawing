<script lang="ts">
  import { onMount } from "svelte";
  import Grid from "../lib/Grid.svelte";
  import { MoveSequence } from "../lib/MoveSequence";

  let moveSequence = $state(new MoveSequence());

  onMount(async () => {
    try {
      const catData = await fetch(
        "/data/26eb1c24-a4d4-4042-ac9b-defaa8b8aa17.json",
      );
      moveSequence = MoveSequence.fromJSON(await catData.json());
    } catch (error) {
      console.error("Failed to load cat.json:", error);
    }
  });

  // Helper function to update moveSequence and trigger reactivity
  function updateMoveSequence(updater: (ms: MoveSequence) => void) {
    const updated = moveSequence.clone();
    updater(updated);
    moveSequence = updated;
  }

  // Derived values for two-way binding with inputs
  const gridWidth = $derived(moveSequence.gridWidth);
  const gridHeight = $derived(moveSequence.gridHeight);
  const startX = $derived(moveSequence.startX);
  const startY = $derived(moveSequence.startY);

  // Setters for two-way binding
  function setGridWidth(value: number) {
    updateMoveSequence((ms) => {
      ms.gridWidth = value;
    });
  }

  function setGridHeight(value: number) {
    updateMoveSequence((ms) => {
      ms.gridHeight = value;
    });
  }

  function setStartX(value: number) {
    updateMoveSequence((ms) => {
      ms.startX = value;
    });
  }

  function setStartY(value: number) {
    updateMoveSequence((ms) => {
      ms.startY = value;
    });
  }

  function addMove() {
    const moveOptions = [
      "1R",
      "2R",
      "3R",
      "1L",
      "2L",
      "3L",
      "1B",
      "2B",
      "3B",
      "1T",
      "2T",
      "3T",
      "2RB",
      "2LB",
      "2RT",
      "2LT",
    ];
    const randomMove =
      moveOptions[Math.floor(Math.random() * moveOptions.length)];
    updateMoveSequence((ms) => {
      ms.addMove(randomMove);
    });
  }

  function removeMove() {
    updateMoveSequence((ms) => {
      ms.removeMove();
    });
  }

  function resetMoves() {
    updateMoveSequence((ms) => {
      ms.clearMoves();
    });
  }

  function exportJSON() {
    const json = moveSequence.toJSON();
    const jsonString = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "move-sequence.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        moveSequence = MoveSequence.fromJSON(json);
        // Reset file input
        input.value = "";
      } catch (error) {
        alert(
          "Failed to import JSON: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
      }
    };
    reader.readAsText(file);
  }
</script>

<main>
  <h1>Grid Drawing</h1>

  <div class="controls">
    <div class="control-group">
      <label>
        Grid Width:
        <input
          type="number"
          value={gridWidth}
          oninput={(e) =>
            setGridWidth(Number((e.target as HTMLInputElement).value))}
          min="5"
          max="30"
        />
      </label>
      <label>
        Grid Height:
        <input
          type="number"
          value={gridHeight}
          oninput={(e) =>
            setGridHeight(Number((e.target as HTMLInputElement).value))}
          min="5"
          max="30"
        />
      </label>
    </div>
    <div class="control-group">
      <label>
        Start X:
        <input
          type="number"
          value={startX}
          oninput={(e) =>
            setStartX(Number((e.target as HTMLInputElement).value))}
          min="0"
          max={gridWidth - 1}
        />
      </label>
      <label>
        Start Y:
        <input
          type="number"
          value={startY}
          oninput={(e) =>
            setStartY(Number((e.target as HTMLInputElement).value))}
          min="0"
          max={gridHeight - 1}
        />
      </label>
    </div>
    <div class="control-group">
      <button onclick={addMove}>Add Random Move</button>
      <button onclick={removeMove}>Remove Last Move</button>
      <button onclick={resetMoves}>Reset Moves</button>
    </div>
    <div class="control-group">
      <button onclick={exportJSON}>Export JSON</button>
      <label class="import-button">
        Import JSON
        <input
          type="file"
          accept=".json"
          onchange={importJSON}
          style="display: none;"
        />
      </label>
    </div>
    <div class="moves-display">
      <strong>Moves:</strong>
      {moveSequence.moves.join(", ") || "(none)"}
    </div>
  </div>

  <div class="grid-wrapper">
    <Grid {moveSequence} />
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

  .import-button {
    padding: 0.6em 1.2em;
    border-radius: 8px;
    border: 1px solid transparent;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
    display: inline-block;
  }

  .import-button:hover {
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
