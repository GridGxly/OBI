"use client";

import { useState } from "react";
import { toast } from "sonner";
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
          <h2 className="text-lg font-medium">Toast Notification</h2>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <button
              onClick={() => toast("A sonner toast")}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent-dim"
            >
              Show Toast
            </button>
          </div>
        </div>

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