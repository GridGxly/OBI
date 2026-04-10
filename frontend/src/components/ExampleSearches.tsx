"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface ExampleSearchesProps {
  onSelect: (query: string) => void;
}

const examples = [
  { query: "dusty jazz drum break 70s", icon: "🥁" },
  { query: "italian film score flute", icon: "🎬" },
  { query: "lo-fi vinyl crackle texture", icon: "🎧" },
  { query: "motown bass groove isolated", icon: "🎸" },
  { query: "ambient synth pad warm", icon: "🌊" },
  { query: "soul vocal chop pitched", icon: "🎤" },
];

export default function ExampleSearches({ onSelect }: ExampleSearchesProps) {
  return (
    <motion.div
      className="flex flex-col items-center mt-10 mb-8 w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <p
        className="font-data text-[10px] uppercase tracking-[2.5px] mb-5"
        style={{ color: "rgba(255,255,255,0.28)" }}
      >
        Try searching for
      </p>

      <div className="w-full flex flex-wrap justify-center gap-2">
        {examples.map(({ query, icon }, i) => (
          <motion.button
            key={query}
            onClick={() => onSelect(query)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.48 + i * 0.05,
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="group flex items-center gap-2 text-left px-3.5 py-2 rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,175,55,0.06)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)";
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span className="text-[13px] leading-none select-none">{icon}</span>
            <span className="font-display text-[12px] tracking-wide whitespace-nowrap">
              {query}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
