"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Music, Search, Layers, Trash2, Play, Pause, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { SavedSound } from "@/types/auth";

type SortOption = "recent" | "match";

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
      default:
        return 0;
    }
  });

  const handlePlaySound = (sound: SavedSound) => {
    if (currentTrack?.id === sound.id) {
      togglePlay();
      return;
    }
    loadTrack({
      id: sound.id,
      title: sound.title,
      url: "",
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
  const uniqueTags = new Set(user.savedSounds.flatMap(s => s.tags));

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <main
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: "140%",
          height: "70%",
          top: "-20%",
          background: "radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 55%)",
        }}
      />

      <div className="grain-overlay" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 pb-32">

        <div className="w-full max-w-2xl flex items-center justify-between py-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[3px] transition-colors duration-200"
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
            style={{
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              textShadow: "0 0 40px rgba(212,175,55,0.06)",
            }}
          >
            OBI
          </Link>

          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 font-data text-[10px] uppercase tracking-[3px] transition-colors duration-200"
            style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,120,120,0.7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            Sign Out
            <LogOut size={13} />
          </button>
        </div>

        <motion.div
          className="w-full max-w-2xl flex items-center gap-5 sm:gap-6 mb-10 mt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative"
              style={{
                background: "linear-gradient(145deg, rgba(212,175,55,0.12), rgba(212,175,55,0.03))",
                boxShadow: "0 0 40px rgba(212,175,55,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: "3px",
                  border: "1px solid rgba(212,175,55,0.08)",
                  borderRadius: "50%",
                }}
              />
              <span className="font-display text-[22px] font-bold tracking-wide" style={{ color: "var(--accent)" }}>
                {initials}
              </span>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
              style={{
                background: "var(--accent)",
                border: "2.5px solid var(--bg-primary)",
                boxShadow: "0 0 8px rgba(212,175,55,0.3)",
              }}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="font-display text-[26px] sm:text-[30px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {user.username}
            </h1>
            <p className="font-data text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {user.email}
            </p>
            <p className="font-data text-[9px] uppercase tracking-[3px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              Member since {joinDate}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-2xl grid grid-cols-3 gap-3 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
        >
          {[
            { value: totalSaved, label: "Saved", icon: Music, highlight: true },
            { value: avgMatch > 0 ? `${avgMatch}%` : "—", label: "Avg. Closeness", icon: Search, highlight: false },
            { value: uniqueTags.size > 0 ? uniqueTags.size : "—", label: "Genres", icon: Layers, highlight: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group/stat flex flex-col items-center py-5 sm:py-6 rounded-xl transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.035)";
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)" }}
              />
              <stat.icon size={14} style={{ color: "var(--text-tertiary)", marginBottom: "10px" }} />
              <span
                className="font-data text-[24px] sm:text-[28px] font-bold tabular-nums leading-none"
                style={{ color: stat.highlight ? "var(--accent)" : "var(--text-primary)" }}
              >
                {stat.value}
              </span>
              <span className="font-data text-[8px] sm:text-[9px] uppercase tracking-[3px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        <div className="w-full max-w-2xl mb-8">
          <div
            className="h-[1px] w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />
        </div>

        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="font-data text-[10px] uppercase tracking-[3px]" style={{ color: "var(--text-tertiary)" }}>
                Saved Sounds
              </span>
              <span
                className="font-data text-[9px] tabular-nums px-2 py-0.5 rounded-md"
                style={{ color: "var(--text-tertiary)", background: "rgba(255,255,255,0.03)" }}
              >
                {totalSaved} {totalSaved === 1 ? "sound" : "sounds"}
              </span>
            </div>

            {totalSaved > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-data text-[9px] uppercase tracking-[2px] transition-all duration-200"
                  style={{
                    color: "var(--text-tertiary)",
                    background: showSortMenu ? "rgba(255,255,255,0.04)" : "transparent",
                    border: showSortMenu ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  }}
                >
                  Sort: {sortBy === "recent" ? "Recent" : "Closeness"}
                  <ChevronDown size={10} style={{ transform: showSortMenu ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
                </button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-10"
                      style={{
                        background: "rgba(14,14,14,0.95)",
                        backdropFilter: "blur(16px) saturate(1.2)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.03)",
                        minWidth: "130px",
                      }}
                    >
                      {([
                        { key: "recent" as SortOption, label: "Recent" },
                        { key: "match" as SortOption, label: "Closeness" },
                      ]).map((option) => (
                        <button
                          key={option.key}
                          onClick={() => { setSortBy(option.key); setShowSortMenu(false); }}
                          className="w-full text-left px-4 py-2.5 font-data text-[10px] uppercase tracking-[2px] transition-all duration-150"
                          style={{
                            color: sortBy === option.key ? "var(--accent)" : "var(--text-secondary)",
                            background: sortBy === option.key ? "rgba(212,175,55,0.06)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (sortBy !== option.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
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
              className="flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{
                border: "1px dashed rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.008)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: "rgba(212,175,55,0.04)",
                  border: "1px solid rgba(212,175,55,0.1)",
                }}
              >
                <Music size={24} style={{ color: "var(--accent-dim)" }} />
              </div>
              <p className="font-display text-[16px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                No saved sounds yet
              </p>
              <p className="font-data text-[10px] uppercase tracking-[3px] mb-8" style={{ color: "var(--text-tertiary)" }}>
                Save sounds from search results to build your collection
              </p>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl font-data text-[10px] uppercase tracking-[3px] transition-all duration-300"
                style={{
                  color: "var(--accent)",
                  background: "rgba(212,175,55,0.06)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.12)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(212,175,55,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.06)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Find something
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {sortedSounds.map((sound, i) => {
                const isActive = currentTrack?.id === sound.id;
                const isActivelyPlaying = isActive && isPlaying;

                return (
                  <motion.div
                    key={sound.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.35,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <div
                      className="group/card flex items-center gap-4 px-4 sm:px-5 py-4 rounded-[14px] relative transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.03)",
                        border: isActive
                          ? "1px solid rgba(212,175,55,0.2)"
                          : "1px solid rgba(255,255,255,0.08)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.045)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }}
                      />

                      <button
                        onClick={() => handlePlaySound(sound)}
                        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all duration-200"
                        style={{
                          background: isActivelyPlaying
                            ? "rgba(212,175,55,0.15)"
                            : "rgba(255,255,255,0.05)",
                          border: isActivelyPlaying
                            ? "1px solid rgba(212,175,55,0.35)"
                            : "1px solid rgba(255,255,255,0.1)",
                          color: isActivelyPlaying
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                          boxShadow: isActivelyPlaying ? "0 0 16px rgba(212,175,55,0.08)" : "none",
                        }}
                      >
                        {isActivelyPlaying ? (
                          <Pause size={13} fill="currentColor" />
                        ) : (
                          <Play size={13} fill="currentColor" className="ml-[2px]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className="font-display text-[14px] sm:text-[15px] font-semibold truncate leading-tight"
                          style={{ color: isActive ? "var(--accent)" : "var(--text-primary)" }}
                        >
                          {sound.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {sound.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="font-data text-[9px] uppercase px-1.5 py-0.5 rounded"
                              style={{
                                letterSpacing: "1px",
                                color: "var(--text-secondary)",
                                background: "rgba(255,255,255,0.05)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {sound.year && (
                            <span className="font-data text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                              {sound.year}
                            </span>
                          )}
                        </div>
                      </div>

                      {sound.matchPercent && (
                        <div
                          className="shrink-0 px-3 py-1.5 rounded-[10px]"
                          style={{
                            background: sound.matchPercent >= 90
                              ? "rgba(212,175,55,0.08)"
                              : "rgba(255,255,255,0.02)",
                            border: sound.matchPercent >= 90
                              ? "1px solid rgba(212,175,55,0.2)"
                              : "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <span
                            className="font-data text-[15px] font-extrabold tabular-nums leading-none"
                            style={{ color: sound.matchPercent >= 90 ? "var(--accent)" : "var(--text-secondary)" }}
                          >
                            {sound.matchPercent}
                            <span className="text-[8px] ml-[1px]" style={{ color: "var(--text-tertiary)" }}>%</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-data text-[9px] hidden sm:inline tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                          {formatRelativeDate(sound.savedAt)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedSound(sound.id);
                          }}
                          className="p-1.5 rounded-md opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-all duration-200"
                          style={{ color: "var(--text-tertiary)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,120,120,0.8)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                          title="Remove from saved"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {showSortMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </main>
  );
}