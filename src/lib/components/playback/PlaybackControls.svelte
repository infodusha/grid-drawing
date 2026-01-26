<script lang="ts">
  import { PlaybackController } from "../../features/playback";
  import { Pause, Play } from "@lucide/svelte";
  import type { PlaybackState } from "../../types";

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

  function handleSliderChange(event: Event) {
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
  <wired-button
    class="play-pause-button"
    onclick={handlePlayPause}
    disabled={playbackController === null}
    aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
  >
    {#if isPlaying}
      <Pause size={24} />
    {:else}
      <Play size={24} />
    {/if}
  </wired-button>

  <div class="speed-control">
    <label for="speed-slider">Скорость:</label>
    <wired-slider
      id="speed-slider"
      min="0.25"
      max="3"
      step="0.25"
      value={speedValue}
      onchange={handleSliderChange}
      disabled={playbackController === null}
      class="speed-slider"
    ></wired-slider>
    <span class="speed-value">{speedValue.toFixed(2)}x</span>
  </div>
</div>

<style>
  .playback-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    background-color: var(--color-bg-surface);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }

  .play-pause-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    min-width: 48px;
    padding: 0;
  }

  .play-pause-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .play-pause-button :global(svg) {
    pointer-events: none;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .speed-control label {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .speed-slider {
    flex: 1;
    width: 100%;
  }

  .speed-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .speed-value {
    font-size: 0.9rem;
    color: var(--color-text-primary);
    min-width: 50px;
    text-align: right;
    font-variant-numeric: tabular-nums;
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
