"use client";

import { useState, useRef, useCallback, useEffect, CSSProperties } from "react";
import { Search, Upload, Mic, AlertCircle, Square, Bookmark, Play, History, X, RefreshCw, ArrowLeft, SlidersHorizontal, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";
import VibeKnob from "@/components/VibeKnob";
import ExampleSearches from "@/components/ExampleSearches";
import SkeletonCard from "@/components/SkeletonCard";
import MatchArc from "@/components/MatchArc";

import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/context/ToastContext";
import { usePlayer } from "@/context/PlayerContext";

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

interface SearchSource {
  type: "text" | "upload" | "recording" | "similar";
  query?: string;
  fileName?: string;
  similarTo?: string;
}

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
  const [isUtilityPanelOpen, setIsUtilityPanelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const { user, logout, saveSound } = useAuth();
  const { showToast } = useToast();
  const { startPreview, stopPreview, dismiss } = usePlayer();
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window);

  const hasResults = results.length > 0;
  const hasInput = !!query || !!file;
  
  const modes = ["text", "upload", "mic"] as const;
  type Mode = typeof modes[number];
  const [currentMode, setCurrentMode] = useState<Mode>("text");
  const [modeDirection, setModeDirection] = useState(0);

  const switchMode = (newMode: Mode) => {
    const oldIndex = modes.indexOf(currentMode);
    const newIndex = modes.indexOf(newMode);
    setModeDirection(newIndex > oldIndex ? 1 : -1);
    setCurrentMode(newMode);
  };

  const [filters, setFilters] = useState({ dust: 0, warmth: 0, crunch: 0 });

  const handleFilterChange = useCallback((key: "dust" | "warmth" | "crunch", value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({ dust: 0, warmth: 0, crunch: 0 });
  }, []);

  const [searchSource, setSearchSource] = useState<SearchSource | null>(null);
  const [resultHistory, setResultHistory] = useState<Array<{
    source: SearchSource;
    results: SearchResult[];
  }>>([]);

  const handleFindSimilar = (sourceResult: SearchResult) => {
    dismiss();

    if (results.length > 0 && searchSource) {
      setResultHistory(prev => {
        const newHistory = [...prev, { source: searchSource, results }];
        if (newHistory.length > 10) return newHistory.slice(newHistory.length - 10);
        return newHistory;
      });
    }

    const newSource: SearchSource = {
      type: "similar",
      similarTo: sourceResult.title,
    };
    setSearchSource(newSource);

    setIsScanning(true);
    setResults([]);

    pendingResultsRef.current = [
      { id: `s1-${Date.now()}`, title: `Similar: ${sourceResult.title} Variant A`, score: 94, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", bpm: sourceResult.bpm ? sourceResult.bpm + 2 : 90, tags: sourceResult.tags, year: 1975 },
      { id: `s2-${Date.now()}`, title: "Deep Cut - Rare Groove Find", score: 87, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", bpm: 98, tags: ["Rare", "Groove"], year: 1969 },
      { id: `s3-${Date.now()}`, title: "Underground Sample Pack B-Side", score: 79, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", bpm: 88, tags: ["Underground", "B-Side"], year: 1977 },
      { id: `s4-${Date.now()}`, title: "Forgotten Session Tape #12", score: 73, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", bpm: 102, tags: ["Session", "Tape"], year: 1981 },
      { id: `s5-${Date.now()}`, title: "Lo-fi Gem - Basement Recording", score: 68, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", bpm: 76, tags: ["Lo-fi", "Basement"], year: 2003 },
    ];
  };

  const handleBack = () => {
    if (resultHistory.length === 0) return;
    const prev = resultHistory[resultHistory.length - 1];
    setSearchSource(prev.source);
    setResults(prev.results);
    setResultHistory(current => current.slice(0, current.length - 1));
  };

  const MAX_HISTORY_ITEMS = 6;
  const searchHistoryKey = user ? `obi_search_history_${user.id}` : "obi_search_history_guest";

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(searchHistoryKey);
      if (!raw) {
        setSearchHistory([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setSearchHistory(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
    } catch {
      setSearchHistory([]);
    }
  }, [searchHistoryKey]);

  const persistSearchHistory = useCallback((items: string[]) => {
    setSearchHistory(items);
    try {
      localStorage.setItem(searchHistoryKey, JSON.stringify(items));
    } catch {}
  }, [searchHistoryKey]);

  const saveSearchToHistory = useCallback((rawQuery: string) => {
    const normalized = rawQuery.trim();
    if (!normalized) return;
    const next = [
      normalized,
      ...searchHistory.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, MAX_HISTORY_ITEMS);
    persistSearchHistory(next);
  }, [searchHistory, persistSearchHistory]);

  const removeHistoryItem = useCallback((itemToRemove: string) => {
    const next = searchHistory.filter((item) => item !== itemToRemove);
    persistSearchHistory(next);
  }, [searchHistory, persistSearchHistory]);

  const clearSearchHistory = useCallback(() => {
    persistSearchHistory([]);
  }, [persistSearchHistory]);

  const closeSearchUi = useCallback(() => {
    setIsFocused(false);
    setIsUtilityPanelOpen(false);
  }, []);

  const filteredHistory = query.trim()
    ? searchHistory.filter((item) =>
        item.toLowerCase().includes(query.trim().toLowerCase())
      )
    : searchHistory;

  // History dropdown: show when focused, NOT in utility/file/recording mode, and has history
  const showHistoryDropdown =
    isFocused &&
    !isUtilityPanelOpen &&
    !isRecording &&
    !file &&
    filteredHistory.length > 0;

  // Expanded utility panel: ONLY open when explicitly in utility mode (file loaded, recording, or panel toggled)
  const showExpandedPanel = isUtilityPanelOpen || isRecording || !!file;

  // Backdrop: show when utility panel is open
  const showBackdrop = isFocused && showExpandedPanel;

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
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (file && results.length === 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [file, results.length]);

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

  // Close history on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-container]")) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "m4a" : "webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const recordedFile = new File([audioBlob], `recording.${extension}`, { type: mimeType });
        setFile(recordedFile);
        setIsFocused(true);
        setCurrentMode("mic");
        setIsUtilityPanelOpen(true);
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
      setIsFocused(true);
      setCurrentMode("upload");
      setIsUtilityPanelOpen(true);
    }
  };

  const pendingResultsRef = useRef<SearchResult[]>([]);

  const handleSearch = async (queryOverride?: string) => {
    const normalizedQuery = (queryOverride ?? query).trim();

    if (!file && !normalizedQuery) {
      setError("Please type a query or upload an audio file to search.");
      return;
    }

    setSearchSource({
      type: file ? "upload" : "text",
      query: normalizedQuery || undefined,
      fileName: file?.name,
    });
    setResultHistory([]);

    setIsScanning(true);
    setError("");
    setResults([]);
    closeSearchUi();

    if (normalizedQuery) {
      setQuery(normalizedQuery);
      saveSearchToHistory(normalizedQuery);
    }

    try {
      const formData = new FormData();
      if (query) formData.append("query", query);
      if (file) formData.append("audio", file);
      formData.append("dust", String(filters.dust));
      formData.append("warmth", String(filters.warmth));
      formData.append("crunch", String(filters.crunch));

      const uploadRes = await fetch("http://localhost:8000/search/?top_k=5", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Backend search ingestion rejected the file!");
      const pipelineData = await uploadRes.json();
      
      const realResults = [];
      for (const neighbor of pipelineData.nearest_neighbors || []) {
        const metaRes = await fetch(`http://localhost:8000/search/results/${neighbor.id}`);
        if(metaRes.ok) {
           const meta = await metaRes.json();
           realResults.push({
             id: meta.id,
             title: meta.filename || "Unknown Title",
             score: Math.round(neighbor.score),
             url: meta.path?.includes("http") ? meta.path : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
             bpm: 120,
             tags: ["API", "LIVE", "SCHEMA"],
             year: 2026
           });
        }
      }
      
      pendingResultsRef.current = realResults.length > 0 ? realResults : [
        { id: "fallback", title: "API Empty", score: 0, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
      ];
    } catch (err) {
      console.warn("Backend not reachable. Serving dummy results...", err);
      pendingResultsRef.current = [
        { id: "dummy-1", title: "Lo-Fi Hip Hop Drum Loop", score: 98, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", bpm: 85, tags: ["Drums", "Lo-Fi", "Vintage"], year: 2023 },
        { id: "dummy-2", title: "Atmospheric Synth Pad", score: 87, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", tags: ["Synth", "Ambient", "Dark"], year: 2021 },
        { id: "dummy-3", title: "Funky Bassline Groover", score: 76, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", bpm: 110, tags: ["Bass", "Funk", "Groove"] }
      ];
    }
  };

  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    closeSearchUi();
    setResults(pendingResultsRef.current);
  }, [closeSearchUi]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length === 0) return;

    const droppedFile = droppedFiles[0];
    const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg"];
    if (!validTypes.includes(droppedFile.type)) {
      setError("Please drop a .wav, .mp3, or audio file.");
      showToast("Invalid file type", "error");
      return;
    }

    setFile(droppedFile);
    setIsFocused(true);
    setCurrentMode("upload");
    showToast(`${droppedFile.name} loaded`, "success");
  };

  const ghostBtn: CSSProperties = { background: "none", border: "1px solid #2a2a2a", color: "#666", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", cursor: "pointer" };
  const goldBtn: CSSProperties = { backgroundColor: "#b8a96a", border: "none", color: "#0a0a0a", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", fontWeight: 600, cursor: "pointer" };

  const resultsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const resultCardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const modeVariants = {
    enter: (direction: number) => ({
      x: direction * 60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (direction: number) => ({
      x: direction * -60,
      opacity: 0,
      transition: { duration: 0.15 },
    }),
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="min-h-screen"
    >
      <ParticleCanvas isScanning={isScanning} />

      <AnimatePresence>
        {isScanning && <ScanningOverlay onComplete={handleScanComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[55] flex items-center justify-center"
            style={{
              background: "rgba(6,6,6,0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="flex flex-col items-center gap-4 p-12 rounded-2xl"
              style={{
                border: "2px dashed rgba(212,175,55,0.4)",
                background: "rgba(212,175,55,0.03)",
              }}
            >
              <Upload size={48} style={{ color: "var(--accent-dim)" }} />
              <span className="font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>
                Drop your audio here
              </span>
              <span className="font-data text-[10px] uppercase tracking-[3px]" style={{ color: "var(--text-tertiary)" }}>
                .wav, .mp3, or any audio file
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className="flex min-h-screen flex-col items-center justify-start px-6 md:px-12 relative max-w-[1400px] mx-auto"
        style={{
          paddingTop: hasResults ? 48 : "16vh",
          paddingBottom: 160,
          transition: "padding-top 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isScanning ? 0 : 1,
          transitionProperty: "padding-top, opacity",
          transitionDuration: "0.7s, 0.5s",
        }}
      >
        <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }} className="text-xs sm:text-sm">
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

        <div className="flex flex-col items-center justify-center text-center z-50 relative w-full max-w-3xl">
          <motion.h1
            className="font-display font-bold text-white mb-1 cursor-pointer"
            style={{
              fontSize: hasResults ? 32 : "clamp(48px, 10vw, 80px)",
              letterSpacing: hasResults ? "0.25em" : "0.35em",
              textShadow: "0 0 60px rgba(212,175,55,0.08)",
              transition: "font-size 0.7s cubic-bezier(0.4,0,0.2,1), letter-spacing 0.7s cubic-bezier(0.4,0,0.2,1)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsFocused(true)}
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

          {/* ── Search container ── */}
          <motion.div
            data-search-container
            className="relative w-full max-w-2xl mx-auto"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: isFocused ? "1px solid rgba(212,175,55,0.15)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: showExpandedPanel ? 14 : showHistoryDropdown ? "14px 14px 0 0" : 14,
              backdropFilter: "blur(12px)",
              transition: "border-color 0.3s ease, border-radius 0.2s ease",
              zIndex: 40,
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* ── Input row ── */}
            <div
              className="relative flex items-center cursor-pointer"
              style={{ padding: "14px 18px" }}
              onClick={() => {
                setIsFocused(true);
                // Don't open utility panel just from clicking the input row
              }}
            >
              <Search
                className="h-5 w-5 shrink-0 transition-colors duration-300"
                style={{ color: isFocused ? "var(--accent)" : "var(--text-tertiary)", opacity: isFocused ? 1 : 0.5 }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                  // Typing text should NOT open utility panel
                  if (!file && !isRecording) setIsUtilityPanelOpen(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && hasInput && handleSearch()}
                onFocus={() => {
                  setIsFocused(true);
                  if (!file && !isRecording) setIsUtilityPanelOpen(false);
                }}
                disabled={isRecording || !!file}
                autoFocus={typeof window !== 'undefined' && !('ontouchstart' in window)}
                className="flex-1 bg-transparent pl-3 pr-2 outline-none font-display text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "var(--text-primary)" }}
                placeholder={isRecording ? "Recording in progress…" : file ? "Audio file loaded" : "Describe a sound or vibe…"}
              />
              <div className="flex items-center gap-1">
                {query && !isRecording && !file && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuery("");
                    }}
                    className="p-1.5 rounded-md transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.15)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFocused(true);
                    setCurrentMode("upload");
                    setIsUtilityPanelOpen(true);
                    fileInputRef.current?.click();
                  }}
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsFocused(true);
                      setCurrentMode("mic");
                      setIsUtilityPanelOpen(true);
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
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

            {query.length >= 3 && !isFocused && (
              <div className="pb-3 w-full">
                <p
                  className="font-data text-[9px] uppercase tracking-[2px] text-center mt-0"
                  style={{ color: "rgba(255,255,255,0.1)" }}
                >
                  Press Enter to search
                </p>
              </div>
            )}

            {/* ── History dropdown — attached directly to the search bar ── */}
            <AnimatePresence>
              {showHistoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{
                    position: "fixed",
                    left: -1,
                    right: -1,
                    top: "100%",
                    zIndex: 50,
                    background: "#000000",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "0 0 14px 14px",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.03)",
                    overflow: "hidden",
                  }}
                >
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className="font-data text-[9px] uppercase"
                      style={{ letterSpacing: "2.5px", color: "var(--text-tertiary)" }}
                    >
                      Recent searches
                    </span>
                    {searchHistory.length > 0 && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearSearchHistory();
                        }}
                        className="font-data text-[9px] uppercase transition-colors hover:text-white"
                        style={{ letterSpacing: "2px", color: "var(--text-tertiary)" }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* History items — Google-style rows */}
                  <div className="py-1.5">
                    {filteredHistory.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearch(item);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <History
                            size={14}
                            style={{ color: "var(--text-tertiary)", flexShrink: 0, opacity: 0.6 }}
                          />
                          <span
                            className="truncate font-display text-[13px]"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item}
                          </span>
                        </button>

                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeHistoryItem(item);
                          }}
                          className="shrink-0 p-1 rounded-md transition-colors"
                          style={{ color: "var(--text-tertiary)", opacity: 0.5 }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
                          title="Remove search"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Expanded utility panel — ONLY when file/recording/utility explicitly open ── */}
            <AnimatePresence>
              {showExpandedPanel && (
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
                      {modes.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => switchMode(mode)}
                          className="relative px-3 py-1.5"
                        >
                          <span className={`font-data text-[9px] uppercase tracking-[3px] ${
                            currentMode === mode ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
                          }`}>
                            {mode}
                          </span>
                          {currentMode === mode && (
                            <motion.div
                              layoutId="mode-indicator"
                              className="absolute bottom-0 left-0 right-0 h-[1px]"
                              style={{ background: "var(--accent)" }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative overflow-hidden w-full min-h-[140px]">
                      <AnimatePresence mode="wait" custom={modeDirection}>
                        <motion.div
                          key={currentMode}
                          custom={modeDirection}
                          variants={modeVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="w-full flex flex-col items-center justify-center"
                          style={{ minHeight: "140px" }}
                        >
                          {currentMode === "text" && (
                            <div className="w-full h-full flex items-center justify-center py-6">
                              {!isRecording && !file && !query && (
                                <p className="font-display text-xs text-center font-medium tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                                  Paste a vibe, drop audio, or hold to record.
                                </p>
                              )}
                              {file && (
                                <p className="font-display text-xs text-center font-medium tracking-wide" style={{ color: "var(--accent)" }}>
                                  "{file.name}" is loaded. Switch to Upload to clear it.
                                </p>
                              )}
                              {isRecording && (
                                <p className="font-display text-xs text-center font-medium tracking-wide" style={{ color: "var(--accent)" }}>
                                  Recording in progress. Switch to Mic to stop.
                                </p>
                              )}
                            </div>
                          )}
                          
                          {currentMode === "upload" && (
                            <div className="w-full flex justify-center">
                              <div className="w-full max-w-[280px]">
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="group flex w-full flex-col items-center justify-center gap-1.5 py-7 px-4 rounded-[14px] transition-all duration-200"
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
                                
                                {file && filePreviewUrl && (
                                  <div className="w-full rounded-xl overflow-hidden mt-3" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
                                    <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                                      <span className="truncate max-w-[75%] text-sm font-medium flex items-center gap-2" style={{ color: "var(--accent)" }}>
                                        <Play size={12} className="fill-current shrink-0" />
                                        {file.name}
                                      </span>
                                      <button
                                        onClick={() => setFile(null)}
                                        className="font-data text-[9px] uppercase tracking-[2px] font-bold transition-all flex items-center gap-1.5 px-2.5 py-1 rounded flex-shrink-0"
                                        style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = "#ff6b6b";
                                          e.currentTarget.style.borderColor = "rgba(255,107,107,0.3)";
                                          e.currentTarget.style.background = "rgba(255,107,107,0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                        }}
                                      >
                                        <X size={10} />
                                        Clear File
                                      </button>
                                    </div>
                                    <div className="px-2 pb-2">
                                      <AudioPlayer track={{ id: "preview", title: file.name, url: filePreviewUrl, tags: ["Upload"] }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {currentMode === "mic" && (
                            <div className="w-full flex justify-center">
                              <div className="w-full max-w-[280px]">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (isRecording) {
                                      stopRecording();
                                    } else {
                                      startRecording();
                                    }
                                  }}
                                  className="group flex w-full flex-col items-center justify-center gap-1.5 py-7 px-4 rounded-[14px] transition-all duration-200"
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
                                        Click to record
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
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="audio/wav, audio/mpeg" className="hidden" />



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

          {!hasResults && !isFocused && !isScanning && (
            <ExampleSearches onSelect={(q) => {
              setQuery(q);
              handleSearch(q);
            }} />
          )}

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

        {isScanning && !hasResults && (
          <div className="w-full max-w-2xl flex flex-col gap-5 z-30 relative mt-10">
            <div
              className="flex items-center justify-between mb-2 pb-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <span className="font-data text-[10px] uppercase tracking-[3px]"
                style={{ color: "rgba(255,255,255,0.08)" }}>Results</span>
              <span className="font-data text-[10px] uppercase tracking-[3px]"
                style={{ color: "rgba(255,255,255,0.08)" }}>Match %</span>
            </div>
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {hasResults && (
            <motion.div
              className="w-full max-w-2xl flex flex-col gap-4 z-10 relative pb-20 mt-10"
              variants={resultsContainerVariants}
              initial="hidden"
              animate="visible"
              key={results.length > 0 ? results[0]?.id || "results" : "empty"}
            >
              <div className="flex flex-col gap-4 mb-2">
                {searchSource && (
                  <div className="flex items-center justify-between font-data text-[10px] uppercase mb-1" style={{ letterSpacing: "3px", color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-3">
                      {resultHistory.length > 0 && (
                        <button onClick={handleBack} className="flex items-center gap-1.5 transition-colors hover:text-white">
                          <ArrowLeft size={12} />
                          Back
                        </button>
                      )}
                      {resultHistory.length > 0 && (
                        <span className="opacity-60 flex items-center gap-2">
                           <span>/</span>
                           Depth: {resultHistory.length}
                        </span>
                      )}
                    </div>
                    <span>
                       {searchSource.type === "similar" ? `Similar to: ${searchSource.similarTo}` :
                        searchSource.type === "text" ? `Query: "${searchSource.query}"` :
                        searchSource.type === "upload" ? `File: ${searchSource.fileName}` : ""}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center justify-between mb-2 pb-2"
                  style={{ borderBottom: "1px solid var(--border-default)" }}
                >
                  <span
                    className="font-data text-[10px] uppercase tracking-[3px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Results
                  </span>

                  <button
                    onClick={() => setFiltersOpen(prev => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200"
                    style={{
                      color: (filters.dust > 0 || filters.warmth > 0 || filters.crunch > 0)
                        ? "var(--accent)"
                        : "var(--text-tertiary)",
                      background: filtersOpen ? "rgba(212,175,55,0.05)" : "transparent",
                      border: filtersOpen ? "1px solid rgba(212,175,55,0.12)" : "1px solid transparent",
                    }}
                  >
                    <SlidersHorizontal size={11} />
                    <span className="font-data text-[9px] uppercase tracking-[2px]">Filters</span>
                    {(filters.dust > 0 || filters.warmth > 0 || filters.crunch > 0) && (
                      <span className="w-1 h-1 rounded-full" style={{ background: "var(--accent)" }} />
                    )}
                  </button>

                  <span
                    className="font-data text-[10px] uppercase tracking-[3px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Match %
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex flex-col items-center gap-6 py-8 px-6 mb-6 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                        <VibeKnob label="Dust" value={filters.dust} onChange={(v) => handleFilterChange("dust", v)} />
                        <VibeKnob label="Warmth" value={filters.warmth} onChange={(v) => handleFilterChange("warmth", v)} />
                        <VibeKnob label="Crunch" value={filters.crunch} onChange={(v) => handleFilterChange("crunch", v)} />
                      </div>
                      {(filters.dust > 0 || filters.warmth > 0 || filters.crunch > 0) && (
                        <button
                          onClick={handleFilterReset}
                          className="flex items-center gap-1.5 font-data text-[9px] uppercase tracking-[3px] transition-colors duration-150"
                          style={{ color: "var(--text-tertiary)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                        >
                          <RotateCcw size={10} />
                          Reset
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {results.map((result, i) => (
                <motion.div
                  key={result.id || i}
                  variants={resultCardVariants}
                >
                  <div
                    className="group/card flex flex-col gap-2 rounded-[14px] relative transition-all duration-200"
                    style={{
                      padding: "20px 22px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                    }}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.12)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";

                    if (!isTouchDevice) startPreview(result.url);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";

                    stopPreview();
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
                    <MatchArc score={result.score} size={48} />
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

                  <AudioPlayer track={result} playlist={results} />

                  <div
                    className="flex items-center gap-4 pt-3 mt-1 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-200"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <button
                      onClick={() => handleFindSimilar(result)}
                      className="font-data text-[9px] uppercase flex items-center gap-1.5 transition-colors duration-150"
                      style={{ letterSpacing: "2px", color: "var(--text-tertiary)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                    >
                      <RefreshCw size={11} />
                      Find Similar
                    </button>

                    <button
                      onClick={() => {
                        if (!user) {
                          showToast("Sign in to save sounds", "error");
                          return;
                        }
                        saveSound({
                          title: result.title,
                          bpm: result.bpm,
                          tags: result.tags ?? [],
                          year: result.year,
                          matchPercent: result.score,
                        });
                        showToast("Sound saved", "success");
                      }}
                      className="font-data text-[9px] uppercase flex items-center gap-1.5 transition-colors duration-150"
                      style={{ letterSpacing: "2px", color: "var(--text-tertiary)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                    >
                      <Bookmark size={11} />
                      Save
                    </button>
                  </div>
                </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop — only for utility panel, not for history */}
        <AnimatePresence>
          {(showBackdrop) && (
            <motion.div
              className="fixed inset-0 z-20"
              style={{
                background: showHistoryDropdown ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.6)",
                backdropFilter: showHistoryDropdown ? "blur(2px)" : "blur(4px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSearchUi}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}