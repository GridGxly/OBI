"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

/**
 * Create an array of random bar heights for a waveform/progress visualization.
 *
 * @param count - Number of bars to generate
 * @returns An array of `count` numbers where each value is in the range 0.2 (inclusive) to 1.0 (exclusive)
 */
function generateBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(0.2 + Math.random() * 0.8);
  }
  return bars;
}

/**
 * Renders a custom audio player with a play/pause control and a clickable bar-style seek visualization.
 *
 * @param url - Source URL for the audio track
 * @returns The React element for the audio player UI
 */
export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bars] = useState(() => generateBars(48));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleBarClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    setProgress(pct);
  };

  return (
    <div
      className="flex items-center gap-4 w-full p-3 rounded-[10px]"
      style={{
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <audio ref={audioRef} src={url} className="hidden" />

      <button
        onClick={togglePlay}
        className="w-[30px] h-[30px] rounded-full flex shrink-0 items-center justify-center transition-all duration-200"
        style={{
          background: isPlaying ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)",
          border: isPlaying ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: isPlaying ? "var(--accent)" : "rgba(255,255,255,0.8)",
        }}
      >
        {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
      </button>

      <svg
        className="flex-1 h-8 cursor-pointer"
        viewBox={`0 0 ${bars.length * 3} 24`}
        preserveAspectRatio="none"
        onClick={handleBarClick}
      >
        {bars.map((h, i) => {
          const x = i * 3;
          const barH = h * 20;
          const y = (24 - barH) / 2;
          const fillPct = (i / bars.length) * 100;
          const isFilled = fillPct < progress;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={2}
              height={barH}
              rx={1}
              fill={isFilled
                ? "rgba(212,175,55,0.85)"
                : `rgba(255,255,255,${0.06 + h * 0.12})`
              }
              style={{ transition: "fill 0.15s" }}
            />
          );
        })}
      </svg>
    </div>
  );
}
