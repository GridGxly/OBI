"use client";

import { useEffect, useState } from "react";

interface MatchArcProps {
  score: number;
  size?: number;
}

export default function MatchArc({ score, size = 52 }: MatchArcProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const radius = (size - 6) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 2.5;

  const circumference = 2 * Math.PI * radius;
  const displayScore = isMounted ? score : 0;
  const filled = (displayScore / 100) * circumference;
  const gap = circumference - filled;

  const isHigh = score >= 85;
  const arcColor = isHigh
    ? "rgba(212, 175, 55, 0.8)"
    : "rgba(255, 255, 255, 0.15)";
  const textColor = isHigh
    ? "var(--accent)"
    : "rgba(255, 255, 255, 0.7)";
  const glowFilter = isHigh
    ? "drop-shadow(0 0 4px rgba(212, 175, 55, 0.3))"
    : "none";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: glowFilter }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dasharray 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      </svg>
      <span
        className="absolute font-data font-extrabold tabular-nums flex items-baseline gap-[1px]"
        style={{
          fontSize: size >= 52 ? "17px" : "14px",
          color: textColor,
          letterSpacing: "-0.02em",
        }}
      >
        {score}
        <span className="text-[8px] opacity-50">%</span>
      </span>
    </div>
  );
}
