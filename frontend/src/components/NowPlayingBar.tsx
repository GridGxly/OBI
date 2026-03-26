"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

function generateBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(0.2 + Math.random() * 0.8);
  }
  return bars;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NowPlayingBar() {
  const {
    currentTrack,
    queue,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    audioRef,
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
  } = usePlayer();

  const [bars] = useState(() => generateBars(100));
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  const currentIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
  const canSkipNext = currentIdx >= 0 && currentIdx < queue.length - 1;
  const canSkipPrev = currentIdx > 0 || (currentTime > 3);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      audio.volume = isMuted ? 0 : volume;
    };

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch((e) => console.error("Play error:", e));
      }
    };

    const handleEnded = () => {
      if (canSkipNext) {
        skipNext();
      } else {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef, isPlaying, volume, isMuted, canSkipNext, skipNext, setCurrentTime, setDuration, setIsPlaying, setProgress]);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      setVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume, setVolume]);

  useEffect(() => {
    if (!currentTrack) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey && canSkipNext) {
            skipNext();
          } else {
            seek(Math.min(100, progress + 2));
          }
          break;
        case "ArrowLeft":
          if (e.shiftKey) {
            skipPrev();
          } else {
            seek(Math.max(0, progress - 2));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "KeyM":
          handleMuteToggle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, togglePlay, seek, skipNext, skipPrev, setVolume, handleMuteToggle, progress, volume, canSkipNext]);

  const handleBarClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, pct)));
  }, [seek]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (val > 0) setPrevVolume(val);
  }, [setVolume]);

  return (
    <>
      <audio ref={audioRef} src={currentTrack?.url} className="hidden" preload="auto" />

      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: "linear-gradient(180deg, rgba(14,14,14,0.92) 0%, rgba(8,8,8,0.98) 100%)",
              backdropFilter: "blur(24px) saturate(1.2)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
              <div
                className="h-full transition-[width] duration-150 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, rgba(212,175,55,0.6), rgba(212,175,55,0.9))",
                }}
              />
            </div>

            <div className="flex items-center justify-between px-4 md:px-6 py-3" style={{ height: "72px" }}>
              <div className="flex items-center gap-3 w-[28%] min-w-[140px]">
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))",
                    border: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  <div className="flex items-center gap-[2px]">
                    {[0.4, 0.7, 1, 0.6, 0.3].map((h, i) => (
                      <div
                        key={i}
                        className="w-[2px] rounded-full"
                        style={{
                          height: `${h * 16}px`,
                          background: isPlaying ? "var(--accent)" : "rgba(212,175,55,0.4)",
                          animation: isPlaying ? `orbBar 0.6s ease-in-out ${i * 0.08}s infinite alternate` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="font-display text-[13px] font-semibold text-white/90 truncate leading-tight">
                    {currentTrack.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {currentTrack.bpm && (
                      <span className="font-data text-[9px] font-bold" style={{ color: "var(--accent-dim)" }}>
                        {currentTrack.bpm} BPM
                      </span>
                    )}
                    {currentTrack.tags && currentTrack.tags.length > 0 && (
                      <span className="font-data text-[9px] text-white/25 truncate">
                        {currentTrack.tags.slice(0, 2).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 max-w-xl gap-1">
                <div className="flex items-center gap-5">
                  <button
                    onClick={skipPrev}
                    disabled={!canSkipPrev}
                    className="transition-colors duration-150 disabled:opacity-20"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => { if (canSkipPrev) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <SkipBack size={16} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isPlaying
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(255,255,255,0.08)",
                      border: isPlaying
                        ? "1px solid rgba(212,175,55,0.3)"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: isPlaying ? "var(--accent)" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" className="ml-[2px]" />
                    )}
                  </button>

                  <button
                    onClick={skipNext}
                    disabled={!canSkipNext}
                    className="transition-colors duration-150 disabled:opacity-20"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => { if (canSkipNext) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <SkipForward size={16} />
                  </button>
                </div>

                <div className="w-full flex items-center gap-2">
                  <span className="font-data text-[9px] tabular-nums text-white/25 w-8 text-right shrink-0">
                    {formatTime(currentTime)}
                  </span>

                  <svg
                    className="flex-1 h-4 cursor-pointer"
                    viewBox={`0 0 ${bars.length * 3} 20`}
                    preserveAspectRatio="none"
                    onClick={handleBarClick}
                  >
                    {bars.map((h, i) => {
                      const x = i * 3;
                      const barH = h * 14;
                      const y = (20 - barH) / 2;
                      const fillPct = (i / bars.length) * 100;
                      const isFilled = fillPct < progress;
                      return (
                        <rect
                          key={i}
                          x={x}
                          y={y}
                          width={2}
                          height={barH}
                          rx={0.5}
                          fill={
                            isFilled
                              ? "rgba(212,175,55,0.85)"
                              : `rgba(255,255,255,${0.04 + h * 0.08})`
                          }
                          style={{ transition: "fill 0.1s" }}
                        />
                      );
                    })}
                  </svg>

                  <span className="font-data text-[9px] tabular-nums text-white/25 w-8 shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 w-[28%] min-w-[140px]">
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 appearance-none rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(212,175,55,0.7) 0%, rgba(212,175,55,0.7) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.08) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.08) 100%)`,
                      accentColor: "rgb(212,175,55)",
                    }}
                  />
                </div>

                <button
                  onClick={dismiss}
                  className="p-1.5 rounded-md transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
