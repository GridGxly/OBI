"use client";

import * as React from "react";
import type { TimbreParam } from "@/types/audioSearch";

type TimbreKnobProps = {
  param: TimbreParam;
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export function TimbreKnob({
  param,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
}: TimbreKnobProps) {
  const id = React.useId();

  return (
    <div className="w-full max-w-[240px] rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-4 backdrop-blur shadow-lg shadow-black/30 transition hover:border-white/20">
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-semibold tracking-wide text-white/90"
        >
          {label}
        </label>
        <span className="text-xs font-mono tabular-nums text-amber-200">
          {value}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-fuchsia-400 cursor-pointer"
      />

      <p className="mt-2 text-xs text-white/50">
        Adjust {label.toLowerCase()}.
      </p>
    </div>
  );
}