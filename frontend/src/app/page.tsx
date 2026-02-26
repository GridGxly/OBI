"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, UploadCloud, Mic, AlertCircle, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";
import SonicOrb from "@/components/SonicOrb";

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
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [file]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const recordedFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
        setFile(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access denied. Please allow mic permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const vibeChips = [
    "dusty drum break",
    "lo-fi Rhodes",
    "anime intro synth",
    "UKG swing",
    "vinyl crackle",
    "tape hiss",
  ];

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
    setIsFocused(false);
    setHasSearched(true);

    try {
      const formData = new FormData();
      if (query) formData.append("query", query);
      if (file) formData.append("audio", file);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setResults([
        { id: "1", title: "Obscure Italian Flute Break '74", score: 98, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { id: "2", title: "Dusty Jazz Drum Loop (110bpm)", score: 85, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
        { id: "3", title: "Motown Bass Groove - Isolated", score: 81, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
        { id: "4", title: "Vinyl Crackle and Synth Wash", score: 76, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
        { id: "5", title: "Lo-Fi Hip Hop Kick & Snare", score: 72, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
      ]);
    } catch (err) {
      console.warn("API Error:", err);
      setError("An error occurred while fetching results.");
    } finally {
      setIsSearching(false);
    }
  };

  const orbIntensity = isSearching
    ? "searching"
    : isFocused || isRecording
      ? "focused"
      : "idle";

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-14 pb-24 px-6 md:px-12 relative overflow-hidden max-w-[1400px] mx-auto bg-noise">
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]">
        <SonicOrb intensity={orbIntensity} />
      </div>

      <div className="flex flex-col items-center justify-center text-center z-30 relative w-full max-w-3xl">
        <motion.h1
          className="text-4xl md:text-6xl font-black tracking-[-0.06em] text-white drop-shadow-md mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          OBI
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl font-semibold tracking-tight text-zinc-100 mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          The Sonic Search Engine.
        </motion.p>
        <motion.p
          className="text-sm md:text-base text-zinc-300 max-w-lg leading-snug mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Turn hours of crate digging into seconds of discovery. Find the
          obscure, perfect sounds for your next hit.
        </motion.p>

        <motion.div
          className={`relative w-full max-w-2xl mx-auto transition-all duration-300 ease-out bg-[#111]/90 backdrop-blur-sm rounded-[24px] border ${
            isFocused
              ? "border-accent-amber/50 shadow-[0_0_40px_rgba(212,139,34,0.2)] ring-1 ring-accent-amber/40"
              : "border-zinc-800 hover:border-zinc-700 tactile-shadow"
          }`}
          onFocus={() => setIsFocused(true)}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute -inset-[3px] rounded-[27px] border border-accent-amber/30 pointer-events-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0.98, 1.01, 0.98],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="relative flex items-center p-2">
            <div className="pl-4 flex items-center pointer-events-none">
              <Search
                className={`h-5 w-5 transition-colors duration-300 ${isFocused ? "text-accent-amber" : "text-zinc-500"}`}
              />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setIsFocused(true)}
              className="flex-1 bg-transparent py-3.5 pl-4 pr-4 outline-none text-zinc-100 placeholder-zinc-500 font-medium text-base md:text-lg leading-none"
              placeholder="Describe a sound or vibe…"
            />
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isFocused) {
                    fileInputRef.current?.click();
                  } else {
                    setIsFocused(true);
                  }
                }}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isFocused
                    ? "text-accent-amber/70 hover:text-accent-amber hover:bg-accent-amber/10"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
                title="Upload audio"
              >
                <UploadCloud size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isRecording) {
                    stopRecording();
                  } else {
                    setIsFocused(true);
                    startRecording();
                  }
                }}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isRecording
                    ? "text-red-500 bg-red-500/20 animate-pulse"
                    : isFocused
                      ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                      : "text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                }`}
                title={isRecording ? "Stop recording" : "Record audio"}
              >
                {isRecording ? <Square size={18} className="fill-current" /> : <Mic size={20} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden border-t border-zinc-800/50"
              >
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 group relative overflow-hidden bg-[#161616] border border-zinc-700/80 hover:border-accent-amber/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(212,139,34,0.12)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-accent-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <UploadCloud
                        size={36}
                        className="text-zinc-400 group-hover:text-accent-amber mb-1 transition-colors duration-200"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm font-semibold text-zinc-200">
                        Upload audio
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold">
                        Drop .wav or .mp3
                      </span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); startRecording(); }}
                      onMouseUp={stopRecording}
                      onMouseLeave={() => { if (isRecording) stopRecording(); }}
                      onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                      onTouchEnd={stopRecording}
                      className={`flex-1 group relative overflow-hidden border rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                        isRecording
                          ? "bg-red-950/30 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)]"
                          : "bg-[#161616] border-zinc-700/80 hover:border-red-800/50 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(220,38,38,0.08)]"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {isRecording ? (
                        <div className="w-9 h-9 rounded-full bg-red-500 animate-pulse mb-1 flex items-center justify-center">
                          <Square size={16} className="text-white fill-white" />
                        </div>
                      ) : (
                        <Mic
                          size={36}
                          className="text-zinc-400 group-hover:text-red-500 mb-1 transition-colors duration-200"
                          strokeWidth={1.5}
                        />
                      )}
                      <span className="text-sm font-semibold text-zinc-200">
                        {isRecording ? "Recording…" : "Record mic"}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-bold">
                        {isRecording ? "Release to stop" : "Hold to record"}
                      </span>
                    </button>
                  </div>

                  <input type="hidden" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="audio/wav, audio/mpeg"
                    className="hidden"
                  />

                  {file && filePreviewUrl && (
                    <div className="w-full bg-accent-amber/10 border border-accent-amber/20 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                        <span className="truncate max-w-[75%] text-sm font-medium text-accent-amber flex items-center gap-2">
                          <Play size={12} className="fill-current shrink-0" />
                          {file.name}
                        </span>
                        <button
                          onClick={() => setFile(null)}
                          className="text-accent-amber hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="px-2 pb-2">
                        <AudioPlayer url={filePreviewUrl} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearch();
                    }}
                    disabled={isSearching}
                    className="w-full mt-1 py-4 rounded-xl bg-accent-amber hover:bg-accent-gold transition-all duration-300 text-black font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,139,34,0.2)] hover:shadow-[0_0_35px_rgba(229,169,61,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="group-hover:scale-105 transition-transform">
                        {isSearching ? "Scanning…" : "Scan Sound"}
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-5 flex flex-col items-center justify-center w-full relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-3">
            Try a vibe
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4 relative">
            {vibeChips.map((vibe, i) => (
              <motion.button
                key={vibe}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuery(vibe);
                  setIsFocused(true);
                }}
                className="px-4 py-2 rounded-full border border-zinc-800 bg-[#151515]/80 backdrop-blur-sm text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:border-accent-amber/30 hover:bg-[#1e1e1e] transition-all duration-200 cursor-pointer hover:scale-[1.04]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
              >
                {vibe}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 px-4 py-3 rounded-xl w-full max-w-2xl border border-red-900/30 mt-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <motion.div
            key="results"
            className="w-full max-w-2xl flex flex-col gap-4 z-30 relative pb-20 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between uppercase tracking-widest text-[11px] font-mono text-zinc-500 mb-1 border-b border-zinc-800 pb-2">
              <span>Results</span>
              <span>Match %</span>
            </div>

            {results.map((result, i) => (
              <motion.div
                key={result.id}
                className="flex flex-col gap-2 p-4 bg-[#111]/80 backdrop-blur-sm rounded-2xl border border-zinc-800 tactile-shadow hover:border-zinc-700 transition-colors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between px-2">
                  <span className="font-semibold text-zinc-200 text-lg">
                    {result.title}
                  </span>
                  <span className="text-xs font-mono text-accent-amber/80 bg-accent-amber/10 px-2.5 py-1 rounded-lg">
                    {result.score}%
                  </span>
                </div>
                <AudioPlayer url={result.url} />
              </motion.div>
            ))}
          </motion.div>
        ) : !hasSearched ? (
          <motion.div
            key="skeleton"
            className="w-full max-w-2xl flex flex-col gap-4 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between uppercase tracking-widest text-[11px] font-mono text-zinc-600 mb-1 border-b border-zinc-800/50 pb-2">
              <span>Results</span>
              <span>Match %</span>
            </div>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col gap-3 p-4 bg-[#111]/40 rounded-2xl border border-zinc-800/40"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="h-5 w-[60%] rounded-md skeleton-shimmer" />
                  <div className="h-5 w-12 rounded-md skeleton-shimmer" />
                </div>
                <div className="flex items-center gap-4 w-full p-3 rounded-xl bg-[#1A1A1A]/50 border border-zinc-800/30">
                  <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
                  <div className="flex-1 h-2 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
