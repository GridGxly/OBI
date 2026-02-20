"use client";

import { useState } from "react";
import { TimbreKnob } from "@/components/TimbreKnob";

export default function UISandbox() {
  const [dust, setDust] = useState(27);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Neon glow background */}
      <div className="pointer-events-none fixed inset-0">
        {/* top left*/}
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500/25 blur-[120px]" />
        <div className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-fuchsia-400/20 blur-[90px]" />

        {/*bottom right*/}
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-amber-400/25 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-amber-300/20 blur-[90px]" />
      </div>

      <main className="relative mx-auto max-w-5xl p-10">
        <h1 className="text-2xl font-semibold tracking-wide">
          OBI UI Sandbox
        </h1>

        <div className="mt-8">
          <TimbreKnob
            param="dust"
            label="Dust"
            value={dust}
            onChange={setDust}
          />
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
          Dust Value:
          <span className="ml-2 font-mono text-amber-200">{dust}</span>
        </div>
      </main>
    </div>
  );
}