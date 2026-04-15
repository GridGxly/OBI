"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, Track } from "@/context/PlayerContext";

interface AudioPlayerProps {
  track: Track;
  playlist?: Track[];
}

const seedRandom = (seed: string, i: number): number => {
  let hash = 0;
  const str = seed + i.toString();
  for (let c = 0; c < str.length; c++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(c);
    hash |= 0;
  }
  return (Math.abs(hash) % 100) / 100;
};

export default function AudioPlayer({ track, playlist }: AudioPlayerProps) {
  const { currentTrack, isPlaying, progress, loadTrack, togglePlay, seek } = usePlayer();
  const [bars] = useState(() =>
    Array.from({ length: 48 }, (_, i) => {
      const h = seedRandom(track.title || "default", i);
      return Math.max(0.08, h * 0.85 + 0.15);
    })
  );

  const isCurrentActiveTrack = currentTrack?.id === track.id;
  const isThisPlaying = isCurrentActiveTrack && isPlaying;
  const currentProgress = isCurrentActiveTrack ? progress : 0;

  const handleTogglePlay = () => {
    if (isCurrentActiveTrack) {
      togglePlay();
    } else {
      loadTrack(track, playlist);
    }
  };

  const handleBarClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;

    if (isCurrentActiveTrack) {
      seek(pct);
    } else {
      loadTrack(track, playlist);
    }
  };

  return (
    <div
      className="flex items-center gap-4 w-full p-3 rounded-[10px] transition-colors duration-200"
      style={{
        background: isCurrentActiveTrack ? "rgba(212,175,55,0.04)" : "rgba(0,0,0,0.3)",
        border: isCurrentActiveTrack
          ? "1px solid rgba(212,175,55,0.1)"
          : "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <button
        onClick={handleTogglePlay}
        className="w-[30px] h-[30px] rounded-full flex shrink-0 items-center justify-center transition-all duration-200"
        style={{
          background: isThisPlaying ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)",
          border: isThisPlaying ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: isThisPlaying ? "var(--accent)" : "rgba(255,255,255,0.8)",
        }}
      >
        {isThisPlaying ? (
          <Pause size={12} fill="currentColor" />
        ) : (
          <Play size={12} fill="currentColor" className="ml-0.5" />
        )}
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
          const isFilled = fillPct < currentProgress;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={2}
              height={barH}
              rx={1}
              fill={
                isFilled
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
