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
      opacity: 0.12,
      borderColor: "rgba(212,139,34,0.18)",
      glowOpacity: 0.06,
      speed: 6,
    },
    focused: {
      scale: 1.12,
      opacity: 0.25,
      borderColor: "rgba(212,139,34,0.4)",
      glowOpacity: 0.18,
      speed: 3,
    },
    searching: {
      scale: 1.3,
      opacity: 0.35,
      borderColor: "rgba(229,169,61,0.55)",
      glowOpacity: 0.3,
      speed: 1.5,
    },
  };

  const c = config[intensity];

  const rings = [
    { size: 300, delayFrac: 0 },
    { size: 440, delayFrac: 0.33 },
    { size: 580, delayFrac: 0.66 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ clipPath: "circle(50%)" }}>
      <motion.div
        className="absolute w-[180px] h-[180px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(212,139,34,${c.glowOpacity}) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [c.scale, c.scale * 1.2, c.scale],
          opacity: [c.opacity, c.opacity * 1.5, c.opacity],
        }}
        transition={{ duration: c.speed * 0.8, repeat: Infinity, ease: "easeInOut" }}
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
            duration: c.speed,
            delay: ring.delayFrac * c.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(212,139,34,${c.glowOpacity * 0.25}) 0%, transparent 60%)`,
        }}
        animate={{
          scale: [1, 1.04, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: c.speed * 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
