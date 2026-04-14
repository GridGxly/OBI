"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type KnobProps = {
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor?: string;
  defaultValue?: number;
};

const DEAD_ZONE = 3;
const SENSITIVITY_BASE = 0.5;

function Knob({ label, value, onChange, accentColor = "#d4af37", defaultValue = 0 }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pastDeadZoneRef = useRef(false);
  const lastTapRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [isDragging, setIsDragging] = useState(false);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const angle = -135 + (value / 100) * 270;

  const size = 56;
  const cx = size / 2;
  const cy = size / 2;
  const r = 22;
  const trackR = 24;

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

  const tickInner = polarToXY(angle, r - 7);
  const tickOuter = polarToXY(angle, r - 1);

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

    const newVal = Math.round(Math.min(100, Math.max(0, valueRef.current + scaledDelta)));
    onChangeRef.current(newVal);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const v = valueRef.current;
    if (v <= 3) onChangeRef.current(0);
    else if (v >= 97) onChangeRef.current(100);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onChangeRef.current(defaultValue);
      if (navigator.vibrate) navigator.vibrate(10);
    }
    lastTapRef.current = now;
  }, [defaultValue]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
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
    const el = knobRef.current;
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
      }}
    >
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

      <div
        ref={knobRef}
        onMouseDown={onMouseDown}
        onClick={handleTap}
        style={{
          cursor: "ns-resize",
          position: "relative",
          touchAction: "none",
          transform: isDragging ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s ease-out",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r + 4}
            fill="none"
            stroke={accentColor}
            strokeWidth={0.5}
            opacity={isDragging ? 0.2 : 0.08}
            style={{ transition: "opacity 0.15s ease-out" }}
          />

          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${trackR} ${trackR} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

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

          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="url(#knobGrad)"
            stroke={isDragging ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.07)"}
            strokeWidth={1}
            style={{ transition: "stroke 0.15s ease-out" }}
          />

          <circle
            cx={cx}
            cy={cy}
            r={r - 5}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />

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

          <defs>
            <radialGradient id="knobGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(60,55,45,1)" />
              <stop offset="100%" stopColor="rgba(14,13,11,1)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <span
        style={{
          fontFamily: "var(--font-data, monospace)",
          fontSize: 9,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--text-secondary, #999)",
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
      <span
        style={{
          fontFamily: "var(--font-data, monospace)",
          fontSize: 8,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          marginRight: 2,
        }}
      >
        Adjust
      </span>

      <div style={{ width: "1px", height: 40, background: "rgba(255,255,255,0.05)" }} />

      <Knob label="Dust" value={dust} onChange={setDust} defaultValue={30} />

      <div style={{ width: "1px", height: 40, background: "rgba(255,255,255,0.05)" }} />

      <Knob label="Timbre" value={timbre} onChange={setTimbre} defaultValue={55} />

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
            color: "rgba(255,255,255,0.25)",
            padding: "4px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(212,175,55,0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}