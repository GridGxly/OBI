"use client";

import { motion } from "framer-motion";

interface ExampleSearchesProps {
  onSelect: (query: string) => void;
}

const examples = [
  { emoji: "🥁", query: "old school jazz drums" },
  { emoji: "🎬", query: "dramatic movie flute" },
  { emoji: "🎧", query: "vinyl record crackle" },
  { emoji: "🎸", query: "funky bass guitar" },
  { emoji: "🌊", query: "calm background synth" },
  { emoji: "🎤", query: "soulful singing" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.5,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export default function ExampleSearches({ onSelect }: ExampleSearchesProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-5 mt-8"
    >
      <motion.p
        variants={pillVariants}
        className="font-[family-name:var(--font-data)] text-[9px] uppercase tracking-[4px]"
        style={{ color: "var(--text-secondary)" }}
      >
        Try searching for
      </motion.p>

      <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
        {examples.map((ex) => (
          <motion.button
            key={ex.query}
            variants={pillVariants}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(ex.query)}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.025)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent)",
              }}
            />

            <span
              className="relative flex items-center justify-center w-7 h-7 rounded-full text-sm flex-shrink-0"
              style={{
                background: "rgba(212, 175, 55, 0.06)",
                fontSize: "15px",
              }}
            >
              {ex.emoji}
            </span>

            <span
              className="font-[family-name:var(--font-display)] text-[13px] text-left whitespace-nowrap transition-colors duration-200"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              <span className="group-hover:text-[rgba(212,175,55,0.9)] transition-colors duration-200">
                {ex.query}
              </span>
            </span>

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.04), rgba(212, 175, 55, 0.01))",
              }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
