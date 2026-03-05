"use client";

import { useState, useRef, useCallback, useEffect, CSSProperties } from "react";
import { Search, Upload, Mic, AlertCircle, Square, Bookmark, Link2, Download, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";

import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

import ParticleCanvas from "@/components/ParticleCanvas";
import ScanningOverlay from "@/components/ScanningOverlay";

type SearchResult = {
  id: string;
  title: string;
  score: number;
  url: string;
  bpm?: number;
  tags?: string[];
  year?: number;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);


  const hasResults = results.length > 0;
  const hasInput = !!query || !!file;
  const activeMode: "text" | "upload" | "mic" = isRecording ? "mic" : file ? "upload" : "text";

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }
    const interval = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const el = document.getElementById("ambient-glow");
    if (el) {
      if (isScanning) {
        el.classList.add("ambient-glow--scanning");
      } else {
        el.classList.remove("ambient-glow--scanning");
      }
    }
  }, [isScanning]);

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

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

  const pendingResultsRef = useRef<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!file && !query) {
      setError("Please type a query or upload an audio file to search.");
      return;
    }

    setIsScanning(true);
    setError("");
    setResults([]);
    setIsFocused(false);

    try {
      const formData = new FormData();
      if (query) formData.append("query", query);
      if (file) formData.append("audio", file);

      pendingResultsRef.current = [
        { id: "1", title: "Obscure Italian Flute Break '74", score: 98, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", bpm: 92, tags: ["Flute", "Break", "Italian"], year: 1974 },
        { id: "2", title: "Dusty Jazz Drum Loop (110bpm)", score: 85, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", bpm: 110, tags: ["Drums", "Jazz", "Loop"], year: 1968 },
        { id: "3", title: "Motown Bass Groove - Isolated", score: 81, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", bpm: 105, tags: ["Bass", "Motown", "Groove"], year: 1971 },
        { id: "4", title: "Vinyl Crackle and Synth Wash", score: 76, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", bpm: 80, tags: ["Texture", "Vinyl", "Ambient"], year: 1982 },
        { id: "5", title: "Lo-Fi Hip Hop Kick & Snare", score: 72, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", bpm: 85, tags: ["Drums", "Lo-fi", "Hip-hop"], year: 2019 },
      ];
    } catch (err) {
      console.warn("API Error:", err);
      setError("An error occurred while fetching results.");
      setIsScanning(false);
    }
  };

  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    setIsFocused(false);
    setResults(pendingResultsRef.current);
  }, []);

  const { user, logout, saveSound } = useAuth();
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  const ghostBtn: CSSProperties = { background: "none", border: "1px solid #2a2a2a", color: "#666", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", cursor: "pointer" };
  const goldBtn: CSSProperties = { backgroundColor: "#b8a96a", border: "none", color: "#0a0a0a", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", fontWeight: 600, cursor: "pointer" };

  return (
    <>
      <ParticleCanvas isScanning={isScanning} />

      <AnimatePresence>
        {isScanning && <ScanningOverlay onComplete={handleScanComplete} />}
      </AnimatePresence>

      <main
        className="flex min-h-screen flex-col items-center justify-start px-6 md:px-12 relative max-w-[1400px] mx-auto"
        style={{
          paddingTop: hasResults ? 48 : "16vh",
          paddingBottom: 96,
          transition: "padding-top 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isScanning ? 0 : 1,
          transitionProperty: "padding-top, opacity",
          transitionDuration: "0.7s, 0.5s",
        }}
      >

        <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}>
          {user ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <a href="/profile" style={{ color: "#b8a96a", fontSize: "0.7rem", letterSpacing: "0.1rem" }}>
                {user.username.toUpperCase()}
              </a>
              <button onClick={logout} style={ghostBtn}>SIGN OUT</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setAuthModal("login")} style={ghostBtn}>LOG IN</button>
              <button onClick={() => setAuthModal("signup")} style={goldBtn}>SIGN UP</button>
            </div>
          )}
        </div>

        {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
        <div className="flex flex-col items-center justify-center text-center z-30 relative w-full max-w-3xl">
          <motion.h1
            className="font-display font-bold text-white mb-1"
            style={{
              fontSize: hasResults ? 32 : 80,
              letterSpacing: hasResults ? "0.25em" : "0.35em",
              textShadow: "0 0 60px rgba(212,175,55,0.08)",
              transition: "font-size 0.7s cubic-bezier(0.4,0,0.2,1), letter-spacing 0.7s cubic-bezier(0.4,0,0.2,1)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            OBI
          </motion.h1>

          <div
            style={{
              maxHeight: hasResults ? 0 : 120,
              opacity: hasResults ? 0 : 1,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease",
            }}
          >
            <motion.p
              className="font-display text-lg md:text-2xl font-semibold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The Sonic Search Engine.
            </motion.p>
            <motion.p
              className="font-display text-sm md:text-base max-w-lg leading-snug mb-6"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Turn hours of crate digging into seconds of discovery. Find the
              obscure, perfect sounds for your next hit.
            </motion.p>
          </div>

          <motion.div
            className="relative w-full max-w-2xl mx-auto"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: isFocused ? "1px solid rgba(212,175,55,0.15)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              backdropFilter: "blur(12px)",
              transition: "border-color 0.3s ease",
            }}
            onClick={() => setIsFocused(true)}
            onFocus={() => setIsFocused(true)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative flex items-center cursor-pointer" style={{ padding: "14px 18px" }} onClick={() => setIsFocused(true)}>
              <Search
                className="h-5 w-5 shrink-0 transition-colors duration-300"
                style={{ color: isFocused ? "var(--accent)" : "var(--text-tertiary)", opacity: isFocused ? 1 : 0.5 }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && hasInput && handleSearch()}
                onFocus={() => setIsFocused(true)}
                disabled={isRecording || !!file}
                className="flex-1 bg-transparent pl-3 pr-2 outline-none font-display text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-primary)" }}
                placeholder={isRecording ? "Recording in progress…" : file ? "Audio file loaded" : "Describe a sound or vibe…"}
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (isFocused) { fileInputRef.current?.click(); } else { setIsFocused(true); } }}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    color: file ? "var(--accent)" : "rgba(255,255,255,0.3)",
                    opacity: file ? 1 : undefined,
                  }}
                  onMouseEnter={(e) => { if (!file) (e.currentTarget.style.opacity = "0.7"); }}
                  onMouseLeave={(e) => { if (!file) (e.currentTarget.style.opacity = "1"); }}
                  title="Upload audio"
                >
                  <Upload size={18} />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); if (isRecording) { stopRecording(); } else { setIsFocused(true); startRecording(); } }}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      color: isRecording ? "var(--accent)" : "rgba(255,255,255,0.3)",
                      background: isRecording ? "rgba(212,175,55,0.1)" : "transparent",
                    }}
                    title={isRecording ? "Stop recording" : "Record audio"}
                  >
                    {isRecording ? <Square size={14} className="fill-current" /> : <Mic size={18} />}
                  </button>
                  {isRecording && (
                    <span
                      className="absolute -top-1.5 -right-1.5 font-data text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none"
                      style={{ color: "var(--accent)", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}
                    >
                      {formatTime(recordingTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                  style={{ borderTop: "1px solid var(--border-default)" }}
                >
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {(["text", "upload", "mic"] as const).map((mode) => (
                        <span
                          key={mode}
                          className="font-data text-[10px] uppercase py-[5px] px-4 rounded-[3px] transition-all duration-200"
                          style={{
                            letterSpacing: "3px",
                            color: activeMode === mode ? "var(--accent)" : "var(--text-tertiary)",
                            background: activeMode === mode ? "rgba(212,175,55,0.1)" : "transparent",
                            border: activeMode === mode ? "1px solid rgba(212,175,55,0.25)" : "1px solid transparent",
                          }}
                        >
                          {mode}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex flex-col items-center justify-center gap-1.5 py-7 px-4 rounded-[14px] transition-all duration-200"
                        style={{
                          border: "1px dashed rgba(255,255,255,0.08)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
                          e.currentTarget.style.background = "rgba(212,175,55,0.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Upload size={28} className="transition-colors duration-200" style={{ color: "var(--text-secondary)" }} />
                        <span className="font-display text-[13px]" style={{ color: "var(--text-secondary)" }}>Upload audio</span>
                        <span className="font-data text-[9px] uppercase" style={{ letterSpacing: "1.5px", color: "var(--text-tertiary)" }}>
                          Drop .wav or .mp3
                        </span>
                      </button>

                      <button
                        onMouseDown={(e) => { e.preventDefault(); startRecording(); }}
                        onMouseUp={stopRecording}
                        onMouseLeave={() => { if (isRecording) stopRecording(); }}
                        onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                        onTouchEnd={stopRecording}
                        className="group flex flex-col items-center justify-center gap-1.5 py-7 px-4 rounded-[14px] transition-all duration-200"
                        style={{
                          border: isRecording ? "1px solid rgba(212,175,55,0.4)" : "1px dashed rgba(255,255,255,0.08)",
                          background: isRecording ? "rgba(212,175,55,0.04)" : "transparent",
                        }}
                      >
                        {isRecording ? (
                          <div
                            className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                            style={{
                              border: "2px solid var(--accent)",
                              background: "rgba(212,175,55,0.06)",
                              animation: "pulseMic 2s ease-in-out infinite",
                            }}
                          >
                            <Square size={20} style={{ color: "var(--accent)" }} className="fill-current" />
                          </div>
                        ) : (
                          <>
                            <Mic size={28} className="transition-colors duration-200" style={{ color: "var(--text-secondary)" }} />
                            <span className="font-display text-[13px]" style={{ color: "var(--text-secondary)" }}>Record mic</span>
                            <span className="font-data text-[9px] uppercase" style={{ letterSpacing: "1.5px", color: "var(--text-tertiary)" }}>
                              Hold to record
                            </span>
                          </>
                        )}
                        {isRecording && (
                          <span className="font-data text-[11px] mt-1" style={{ color: "var(--accent)" }}>
                            {formatTime(recordingTime)}
                          </span>
                        )}
                      </button>
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="audio/wav, audio/mpeg" className="hidden" />

                    {file && filePreviewUrl && (
                      <div className="w-full rounded-xl overflow-hidden" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
                        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                          <span className="truncate max-w-[75%] text-sm font-medium flex items-center gap-2" style={{ color: "var(--accent)" }}>
                            <Play size={12} className="fill-current shrink-0" />
                            {file.name}
                          </span>
                          <button
                            onClick={() => setFile(null)}
                            className="font-data text-[9px] uppercase tracking-widest font-bold transition-colors hover:text-white"
                            style={{ color: "var(--accent-dim)" }}
                          >
                            Clear
                          </button>
                        </div>
                        <div className="px-2 pb-2">
                          <AudioPlayer url={filePreviewUrl} />
                        </div>
                      </div>
                    )}

                    {!hasInput && (
                      <p className="font-display text-xs text-center font-medium tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                        Paste a vibe, drop audio, or hold to record.
                      </p>
                    )}

                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSearch(); }}
                      disabled={isScanning || !hasInput}
                      className="w-full mt-1 py-[15px] rounded-xl font-data text-xs font-bold uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        letterSpacing: "5px",
                        background: hasInput
                          ? "linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)"
                          : "rgba(212,175,55,0.03)",
                        border: hasInput
                          ? "1px solid rgba(212,175,55,0.25)"
                          : "1px solid rgba(212,175,55,0.1)",
                        color: hasInput ? "rgba(212,175,55,0.85)" : "rgba(212,175,55,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        if (hasInput) {
                          e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
                          e.currentTarget.style.background = "rgba(212,175,55,0.1)";
                          e.currentTarget.style.boxShadow = "0 0 40px rgba(212,175,55,0.08), inset 0 0 40px rgba(212,175,55,0.03)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = hasInput ? "rgba(212,175,55,0.25)" : "rgba(212,175,55,0.1)";
                        e.currentTarget.style.background = hasInput
                          ? "linear-gradient(180deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.03) 100%)"
                          : "rgba(212,175,55,0.03)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {isScanning ? "Scanning…" : "Scan Sound"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>



          {error && (
            <motion.div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl w-full max-w-2xl mt-6"
              style={{
                color: "rgba(255,100,100,0.9)",
                background: "rgba(255,50,50,0.06)",
                border: "1px solid rgba(255,50,50,0.15)",
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {hasResults && (
            <motion.div
              className="w-full max-w-2xl flex flex-col gap-4 z-30 relative pb-20 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="flex items-center justify-between font-data text-[10px] uppercase mb-1 pb-2"
                style={{ letterSpacing: "3px", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-default)" }}
              >
                <span>Results</span>
                <span>Match %</span>
              </div>

              {results.map((result, i) => (
                <div
                  key={result.id}
                  className="group/card flex flex-col gap-2 rounded-[16px] relative"
                  style={{
                    padding: "20px 22px",
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s both`,
                    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.04), rgba(255,255,255,0.02))";
                    el.style.borderColor = "rgba(212,175,55,0.15)";
                    el.style.transform = "translateY(-3px) scale(1.005)";
                    el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255,255,255,0.015)";
                    el.style.borderColor = "rgba(255,255,255,0.05)";
                    el.style.transform = "translateY(0) scale(1)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-display text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {result.title}
                    </span>
                    <div
                      className="flex items-baseline gap-0.5 rounded-[10px] px-3.5 py-2"
                      style={{
                        background: result.score >= 90
                          ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))"
                          : "rgba(255,255,255,0.03)",
                        border: result.score >= 90
                          ? "1px solid rgba(212,175,55,0.25)"
                          : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span
                        className="font-data text-xl font-extrabold tabular-nums"
                        style={{ color: result.score >= 90 ? "var(--accent)" : "var(--text-secondary)" }}
                      >
                        {result.score}
                      </span>
                      <span className="font-data text-[9px]" style={{ color: "var(--text-tertiary)" }}>%</span>
                    </div>
                  </div>

                  {(result.bpm || result.tags || result.year) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.bpm && (
                        <span className="font-data text-[10px] font-bold" style={{ color: "var(--accent-dim)" }}>
                          {result.bpm} BPM
                        </span>
                      )}
                      {result.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="font-data text-[9px] uppercase px-1.5 py-0.5 rounded"
                          style={{ letterSpacing: "1.5px", color: "var(--text-tertiary)", background: "rgba(255,255,255,0.03)" }}
                        >
                          {tag}
                        </span>
                      ))}
                      {result.year && (
                        <span className="font-data text-[10px]" style={{ color: "var(--text-tertiary)" }}>{result.year}</span>
                      )}
                    </div>
                  )}

                  <AudioPlayer url={result.url} />

                  <div
                    className="flex items-center gap-3 opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-250"
                  >
                    {[
                      { icon: Bookmark, label: "Save", action: () => {
                        if (!user) return;
                        saveSound({
                          title: result.title,
                          bpm: result.bpm,
                          tags: result.tags ?? [],
                          year: result.year,
                          matchPercent: result.score,
                        });
                      }},
                      { icon: Link2, label: "Share", action: () => {
                        const shareData = { title: result.title, text: `Check out this sound: ${result.title}`, url: result.url };
                        if (navigator.share) {
                          navigator.share(shareData).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(result.url);
                        }
                      }},
                      { icon: Download, label: "Download", action: () => {
                        const a = document.createElement("a");
                        a.href = result.url;
                        a.download = `${result.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
                        a.target = "_blank";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }},
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="font-data text-[9px] uppercase flex items-center gap-1 transition-colors duration-200"
                        style={{ letterSpacing: "2px", color: "var(--text-tertiary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="fixed inset-0 z-20"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFocused(false)}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
}



