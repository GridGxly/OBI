"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

function generateBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(0.2 + Math.random() * 0.8);
  }
  return bars;
}

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
    <div className="flex items-center gap-4 w-full p-3 rounded-xl bg-[#1A1A1A] border border-zinc-800">
      <audio ref={audioRef} src={url} className="hidden" />

      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-accent-amber/10 text-accent-amber flex shrink-0 items-center justify-center hover:bg-accent-amber hover:text-black transition-colors"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
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
              className={`transition-colors duration-75 ${isFilled ? "fill-accent-amber" : "fill-zinc-700"}`}
            />
          );
        })}
      </svg>
    </div>
  );
}
