"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type KnobProps = {
  label: string;
  value: number; // 0–100
  onChange: (val: number) => void;
  accentColor?: string;
};

function Knob({ label, value, onChange, accentColor = "#d4af37" }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(0);
  const isDragging = useRef(false);

  // Map 0–100 to -135deg … +135deg
  const angle = -135 + (value / 100) * 270;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startYRef.current = e.clientY;
      startValRef.current = value;

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = startYRef.current - ev.clientY; // drag up = increase
        const next = Math.min(100, Math.max(0, startValRef.current + delta * 0.8));
        onChange(Math.round(next));
      };

      const onUp = () => {
        isDragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [value, onChange]
  );

  // Touch support
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      startYRef.current = e.touches[0].clientY;
      startValRef.current = value;

      const onMove = (ev: TouchEvent) => {
        if (!isDragging.current) return;
        const delta = startYRef.current - ev.touches[0].clientY;
        const next = Math.min(100, Math.max(0, startValRef.current + delta * 0.8));
        onChange(Math.round(next));
      };

      const onEnd = () => {
        isDragging.current = false;
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };

      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [value, onChange]
  );

  const size = 56;
  const cx = size / 2;
  const cy = size / 2;
  const r = 22;
  const trackR = 24;

  // Arc path helper
  const polarToXY = (angleDeg: number, radius: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const arcStart = polarToXY(-135, trackR);
  const arcEnd = polarToXY(135, trackR);
  const fillEnd = polarToXY(angle, trackR);
  const largeArc = angle - -135 > 180 ? 1 : 0;

  // Tick mark position
  const tickInner = polarToXY(angle, r - 7);
  const tickOuter = polarToXY(angle, r - 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
      }}
    >
      {/* Value readout */}
      <span
        style={{
          fontFamily: "var(--font-data, monospace)",
          fontSize: 9,
          letterSpacing: "2px",
          color: accentColor,
          opacity: 0.8,
        }}
      >
        {value}
      </span>

      {/* Knob SVG */}
      <div
        ref={knobRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{ cursor: "ns-resize", position: "relative" }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Outer glow ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 4}
            fill="none"
            stroke={accentColor}
            strokeWidth={0.5}
            opacity={0.08}
          />

          {/* Track background arc */}
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${trackR} ${trackR} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Filled arc (progress) */}
          {value > 0 && (
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${trackR} ${trackR} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.75}
            />
          )}

          {/* Knob body */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="url(#knobGrad)"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />

          {/* Subtle inner ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 5}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />

          {/* Tick mark */}
          <line
            x1={tickInner.x}
            y1={tickInner.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
            stroke={accentColor}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.9}
          />

          {/* Gradient defs */}
          <defs>
            <radialGradient id="knobGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(60,55,45,1)" />
              <stop offset="100%" stopColor="rgba(14,13,11,1)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-data, monospace)",
          fontSize: 9,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--text-tertiary, #555)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

type SoundKnobsProps = {
  resultId: string;
};

export default function SoundKnobs({ resultId }: SoundKnobsProps) {
  const [dust, setDust] = useState(30);
  const [timbre, setTimbre] = useState(55);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        marginTop: 4,
      }}
    >
      {/* Divider label */}
      <span
        style={{
          fontFamily: "var(--font-data, monospace)",
          fontSize: 8,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.12)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          marginRight: 2,
        }}
      >
        Adjust
      </span>

      <div style={{ width: "1px", height: 40, background: "rgba(255,255,255,0.05)" }} />

      <Knob label="Dust" value={dust} onChange={setDust} />

      <div style={{ width: "1px", height: 40, background: "rgba(255,255,255,0.05)" }} />

      <Knob label="Timbre" value={timbre} onChange={setTimbre} />

      {/* Future: reset button placeholder */}
      <div style={{ marginLeft: "auto" }}>
        <button
          onClick={() => { setDust(30); setTimbre(55); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-data, monospace)",
            fontSize: 8,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.15)",
            padding: "4px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(212,175,55,0.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}