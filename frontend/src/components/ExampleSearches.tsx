"use client";

import { motion } from "framer-motion";

interface ExampleSearchesProps {
  onSelect: (query: string) => void;
}

const examples = [
  { query: "dusty jazz drum break 70s", emoji: "🥁" },
  { query: "italian film score flute", emoji: "🎬" },
  { query: "lo-fi vinyl crackle texture", emoji: "🎧" },
  { query: "motown bass groove isolated", emoji: "🎸" },
  { query: "ambient synth pad warm", emoji: "🌊" },
  { query: "soul vocal chop pitched", emoji: "🎤" },
];

export default function ExampleSearches({ onSelect }: ExampleSearchesProps) {
  return (
    <div className="flex flex-col items-center mt-12 mb-8 w-full max-w-xl mx-auto">
      <p
        className="font-data text-[9px] uppercase tracking-[4px] mb-5"
        style={{ color: "var(--text-tertiary)" }}
      >
        Try searching for
      </p>

      <div className="flex flex-wrap justify-center gap-2.5">
        {examples.map((ex, i) => (
          <motion.button
            key={ex.query}
            onClick={() => onSelect(ex.query)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
            className="px-4 py-2.5 rounded-full font-display text-[13px] transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "var(--text-tertiary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,175,55,0.04)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--text-tertiary)";
            }}
          >
            <span className="mr-2">{ex.emoji}</span>
            {ex.query}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
