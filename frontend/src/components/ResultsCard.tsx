"use client";

import * as React from "react";
import type { SearchResult } from "@/types/audioSearch";

type ResultCardProps = {
  result: SearchResult;
  onSave?: (id: string) => void;
};

export function ResultCard({ result, onSave }: ResultCardProps) {
  const waveformRef = React.useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Boilerplate: WaveSurfer integration will be added next step
  React.useEffect(() => {
    // We’ll wire WaveSurfer here in Step 4.
    setIsReady(true);
    return () => {
      // cleanup WaveSurfer instance later
    };
  }, [result.audioUrl]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white/90">{result.title}</h3>
          <p className="mt-1 text-xs text-white/70">
            Similarity: <span className="tabular-nums">{result.similarity.toFixed(3)}</span>
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={!isReady}
            onClick={() => setIsPlaying((p) => !p)}
            className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-white/90 hover:bg-white/5 disabled:opacity-50"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {onSave && (
            <button
              type="button"
              onClick={() => onSave(result.id)}
              className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-white/90 hover:bg-white/5"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div
        ref={waveformRef}
        className="mt-3 h-14 w-full rounded-xl bg-white/5"
        aria-label="Waveform preview"
      />
    </div>
  );
}