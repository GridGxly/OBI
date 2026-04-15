"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";


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
    previewAudioRef,
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

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const animFrameRef = useRef<number>(0);
  const [freqBars, setFreqBars] = useState<number[]>(new Array(48).fill(0));

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

  useEffect(() => {
    let animFrame: number;

    const animate = () => {
      if (!isPlaying) {
        setFreqBars(prev => {
          const decayed = prev.map(v => v * 0.85);
          if (decayed.every(v => v < 0.005)) {
            return new Array(48).fill(0);
          }
          animFrame = requestAnimationFrame(animate);
          return decayed;
        });
        return;
      }

      const time = currentTime;
      const bpm = currentTrack?.bpm || 90;

      const beatInterval = 60 / bpm;
      const beatPhase = (time % beatInterval) / beatInterval;
      const beatPulse = Math.pow(Math.sin(beatPhase * Math.PI), 4);

      const eighthInterval = beatInterval / 2;
      const eighthPhase = (time % eighthInterval) / eighthInterval;
      const eighthPulse = Math.pow(Math.sin(eighthPhase * Math.PI), 6) * 0.3;

      const bars: number[] = [];
      for (let i = 0; i < 48; i++) {
        const curve = Math.max(0, 1 - (i / 48) * 0.55);

        const positionSeed = Math.sin(time * 0.3 + i * 2.1) * 0.15;

        const drift1 = Math.sin(time * 1.9 + i * 0.5) * 0.1;
        const drift2 = Math.sin(time * 3.3 + i * 0.8) * 0.07;

        const beatWeight = Math.max(0, 1 - (i / 48) * 1.5);
        const beatContribution = beatPulse * beatWeight * 0.35;
        const eighthContribution = eighthPulse * beatWeight * 0.5;

        const shimmer = Math.sin(time * 8.7 + i * 1.7) * 0.04 * (i / 48);

        const raw = curve * 0.32
          + beatContribution
          + eighthContribution
          + positionSeed
          + drift1
          + drift2
          + shimmer
          + 0.08;

        bars.push(Math.max(0.03, Math.min(1, raw)));
      }

      setFreqBars(bars);
      animFrame = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(animate);
    } else if (freqBars.some(v => v > 0.005)) {
      animFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, currentTime, currentTrack]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (val > 0) setPrevVolume(val);
  }, [setVolume]);

  return (
    <>
      <audio ref={audioRef} src={currentTrack?.url} className="hidden" preload="auto" />
      <audio ref={previewAudioRef} className="hidden" preload="none" />

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
              paddingBottom: "env(safe-area-inset-bottom)",
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

            <div className="flex items-center justify-between px-4 md:px-6 py-3 h-[72px] sm:h-[72px]">
              <div className="flex items-center gap-3 w-[28%] min-w-0 sm:min-w-[140px]">
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden relative"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(60,60,60,1) 0%, rgba(20,20,20,1) 60%, rgba(10,10,10,1) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isPlaying ? "0 0 12px rgba(212,175,55,0.08)" : "none",
                    animation: isPlaying ? "vinylSpin 3s linear infinite" : "none",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  <div
                    className="absolute w-[30px] h-[30px] rounded-full"
                    style={{
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                  <div
                    className="absolute w-[20px] h-[20px] rounded-full"
                    style={{
                      border: "1px solid rgba(255,255,255,0.03)",
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: isPlaying
                        ? "radial-gradient(circle, var(--accent) 0%, rgba(180,148,40,0.8) 100%)"
                        : "radial-gradient(circle, rgba(80,80,80,1) 0%, rgba(50,50,50,1) 100%)",
                      transition: "background 0.3s ease",
                    }}
                  />
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="font-display text-[13px] font-semibold text-white/90 truncate max-w-[120px] sm:max-w-none leading-tight">
                    {currentTrack.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
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
                    className="p-2 transition-colors duration-150 disabled:opacity-20"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => { if (canSkipPrev) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <SkipBack size={16} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200"
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
                    className="p-2 transition-colors duration-150 disabled:opacity-20"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseEnter={(e) => { if (canSkipNext) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    <SkipForward size={16} />
                  </button>
                </div>

                <div className="w-full flex items-center gap-2 hidden sm:flex">
                  <span className="font-data text-[9px] tabular-nums text-white/25 w-8 text-right shrink-0">
                    {formatTime(currentTime)}
                  </span>

                  <svg
                    className="flex-1 cursor-pointer"
                    height={32}
                    viewBox="0 0 240 32"
                    preserveAspectRatio="none"
                    onClick={handleBarClick}
                    style={{ minWidth: 0 }}
                  >
                    {freqBars.map((amplitude, i) => {
                      const barH = Math.max(1.5, amplitude * 28);
                      const isPast = (i / 48) * 100 < progress;
                      return (
                        <rect
                          key={i}
                          x={i * 5}
                          y={16 - barH / 2}
                          width={3}
                          height={barH}
                          rx={1}
                          fill={isPast ? "rgba(212,175,55,0.85)" : "rgba(255,255,255,0.12)"}
                        />
                      );
                    })}
                  </svg>

                  <span className="font-data text-[9px] tabular-nums text-white/25 w-8 shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 w-[28%] min-w-0 sm:min-w-[140px]">
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
                  className="p-2 rounded-md transition-colors duration-150"
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
