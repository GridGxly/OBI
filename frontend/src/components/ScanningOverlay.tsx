"use client";

import { useEffect, useState, useRef } from "react";

interface ScanningOverlayProps {
  onComplete: () => void;
}

const PHASES = [
  "Reading waveform...",
  "Matching timbre...",
  "Scanning texture...",
  "Ranking results...",
];

const TOTAL_DURATION = 3200;
const PHASE_DURATION = 800;

export default function ScanningOverlay({ onComplete }: ScanningOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const intervals: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < PHASES.length; i++) {
      intervals.push(setTimeout(() => setPhase(i), i * PHASE_DURATION));
    }

    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 300);
    }, TOTAL_DURATION);

    return () => {
      intervals.forEach(clearTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, rgba(20,16,8,0.97), rgba(5,5,5,0.99) 70%)",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {[240, 320, 400, 480].map((size, i) => (
        <div
          key={size}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(212,175,55,${0.12 - i * 0.025})`,
            animation: `rippleExpand 3s ease-out ${i * 0.6}s infinite`,
          }}
        />
      ))}

      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          border: "2px solid transparent",
          borderTopColor: "rgba(212,175,55,0.5)",
          borderRightColor: "rgba(212,175,55,0.15)",
          animation: "spin 2s linear infinite",
          filter: "drop-shadow(0 0 12px rgba(212,175,55,0.15))",
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: 210,
          height: 210,
          border: "1.5px solid transparent",
          borderBottomColor: "rgba(212,175,55,0.35)",
          borderLeftColor: "rgba(212,175,55,0.1)",
          animation: "spin 2.8s linear infinite reverse",
        }}
      />

      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.03) 40%, transparent 70%)",
          animation: "breathe 2s ease-in-out infinite",
        }}
      >
        <div className="flex items-center justify-center gap-[3px]">
          {Array.from({ length: 11 }).map((_, i) => {
            const distFromCenter = Math.abs(i - 5);
            const opacity = 0.9 - distFromCenter * 0.1;
            const shadowSize = Math.max(2, 8 - distFromCenter * 2);
            return (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  width: 4,
                  background: `rgba(212,175,55,${opacity})`,
                  boxShadow: `0 0 ${shadowSize}px rgba(212,175,55,${opacity * 0.5})`,
                  animation: `orbBar 0.8s ease-in-out ${i * 0.07}s infinite alternate`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        className="absolute font-data text-[11px] uppercase tracking-[5px]"
        style={{
          top: "calc(50% + 140px)",
          color: "var(--accent-dim)",
          animation: "textPulse 2s ease-in-out infinite",
        }}
      >
        {PHASES[phase]}
      </div>

      <div
        className="absolute flex items-center gap-2"
        style={{ top: "calc(50% + 175px)" }}
      >
        {PHASES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: 6,
              height: 6,
              background: i <= phase ? "var(--accent)" : "rgba(255,255,255,0.1)",
              boxShadow: i <= phase ? "0 0 8px rgba(212,175,55,0.5)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
