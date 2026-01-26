<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { searchParams } from "sv-router";
  import { route } from "sv-router/generated";
  import { MoveSequence } from "../../lib/MoveSequence";
  import {
    PlaybackController,
    type PlaybackState,
  } from "../../lib/utils/playback";
  import { SpeechAnnouncer } from "../../lib/utils/speechAnnouncer";
  import Grid from "../../lib/Grid.svelte";
  import PlaybackControls from "../../lib/components/PlaybackControls.svelte";
  import MaskToggle from "../../lib/components/MaskToggle.svelte";
  import MoveLog from "../../lib/components/MoveLog.svelte";
  import ProgressBar from "../../lib/components/ProgressBar.svelte";

  interface GridItem {
    id: string;
    name: string;
    tags: string[];
  }

  const { id } = route.getParams("/grid/:id");

  const initialMaskState = searchParams.get("mask") === "";

  let loading = $state(true);
  let error = $state<string | null>(null);
  let moveSequence = $state<MoveSequence | null>(null);
  let gridName = $state<string>("");
  let isMasked = $state(initialMaskState);
  let playbackController = $state<PlaybackController | null>(null);
  let playbackState = $state<PlaybackState>({
    isPlaying: false,
    currentMoveIndex: 0,
    speedMultiplier: 1.0,
  });
  let revealedMoves = $state<string[]>([]);
  let speechAnnouncer = $state<SpeechAnnouncer | null>(null);
  let animationDuration = $state<number | null>(null);

  // Create partial MoveSequence with only revealed moves for Grid component
  const partialMoveSequence = $derived.by(() => {
    if (!moveSequence) return null;

    const partial = new MoveSequence(
      revealedMoves,
      moveSequence.startX,
      moveSequence.startY,
      moveSequence.gridWidth,
      moveSequence.gridHeight,
    );
    return partial;
  });

  onMount(async () => {
    try {
      // Load grid data
      const dataResponse = await fetch(`/data/${id}.json`);
      if (!dataResponse.ok) {
        throw new Error(
          `Не удалось загрузить данные диктанта: ${dataResponse.statusText}`,
        );
      }
      const gridData = await dataResponse.json();
      moveSequence = MoveSequence.fromJSON(gridData);

      // Load metadata to get grid name
      const metadataResponse = await fetch("/data.json");
      if (metadataResponse.ok) {
        const metadata: GridItem[] = await metadataResponse.json();
        const item = metadata.find((item) => item.id === id);
        if (item) {
          gridName = item.name;
        }
      }

      // Initialize speech announcer (wait for voices to be available)
      if (SpeechAnnouncer.isAvailable()) {
        const initSpeechAnnouncer = () => {
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(({ lang }) => lang === "ru-RU");
          if (voice) {
            speechAnnouncer = new SpeechAnnouncer({ voice });
          }
        };

        // Check if voices are already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
          initSpeechAnnouncer();
        } else {
          // Wait for voices to be loaded
          window.speechSynthesis.onvoiceschanged = initSpeechAnnouncer;
        }
      }

      // Initialize playback controller
      if (moveSequence) {
        const controller = new PlaybackController(moveSequence);

        // Set up state change callback
        controller.onStateChange((state) => {
          playbackState = { ...state };
          // Update revealed moves based on current index
          if (moveSequence) {
            revealedMoves = moveSequence.moves.slice(0, state.currentMoveIndex);
          }
          // Clear animation duration when playback stops or pauses
          if (!state.isPlaying) {
            animationDuration = null;
          }
        });

        // Set up move revealed callback (backup, but state change should handle it)
        controller.onMoveRevealed((moves) => {
          revealedMoves = [...moves];
        });

        // Set up move duration callback for animation timing
        controller.onMoveDuration((duration) => {
          animationDuration = duration;
        });

        playbackController = controller;

        // Initialize revealed moves (empty at start since paused)
        revealedMoves = [];
      }

      loading = false;
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      loading = false;
    }
  });

  onDestroy(() => {
    if (playbackController) {
      playbackController.destroy();
    }
    if (speechAnnouncer) {
      speechAnnouncer.destroy();
    }
  });

  // Keyboard shortcut: spacebar to play/pause
  function handleKeyDown(event: KeyboardEvent) {
    // Only handle spacebar if not typing in an input field
    if (event.code === "Space" && event.target instanceof HTMLElement) {
      const isInput =
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable;
      if (!isInput && playbackController) {
        event.preventDefault();
        if (playbackState.isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      }
    }
  }

  $effect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  });

  // Set up move announcement callback (called before the delay)
  // Update it whenever speechAnnouncer or playbackController changes
  $effect(() => {
    if (playbackController) {
      playbackController.onMoveAnnounce((move) => {
        if (speechAnnouncer) {
          speechAnnouncer.announceMove(move);
        }
      });
    }
  });

  function handlePlay() {
    if (playbackController) {
      playbackController.play();
    }
  }

  function handlePause() {
    if (playbackController) {
      playbackController.pause();
    }
  }

  function handleSpeedChange(speed: number) {
    if (playbackController) {
      playbackController.setSpeed(speed);
    }
  }

  function toggleMask() {
    isMasked = !isMasked;
    if (isMasked) {
      searchParams.set("mask", "");
    } else {
      searchParams.delete("mask");
    }
  }
</script>

<main class="grid-playback-page">
  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Загрузка диктанта...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p class="error-message">Ошибка: {error}</p>
    </div>
  {:else if moveSequence}
    <div class="header-section">
      <h1 class="grid-name" class:masked={isMasked}>
        {gridName || "Без названия"}
      </h1>
      <div class="header-controls">
        <MaskToggle {isMasked} onToggle={toggleMask} />
      </div>
    </div>

    <div class="controls-section">
      <PlaybackControls
        {playbackController}
        {playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onSpeedChange={handleSpeedChange}
      />
    </div>

    <div class="progress-section">
      <ProgressBar
        current={playbackState.currentMoveIndex}
        total={moveSequence.moves.length}
      />
    </div>

    <div class="content-grid">
      <div class="grid-section" class:masked={isMasked}>
        <Grid
          moveSequence={partialMoveSequence}
          {animationDuration}
          isPlaying={playbackState.isPlaying}
        />
      </div>

      <div class="move-log-section">
        <h2 class="move-log-title">Ходы</h2>
        <MoveLog
          allMoves={moveSequence.moves}
          currentIndex={playbackState.currentMoveIndex}
        />
      </div>
    </div>
  {/if}
</main>

<style>
  .grid-playback-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .grid-name {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: var(--color-text-primary);
    transition: all 0.3s ease;
  }

  .grid-name.masked {
    filter: blur(8px);
    opacity: 0.3;
    user-select: none;
    pointer-events: none;
  }

  .header-controls {
    display: flex;
    gap: 1rem;
  }

  .controls-section {
    width: 100%;
  }

  .progress-section {
    width: 100%;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1.5rem;
    align-items: start;
  }

  .grid-section {
    transition: all 0.3s ease;
  }

  .grid-section.masked {
    filter: blur(12px);
    opacity: 0.2;
    pointer-events: none;
  }

  .move-log-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 600px;
  }

  .move-log-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .move-log-section {
      height: 400px;
    }
  }

  @media (max-width: 768px) {
    .grid-playback-page {
      padding: 1rem;
    }

    .header-section {
      flex-direction: column;
      align-items: flex-start;
    }

    .grid-name {
      font-size: 1.5rem;
    }
  }
</style>
