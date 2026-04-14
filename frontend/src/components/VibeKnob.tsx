"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";

type VibeKnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
};

const DEAD_ZONE = 4;
const SENSITIVITY_BASE = 0.6;

export default function VibeKnob({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  defaultValue = 0,
}: VibeKnobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pastDeadZoneRef = useRef(false);
  const lastTapRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [isDragging, setIsDragging] = useState(false);

  valueRef.current = value;
  onChangeRef.current = onChange;

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

  const handleDragMove = useCallback((clientY: number) => {
    const totalDelta = startYRef.current - clientY;

    if (!pastDeadZoneRef.current) {
      if (Math.abs(totalDelta) < DEAD_ZONE) return;
      pastDeadZoneRef.current = true;
      startYRef.current = clientY;
      return;
    }

    const rawDelta = startYRef.current - clientY;
    startYRef.current = clientY;

    const absDelta = Math.abs(rawDelta);
    const scaledDelta = Math.sign(rawDelta) * Math.pow(absDelta, 1.15) * SENSITIVITY_BASE;

    const range = max - min;
    const newVal = Math.round(Math.min(max, Math.max(min, valueRef.current + scaledDelta * (range / 100))));
    onChangeRef.current(newVal);
  }, [min, max]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const v = valueRef.current;
    if (v <= min + 3) onChangeRef.current(min);
    else if (v >= max - 3) onChangeRef.current(max);
  }, [min, max]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onChangeRef.current(defaultValue);
      if (navigator.vibrate) navigator.vibrate(10);
    }
    lastTapRef.current = now;
  }, [defaultValue]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    pastDeadZoneRef.current = false;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = () => {
      handleDragEnd();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;

    const onTouchStart = (e: TouchEvent) => {
      dragging = true;
      startYRef.current = e.touches[0].clientY;
      pastDeadZoneRef.current = false;
      setIsDragging(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    };

    const onTouchEnd = () => {
      if (!dragging) return;
      dragging = false;
      handleDragEnd();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <span
        className="font-data text-[9px] uppercase tracking-[4px]"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>

      <div
        ref={containerRef}
        className="relative w-20 h-20 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onClick={handleTap}
        style={{ touchAction: "none" }}
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
            border: `1px solid ${isDragging ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.07)"}`,
            boxShadow: isDragging
              ? "0 0 12px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            transform: isDragging ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.15s ease-out, border-color 0.15s ease-out, box-shadow 0.15s ease-out",
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