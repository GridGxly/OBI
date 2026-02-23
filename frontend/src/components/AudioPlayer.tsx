"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="flex items-center gap-4 w-full p-3 rounded-xl bg-[#1A1A1A] border border-zinc-800">
      <audio ref={audioRef} src={url} className="hidden" />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-accent-amber/10 text-accent-amber flex shrink-0 items-center justify-center hover:bg-accent-amber hover:text-black transition-colors"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      
     
      <div className="flex-1 h-2 bg-black rounded-full overflow-hidden tactile-inset">
        <div 
          className="h-full bg-accent-amber transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
