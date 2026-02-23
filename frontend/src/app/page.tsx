"use client";

import { useState, useRef } from "react";
import { Search, UploadCloud, Mic, AlertCircle } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";

type SearchResult = {
  id: string;
  title: string;
  score: number;
  url: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav"];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a .wav or .mp3 file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSearch = async () => {
    if (!file && !query) {
      setError("Please type a query or upload an audio file to search.");
      return;
    }

    setIsSearching(true);
    setError("");
    setResults([]);

    try {
      const formData = new FormData();
      if (query) formData.append("query", query);
      if (file) formData.append("audio", file);

      const response = await fetch("/search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Endpoint failed or does not exist yet.");
      }

      const data = await response.json();
      setResults(data.results || []);

    } catch (err) {
      console.warn("API Error:", err);
      setError("Using mock data because POST /search failed (endpoint may not exist yet).");
      setResults([
        { id: "1", title: "Obscure Italian Flute Break '74", score: 98, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { id: "2", title: "Dusty Jazz Drum Loop", score: 85, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-32 pb-24 px-6 md:px-12 relative overflow-hidden max-w-[1400px] mx-auto">
      
      <div className="absolute top-0 left-1/2 w-[600px] h-[400px] -translate-x-1/2 bg-accent-amber/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col items-center justify-center text-center space-y-8 z-10 mb-20 max-w-3xl mt-16">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-100 drop-shadow-lg">
          OBI
        </h1>
        <p className="text-xl md:text-3xl font-medium tracking-tight text-zinc-400">
          The Sonic Search Engine.
        </p>
        <p className="text-base md:text-xl text-zinc-500 max-w-2xl leading-relaxed mt-2">
          Turn hours of crate digging into seconds of discovery. Connect with the obscure, perfect sounds you need to orchestrate your next hit.
        </p>

        <div className="relative w-full max-w-2xl mt-8 mx-auto">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#161616]/90 border border-zinc-800 rounded-2xl py-5 pl-14 pr-4 transition-all focus:border-accent-amber/50 outline-none text-zinc-100 placeholder-zinc-600 tactile-inset focus:ring-1 focus:ring-accent-amber/50 font-medium"
            placeholder="Type a vibe (e.g., 'dusty drum break')"
          />
        </div>

        <div className="w-full max-w-2xl bg-[#1A1A1A] border border-zinc-800 rounded-2xl p-6 tactile-shadow flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center w-full gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-4 border-2 border-dashed border-zinc-700 hover:border-accent-amber/50 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-accent-amber transition-colors bg-[#111]"
            >
              <UploadCloud size={24} />
              <span className="text-sm font-medium">Upload .wav or .mp3</span>
            </button>
            <button className="flex-1 py-4 border border-zinc-700 hover:border-zinc-500 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors bg-[#111]">
              <Mic size={24} className="text-red-500/80" />
              <span className="text-sm font-medium">Record Hum or Beatbox</span>
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="audio/wav, audio/mpeg" 
            className="hidden" 
          />

          {file && (
            <div className="w-full bg-black/50 border border-zinc-800 p-3 rounded-lg text-sm text-zinc-300 flex justify-between items-center">
              <span className="truncate max-w-[80%]">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-400 text-xs uppercase tracking-wider font-bold">Remove</button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 px-4 py-3 rounded-lg w-full max-w-2xl border border-red-900/30">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full max-w-2xl py-4 rounded-xl bg-accent-amber hover:bg-accent-gold transition-all text-black font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(212,139,34,0.2)] hover:shadow-[0_0_25px_rgba(229,169,61,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? "Analyzing..." : "Search Engine"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="w-full max-w-2xl flex flex-col gap-4 z-10 pb-20">
          <div className="flex items-center justify-between uppercase tracking-widest text-[11px] font-mono text-zinc-500 mb-2 border-b border-zinc-800 pb-2">
            <span>Results</span>
            <span>Match %</span>
          </div>
          
          {results.map((result) => (
            <div key={result.id} className="flex flex-col gap-2 p-4 bg-[#111] rounded-2xl border border-zinc-800 tactile-shadow">
              <div className="flex items-center justify-between px-2">
                <span className="font-semibold text-zinc-200 text-lg">{result.title}</span>
                <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">Score: {result.score}%</span>
              </div>
              <AudioPlayer url={result.url} />
            </div>
          ))}
        </div>
      )}

    </main>
  );
}
