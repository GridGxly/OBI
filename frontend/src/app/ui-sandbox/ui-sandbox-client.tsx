"use client";

import { useState } from "react";
import VibeKnob from "@/components/VibeKnob";

export default function UISandbox() {
  const [dust, setDust] = useState(27);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative mx-auto max-w-5xl p-10">
        <h1 className="text-2xl font-semibold tracking-wide">
          OBI UI Sandbox
        </h1>

        <div className="mt-8">
          <VibeKnob
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