"use client";

import { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ParticleCanvasProps {
  isScanning: boolean;
}

/**
 * Renders a full-viewport, non-interactive canvas that displays an animated particle field whose visual behavior changes based on scanning state.
 *
 * When `isScanning` is true particles are visually warmer and subtly attracted toward the canvas center; when false particles drift freely and faint connecting lines are drawn between nearby particles.
 *
 * @param isScanning - Enables scanning mode visuals and center attraction when true
 * @returns The canvas element that renders the animated particle field
 */
export default function ParticleCanvas({ isScanning }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const isScanningRef = useRef(isScanning);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 90;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: 0.4 + Math.random() * 1.8,
        opacity: 0.05 + Math.random() * 0.25,
      });
    }
    particlesRef.current = particles;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scanning = isScanningRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const p of particles) {
        if (scanning) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / dist) * 0.008;
          p.vy += (dy / dist) * 0.008;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.2) {
            p.vx = (p.vx / speed) * 1.2;
            p.vy = (p.vy / speed) * 1.2;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (scanning) {
          ctx.fillStyle = `rgba(255,180,50,${p.opacity * 2})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.4})`;
        }
        ctx.fill();
      }

      if (!scanning) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 100) * 0.03})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
