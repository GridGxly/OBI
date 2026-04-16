"use client";

import { useEffect, useState, useRef } from "react";

interface ScanningOverlayProps {
  isReady: boolean;
  onComplete: () => void;
}

const PHASES = [
  "Listening...",
  "Comparing sounds...",
  "Finding matches...",
  "Almost there...",
];

const MIN_DISPLAY_TIME_MS = 3200;
const PHASE_TRANSITION_MS = 800;
const FADEOUT_MS = 300;

export default function ScanningOverlay({ isReady, onComplete }: ScanningOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hasMetMinimumTime, setHasMetMinimumTime] = useState(false);
  
  const isExitingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setHasMetMinimumTime(true);
    }, MIN_DISPLAY_TIME_MS);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (hasMetMinimumTime && isReady && !isExitingRef.current) {
      isExitingRef.current = true;
      setExiting(true);
      
      const exitTimeout = setTimeout(() => {
        onComplete();
      }, FADEOUT_MS);
      return () => clearTimeout(exitTimeout);
    }
  }, [hasMetMinimumTime, isReady, onComplete]);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      setPhase((p) => {
        if (!mounted) return p;
        if (p < PHASES.length - 1) return p + 1;
        clearInterval(interval);
        return p;
      });
    }, PHASE_TRANSITION_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      role="status"
      aria-label="Searching for matching sounds"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
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
        className="absolute font-data text-[11px] uppercase tracking-[3px] sm:tracking-[5px]"
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
