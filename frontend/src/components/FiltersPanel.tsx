"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VibeKnob from "./VibeKnob";

interface FiltersPanelProps {
  values: { dust: number; warmth: number; crunch: number };
  onChange: (key: "dust" | "warmth" | "crunch", value: number) => void;
  onReset: () => void;
}

export default function FiltersPanel({ values, onChange, onReset }: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = values.dust > 0 || values.warmth > 0 || values.crunch > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200"
        style={{
          color: hasActiveFilters ? "var(--accent)" : "var(--text-tertiary)",
          background: isOpen ? "rgba(212,175,55,0.05)" : "transparent",
          border: isOpen ? "1px solid rgba(212,175,55,0.15)" : "1px solid transparent",
        }}
      >
        <SlidersHorizontal size={14} />
        <span className="font-data text-[9px] uppercase tracking-[3px]">
          Timbre Filters
        </span>
        {hasActiveFilters && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="flex flex-col items-center gap-6 py-8 px-6 mt-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                <VibeKnob label="Dust" value={values.dust} onChange={(v) => onChange("dust", v)} />
                <VibeKnob label="Warmth" value={values.warmth} onChange={(v) => onChange("warmth", v)} />
                <VibeKnob label="Crunch" value={values.crunch} onChange={(v) => onChange("crunch", v)} />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 font-data text-[9px] uppercase tracking-[3px] transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                >
                  <RotateCcw size={10} />
                  Reset Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
