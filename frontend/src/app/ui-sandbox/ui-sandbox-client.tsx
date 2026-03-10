"use client";

import { useState } from "react";
import VibeKnob from "@/components/VibeKnob";

/**
 * Render a UI sandbox page featuring a "Dust" VibeKnob and a live display of its value.
 *
 * The component manages an internal `dust` state (initially 27). Adjusting the VibeKnob updates
 * that state and immediately reflects the current value in the status card.
 *
 * @returns A JSX element representing a full-height black page with a centered main area,
 *          a heading, a VibeKnob labeled "Dust", and a status card showing the current dust value.
 */
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