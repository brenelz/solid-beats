import { createContext, createEffect, createStore, onSettled, useContext, type ParentProps } from "solid-js";
import { createAudioRefs, resumeTrack, scheduleTrack, stopAll } from "../lib/audio/audio-scheduler";
import { getAudioContext, killAudio, resumeAudio, suspendAudio } from "../lib/audio/music-engine";
import { recordPlay } from "../lib/mutations";
import type { Track } from "../lib/types";
import { toast } from "./toaster";

type PlayerState = {
  track: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  volume: number;
};

export type Player = Readonly<PlayerState> & {
  readonly hasQueue: boolean;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  /** Play, pause or resume `track`, depending on whether it is the current one. */
  toggle: (track: Track, queue?: Track[]) => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
};

const PlayerContext = createContext<Player>();

const MILESTONES: [number, string][] = [
  [60, "♪ No MP3s were harmed in the making of this music"],
  [300, "♪ 5 min of math → sound — all Web Audio API"],
  [600, "♪ 10 min. You should probably ship something"],
];

export function PlayerProvider(props: ParentProps) {
  const [state, setState] = createStore<PlayerState>({
    isPlaying: false,
    progress: 0,
    queue: [],
    queueIndex: -1,
    track: null,
    volume: 75,
  });
  const audio = createAudioRefs();

  onSettled(() => () => {
    stopAll(audio);
    killAudio();
  });

  createEffect(
    () => state.volume,
    (volume) => {
      audio.volume = volume;
      if (audio.bars.length === 0) return;
      const ctx = getAudioContext();
      for (const bar of audio.bars) {
        bar.masterGain.gain.exponentialRampToValueAtTime(Math.max((volume / 100) * 0.15, 0.0001), ctx.currentTime + 0.1);
      }
    },
  );

  // Listening milestones: a toast after 1, 5 and 10 minutes of playback.
  let listened = 0;
  const hit = new Set<number>();
  createEffect(
    () => state.isPlaying,
    (playing) => {
      if (!playing) return;
      const id = setInterval(() => {
        listened += 1;
        for (const [threshold, message] of MILESTONES) {
          if (listened >= threshold && !hit.has(threshold)) {
            hit.add(threshold);
            toast(message, { duration: 15000 });
          }
        }
      }, 1000);
      return () => clearInterval(id);
    },
  );

  const setProgress = (progress: number) => setState((s) => void (s.progress = progress));

  function advanceQueue(queue: Track[]) {
    if (state.queueIndex >= 0 && state.queueIndex < queue.length - 1) playAtIndex(state.queueIndex + 1, queue);
    else
      setState((s) => {
        s.isPlaying = false;
        s.progress = 0;
      });
  }

  function playAtIndex(index: number, queue: Track[]) {
    const track = queue[index];
    setState((s) => {
      s.track = track;
      s.queue = queue;
      s.queueIndex = index;
      s.isPlaying = true;
      s.progress = 0;
    });
    recordPlay(track.id).catch(() => {});
    scheduleTrack({
      duration: track.duration,
      genre: track.genre,
      onEnd: () => advanceQueue(queue),
      onProgress: setProgress,
      refs: audio,
      trackId: track.id,
    });
  }

  const player: Player = {
    get track() {
      return state.track;
    },
    get queue() {
      return state.queue;
    },
    get queueIndex() {
      return state.queueIndex;
    },
    get isPlaying() {
      return state.isPlaying;
    },
    get progress() {
      return state.progress;
    },
    get volume() {
      return state.volume;
    },
    get hasQueue() {
      return state.queue.length > 1;
    },
    play(track, queue) {
      const full = queue ?? [track];
      const index = full.findIndex((t) => t.id === track.id);
      playAtIndex(index >= 0 ? index : 0, full);
    },
    pause() {
      setState((s) => void (s.isPlaying = false));
      stopAll(audio);
      suspendAudio();
    },
    resume() {
      const track = state.track;
      if (!track) return;
      setState((s) => void (s.isPlaying = true));
      resumeAudio();
      const queue = state.queue;
      resumeTrack(track.id, track.genre, track.duration, state.progress, audio, setProgress, () => advanceQueue(queue));
    },
    toggle(track, queue) {
      if (state.track?.id !== track.id) player.play(track, queue);
      else if (state.isPlaying) player.pause();
      else player.resume();
    },
    togglePlayPause() {
      if (state.isPlaying) player.pause();
      else player.resume();
    },
    next() {
      if (!state.track || state.queue.length <= 1) return;
      const i = state.queueIndex;
      playAtIndex(i < state.queue.length - 1 ? i + 1 : 0, state.queue);
    },
    previous() {
      if (!state.track || state.queue.length <= 1) return;
      const i = state.queueIndex;
      playAtIndex(i > 0 ? i - 1 : state.queue.length - 1, state.queue);
    },
    setVolume(v) {
      setState((s) => void (s.volume = v));
    },
  };

  return <PlayerContext value={player}>{props.children}</PlayerContext>;
}

export function usePlayer() {
  return useContext(PlayerContext);
}
