"use client";

import { useRef, useCallback, useMemo } from "react";

type VibeKnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function VibeKnob({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: VibeKnobProps) {
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalized = (value - min) / (max - min);
  const rotation = -135 + normalized * 270;

  const arcPath = useMemo(() => {
    const cx = 40, cy = 40, r = 34;
    const startAngle = -225 * (Math.PI / 180);
    const endAngle = 45 * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  }, []);

  const valueArcPath = useMemo(() => {
    if (normalized <= 0) return "";
    const cx = 40, cy = 40, r = 34;
    const startAngle = -225 * (Math.PI / 180);
    const sweepAngle = normalized * 270 * (Math.PI / 180);
    const endAngle = startAngle + sweepAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweepAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }, [normalized]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startVal: value };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const range = max - min;
      const newVal = Math.round(
        Math.min(max, Math.max(min, dragRef.current.startVal + (delta / 120) * range))
      );
      onChange(newVal);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [value, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" ref={containerRef}>
      <span
        className="font-data text-[9px] uppercase tracking-[4px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>

      <div
        className="relative w-20 h-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <svg className="absolute inset-0" viewBox="0 0 80 80" fill="none">
          <path
            d={arcPath}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          {valueArcPath && (
            <path
              d={valueArcPath}
              stroke="rgba(212,175,55,0.8)"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              style={{ filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}
            />
          )}
        </svg>

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full"
          style={{
            background: "linear-gradient(145deg, #1a1a1a, #0d0d0d)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="absolute inset-0 flex items-start justify-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div
              className="mt-1.5 w-[2px] h-3 rounded-full"
              style={{ background: "rgba(212,175,55,0.9)" }}
            />
          </div>
        </div>
      </div>

      <span
        className="font-data text-[15px] font-bold tabular-nums"
        style={{ color: value > 0 ? "var(--accent)" : "var(--text-secondary)" }}
      >
        {value}
      </span>
    </div>
  );
}