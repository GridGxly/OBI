"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Music, Search, GitFork, Trash2, Play, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { SavedSound } from "@/types/auth";

type SortOption = "recent" | "match" | "bpm";

export default function ProfilePage() {
  const { user, isLoading, logout, removeSavedSound } = useAuth();
  const { loadTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(212,175,55,0.3)", borderTopColor: "transparent" }} />
          <span className="font-data text-[10px] uppercase tracking-[4px]" style={{ color: "var(--text-tertiary)" }}>
            Loading
          </span>
        </div>
      </main>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });


  const sortedSounds = [...user.savedSounds].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      case "match":
        return (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
      case "bpm":
        return (a.bpm ?? 0) - (b.bpm ?? 0);
      default:
        return 0;
    }
  });

  const handlePlaySound = (sound: SavedSound) => {
    // Create a track object compatible with PlayerContext
    // Note: saved sounds don't have URLs in the current mock implementation
    // When backend is connected, SavedSound should include a url field
    loadTrack({
      id: sound.id,
      title: sound.title,
      url: "", // Will be populated when backend provides real audio URLs
      bpm: sound.bpm,
      tags: sound.tags,
      year: sound.year,
      score: sound.matchPercent,
    });
  };

  const formatRelativeDate = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const totalSaved = user.savedSounds.length;
  const avgMatch = totalSaved > 0
    ? Math.round(user.savedSounds.reduce((sum, s) => sum + (s.matchPercent ?? 0), 0) / totalSaved)
    : 0;

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 sm:px-6 pb-32"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
  
      <div className="w-full max-w-2xl flex items-center justify-between py-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[3px] transition-colors duration-150"
          style={{ color: "var(--text-tertiary)", textDecoration: "none" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          <ArrowLeft size={14} />
          Search
        </Link>

        <Link
          href="/"
          className="font-display text-[18px] font-bold tracking-[0.3em]"
          style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", textShadow: "0 0 30px rgba(212,175,55,0.06)" }}
        >
          OBI
        </Link>

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[3px] transition-colors duration-150"
          style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,120,120,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          Sign Out
          <LogOut size={13} />
        </button>
      </div>

      <motion.div
        className="w-full max-w-2xl flex items-center gap-5 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 0 30px rgba(212,175,55,0.06)",
          }}
        >
          <span className="font-display text-[20px] font-bold" style={{ color: "var(--accent)" }}>
            {initials}
          </span>
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-[24px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
            {user.username}
          </h1>
          <p className="font-data text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {user.email}
          </p>
          <p className="font-data text-[9px] uppercase tracking-[3px] mt-1" style={{ color: "var(--text-tertiary)" }}>
            Member since {joinDate}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl grid grid-cols-3 gap-3 mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {[
          { value: totalSaved, label: "Saved", icon: Music },
          { value: avgMatch > 0 ? `${avgMatch}%` : "—", label: "Avg Match", icon: Search },
          { value: totalSaved > 0 ? user.savedSounds.filter(s => s.tags.length > 0).length : "—", label: "Tagged", icon: GitFork },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center py-5 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <stat.icon size={14} style={{ color: "var(--text-tertiary)", marginBottom: "8px" }} />
            <span className="font-data text-[22px] font-bold tabular-nums" style={{ color: i === 0 ? "var(--accent)" : "var(--text-primary)" }}>
              {stat.value}
            </span>
            <span className="font-data text-[9px] uppercase tracking-[3px] mt-1" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="font-data text-[10px] uppercase tracking-[3px]" style={{ color: "var(--text-tertiary)" }}>
              Your Crate
            </span>
            <span className="font-data text-[9px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {totalSaved} {totalSaved === 1 ? "sound" : "sounds"}
            </span>
          </div>

          {totalSaved > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-data text-[9px] uppercase tracking-[2px] transition-all duration-150"
                style={{
                  color: "var(--text-tertiary)",
                  background: showSortMenu ? "rgba(255,255,255,0.03)" : "transparent",
                  border: showSortMenu ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                }}
              >
                Sort: {sortBy === "recent" ? "Recent" : sortBy === "match" ? "Match %" : "BPM"}
                <ChevronDown size={10} style={{ transform: showSortMenu ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-10"
                    style={{
                      background: "rgba(18,18,18,0.95)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      minWidth: "120px",
                    }}
                  >
                    {([
                      { key: "recent" as SortOption, label: "Recent" },
                      { key: "match" as SortOption, label: "Match %" },
                      { key: "bpm" as SortOption, label: "BPM" },
                    ]).map((option) => (
                      <button
                        key={option.key}
                        onClick={() => { setSortBy(option.key); setShowSortMenu(false); }}
                        className="w-full text-left px-3 py-2 font-data text-[10px] uppercase tracking-[2px] transition-colors duration-100"
                        style={{
                          color: sortBy === option.key ? "var(--accent)" : "var(--text-secondary)",
                          background: sortBy === option.key ? "rgba(212,175,55,0.05)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (sortBy !== option.key) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (sortBy !== option.key) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {totalSaved === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-xl"
            style={{
              border: "1px dashed rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <Music size={32} style={{ color: "var(--text-tertiary)", marginBottom: "12px" }} />
            <p className="font-display text-[14px] mb-1" style={{ color: "var(--text-secondary)" }}>
              Your crate is empty
            </p>
            <p className="font-data text-[10px] uppercase tracking-[3px]" style={{ color: "var(--text-tertiary)" }}>
              Save sounds from search results to build your collection
            </p>
            <Link
              href="/"
              className="mt-6 px-5 py-2.5 rounded-lg font-data text-[10px] uppercase tracking-[3px] transition-all duration-200"
              style={{
                color: "var(--accent)",
                background: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.15)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.1)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.06)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
              }}
            >
              Start searching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSounds.map((sound, i) => (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200"
                style={{
                  background: currentTrack?.id === sound.id ? "rgba(212,175,55,0.04)" : "var(--bg-surface)",
                  border: currentTrack?.id === sound.id
                    ? "1px solid rgba(212,175,55,0.12)"
                    : "1px solid var(--border-default)",
                }}
                onMouseEnter={(e) => {
                  if (currentTrack?.id !== sound.id) {
                    e.currentTarget.style.background = "var(--bg-surface-hover)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTrack?.id !== sound.id) {
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }
                }}
              >
                <button
                  onClick={() => handlePlaySound(sound)}
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: currentTrack?.id === sound.id && isPlaying
                      ? "rgba(212,175,55,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: currentTrack?.id === sound.id && isPlaying
                      ? "1px solid rgba(212,175,55,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    color: currentTrack?.id === sound.id && isPlaying
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  <Play size={13} fill="currentColor" className="ml-0.5" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-[14px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {sound.title}
                  </p>
                  <div className="flex items-center gap-0 mt-0.5">
                    {sound.bpm && (
                      <span className="font-data text-[9px] font-bold" style={{ color: "var(--accent-dim)" }}>
                        {sound.bpm} BPM
                      </span>
                    )}
                    {sound.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="font-data text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                        <span className="mx-1" style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {sound.matchPercent && (
                  <div
                    className="shrink-0 px-2.5 py-1 rounded-lg"
                    style={{
                      background: sound.matchPercent >= 90
                        ? "rgba(212,175,55,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: sound.matchPercent >= 90
                        ? "1px solid rgba(212,175,55,0.15)"
                        : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      className="font-data text-[13px] font-bold tabular-nums"
                      style={{ color: sound.matchPercent >= 90 ? "var(--accent)" : "var(--text-secondary)" }}
                    >
                      {sound.matchPercent}
                      <span className="text-[8px]" style={{ color: "var(--text-tertiary)" }}>%</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-data text-[9px] hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>
                    {formatRelativeDate(sound.savedAt)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedSound(sound.id);
                    }}
                    className="p-1.5 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,120,120,0.7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                    title="Remove from crate"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {showSortMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </main>
  );
}