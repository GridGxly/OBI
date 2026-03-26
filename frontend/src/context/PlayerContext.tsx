"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export interface Track {
  id: string;
  title: string;
  url: string;
  bpm?: number;
  tags?: string[];
  year?: number;
  score?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  loadTrack: (track: Track, playlist?: Track[]) => void;
  togglePlay: () => void;
  seek: (progressPct: number) => void;
  setVolume: (vol: number) => void;
  skipNext: () => void;
  skipPrev: () => void;
  dismiss: () => void;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadTrack = useCallback((track: Track, playlist?: Track[]) => {
    if (playlist) {
      setQueue(playlist);
    }

    if (currentTrack?.id === track.id) {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Playback error", e));
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setCurrentTrack(track);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  }, [currentTrack, isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Playback error", e));
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((progressPct: number) => {
    if (!audioRef.current || !duration) return;
    const time = (progressPct / 100) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setProgress(progressPct);
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const skipNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx + 1;
    if (nextIdx < queue.length) {
      const next = queue[nextIdx];
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentTrack(next);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const skipPrev = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }

    if (queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx - 1;
    if (prevIdx >= 0) {
      const prev = queue[prevIdx];
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTrack(prev);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const dismiss = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        audioRef,
        loadTrack,
        togglePlay,
        seek,
        setVolume,
        skipNext,
        skipPrev,
        dismiss,
        setIsPlaying,
        setProgress,
        setCurrentTime,
        setDuration,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
