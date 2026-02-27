"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type VibeKnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function VibeKnob({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: VibeKnobProps) {
  // Map value → rotation (-135° to +135°)
  const rotation = useMemo(() => {
    const normalized = (value - min) / (max - min);
    return -135 + normalized * 270;
  }, [value, min, max]);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Label */}
      <div className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </div>

      {/* Knob Container */}
      <div className="relative w-16 h-16">
        {/* Hidden range input for interaction */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />

        {/* Knob body */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-inner backdrop-blur-sm" />

        {/* Indicator */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="absolute inset-0 flex items-start justify-center"
        >
          <div className="mt-2 w-[2px] h-6 bg-white/80 rounded-full" />
        </motion.div>
      </div>

      {/* Value display */}
      <div className="text-sm text-white/80 font-mono">{value}</div>
    </div>
  );
}