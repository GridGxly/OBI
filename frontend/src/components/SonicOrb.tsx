"use client";

import { motion } from "framer-motion";

type SonicOrbProps = {
  intensity: "idle" | "focused" | "searching";
};

export default function SonicOrb({ intensity }: SonicOrbProps) {
  const ringBase =
    "absolute rounded-full border pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  const config = {
    idle: {
      scale: 1,
      opacity: 0.08,
      borderColor: "rgba(212,139,34,0.15)",
      glowOpacity: 0.05,
    },
    focused: {
      scale: 1.1,
      opacity: 0.2,
      borderColor: "rgba(212,139,34,0.35)",
      glowOpacity: 0.15,
    },
    searching: {
      scale: 1.25,
      opacity: 0.3,
      borderColor: "rgba(229,169,61,0.5)",
      glowOpacity: 0.25,
    },
  };

  const c = config[intensity];

  const rings = [
    { size: 320, delay: 0, duration: 3 },
    { size: 480, delay: 1, duration: 3.5 },
    { size: 640, delay: 2, duration: 4 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(212,139,34,${c.glowOpacity}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [c.scale, c.scale * 1.15, c.scale],
          opacity: [c.opacity, c.opacity * 1.4, c.opacity],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className={ringBase}
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: c.borderColor,
            borderWidth: intensity === "idle" ? 0.5 : 1,
          }}
          animate={{
            scale: [0.85, c.scale, 0.85],
            opacity: [c.opacity * 0.3, c.opacity, c.opacity * 0.3],
          }}
          transition={{
            duration: ring.duration,
            delay: ring.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(212,139,34,${c.glowOpacity * 0.3}) 0%, transparent 60%)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
