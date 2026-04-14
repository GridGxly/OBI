"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";

export default function KeyboardHint() {
  const { currentTrack } = usePlayer();
  const [dismissed, setDismissed] = useState(true); // default hidden

  useEffect(() => {
    // Only show on desktop
    if (typeof window === "undefined" || "ontouchstart" in window) return;

    const wasDismissed = localStorage.getItem("obi_kb_hint_dismissed");
    if (!wasDismissed && currentTrack) {
      setDismissed(false);
    }
  }, [currentTrack]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("obi_kb_hint_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {!dismissed && currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[80px] left-0 right-0 z-[49] flex items-center justify-center py-2 px-4"
          style={{
            background: "rgba(6,6,6,0.92)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(212,175,55,0.1)",
            borderBottom: "1px solid rgba(212,175,55,0.05)",
          }}
        >
          <div className="flex items-center gap-6 font-data text-[9px] uppercase tracking-[2px]"
            style={{ color: "var(--accent-dim)" }}>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] mr-1">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] mr-1">← →</kbd> Skip</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] mr-1">↑ ↓</kbd> Volume</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] mr-1">M</kbd> Mute</span>
          </div>

          <button
            onClick={handleDismiss}
            className="ml-4 p-1 transition-colors duration-150"
            style={{ color: "rgba(212,175,55,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(212,175,55,0.3)"; }}
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
