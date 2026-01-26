<script lang="ts">
  import { PlaybackController, type PlaybackState } from "../utils/playback";

  interface Props {
    playbackController: PlaybackController | null;
    playbackState: PlaybackState;
    onPlay: () => void;
    onPause: () => void;
    onSpeedChange: (speed: number) => void;
  }

  let {
    playbackController,
    playbackState,
    onPlay,
    onPause,
    onSpeedChange,
  }: Props = $props();

  const speedValue = $derived(playbackState.speedMultiplier);
  const isPlaying = $derived(playbackState.isPlaying);

  function handleSpeedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newSpeed = parseFloat(target.value);
    onSpeedChange(newSpeed);
  }

  function handlePlayPause() {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }
</script>

<div class="playback-controls">
  <button
    class="play-pause-button"
    onclick={handlePlayPause}
    disabled={playbackController === null}
    aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
  >
    {#if isPlaying}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    {/if}
  </button>

  <div class="speed-control">
    <label for="speed-slider">Скорость:</label>
    <input
      id="speed-slider"
      type="range"
      min="0.25"
      max="3"
      step="0.25"
      value={speedValue}
      oninput={handleSpeedChange}
      disabled={playbackController === null}
      class="speed-slider"
    />
    <span class="speed-value">{speedValue.toFixed(2)}x</span>
  </div>
</div>

<style>
  .playback-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .play-pause-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid transparent;
    background-color: #646cff;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
    padding: 0;
  }

  .play-pause-button:hover:not(:disabled) {
    background-color: #535bf2;
    transform: scale(1.05);
  }

  .play-pause-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .speed-control label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
  }

  .speed-slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
  }

  .speed-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #646cff;
    cursor: pointer;
    transition: background 0.2s;
  }

  .speed-slider::-webkit-slider-thumb:hover {
    background: #535bf2;
  }

  .speed-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #646cff;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
  }

  .speed-slider::-moz-range-thumb:hover {
    background: #535bf2;
  }

  .speed-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .speed-value {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.87);
    min-width: 50px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-color-scheme: light) {
    .playback-controls {
      background-color: #f9f9f9;
      border-color: rgba(0, 0, 0, 0.1);
    }

    .speed-control label {
      color: rgba(33, 53, 71, 0.7);
    }

    .speed-slider {
      background: rgba(0, 0, 0, 0.1);
    }

    .speed-value {
      color: #213547;
    }
  }

  @media (max-width: 768px) {
    .playback-controls {
      flex-direction: column;
      gap: 1rem;
    }

    .speed-control {
      width: 100%;
    }
  }
</style>
