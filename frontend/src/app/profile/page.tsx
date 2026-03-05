"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SavedSound } from "@/types/auth";
import { CSSProperties } from "react";

export default function ProfilePage() {
  const { user, isLoading, logout, removeSavedSound } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#444", letterSpacing: "0.15rem", fontSize: "0.75rem" }}>LOADING...</p>
      </main>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main style={pageStyle}>

      {/* Nav */}
      <div style={{ width: "100%", maxWidth: "720px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <Link href="/" style={{ color: "#e8e0c8", textDecoration: "none", letterSpacing: "0.45rem", fontSize: "1.5rem", fontWeight: 400 }}>
          O B I
        </Link>
        <button onClick={logout} style={ghostBtn}>SIGN OUT</button>
      </div>

      {/* User info */}
      <div style={{ width: "100%", maxWidth: "720px", marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid #1e1e1e" }}>
        <p style={labelStyle}>PROFILE</p>
        <h1 style={{ color: "#e8e0c8", fontSize: "2rem", fontWeight: 400, margin: "0.25rem 0 0.4rem", letterSpacing: "0.05rem" }}>
          {user.username}
        </h1>
        <p style={{ color: "#555", fontSize: "0.75rem", margin: "0 0 2rem", letterSpacing: "0.05rem" }}>{user.email}</p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "2.5rem" }}>
          <div>
            <p style={labelStyle}>SAVED SOUNDS</p>
            <p style={statStyle}>{user.savedSounds.length}</p>
          </div>
          <div>
            <p style={labelStyle}>MEMBER SINCE</p>
            <p style={statStyle}>{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Saved sounds */}
      <div style={{ width: "100%", maxWidth: "720px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <p style={labelStyle}>SAVED SOUNDS</p>
          <p style={{ color: "#333", fontSize: "0.68rem", letterSpacing: "0.1rem", margin: 0 }}>
            {user.savedSounds.length} TRACK{user.savedSounds.length !== 1 ? "S" : ""}
          </p>
        </div>

        {user.savedSounds.length === 0 ? (
          <div style={{ border: "1px dashed #1e1e1e", borderRadius: "10px", padding: "3.5rem", textAlign: "center" }}>
            <p style={{ color: "#333", fontSize: "0.78rem", letterSpacing: "0.1rem", margin: 0 }}>
              No saved sounds yet.{" "}
              <Link href="/" style={{ color: "#b8a96a", textDecoration: "none" }}>Start scanning.</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {user.savedSounds.map((sound) => (
              <SoundCard key={sound.id} sound={sound} onRemove={() => removeSavedSound(sound.id)} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}

function SoundCard({ sound, onRemove }: { sound: SavedSound; onRemove: () => void }) {
  return (
    <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Match % badge — mirrors ResultsCard */}
          {sound.matchPercent && (
            <div style={{ backgroundColor: "#1a1800", border: "1px solid #b8a96a", borderRadius: "6px", padding: "0.3rem 0.6rem", minWidth: "3rem", textAlign: "center" }}>
              <span style={{ color: "#b8a96a", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05rem" }}>
                {sound.matchPercent}<span style={{ fontSize: "0.6rem" }}>%</span>
              </span>
            </div>
          )}
          <span style={{ color: "#e8e0c8", fontSize: "0.95rem", fontWeight: 500 }}>{sound.title}</span>
        </div>
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "0.9rem", padding: "0 0 0 1rem", lineHeight: 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c0392b")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
        >
          ✕
        </button>
      </div>

      {/* Tags row */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {sound.bpm && <span style={bpmTag}>{sound.bpm} BPM</span>}
        {sound.tags.map((tag) => <span key={tag} style={greyTag}>{tag.toUpperCase()}</span>)}
        {sound.year && <span style={greyTag}>{sound.year}</span>}
      </div>

      <p style={{ color: "#333", fontSize: "0.68rem", letterSpacing: "0.05rem", margin: 0 }}>
        Saved {new Date(sound.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}

// Styles
const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2.5rem 1.5rem",
  fontFamily: "'Courier New', Courier, monospace",
};

const labelStyle: CSSProperties = {
  color: "#555",
  fontSize: "0.68rem",
  letterSpacing: "0.15rem",
  margin: "0 0 0.4rem",
};

const statStyle: CSSProperties = {
  color: "#e8e0c8",
  fontSize: "1.4rem",
  fontWeight: 400,
  margin: 0,
  letterSpacing: "0.05rem",
};

const bpmTag: CSSProperties = {
  backgroundColor: "#b8a96a",
  color: "#0a0a0a",
  padding: "0.2rem 0.55rem",
  borderRadius: "4px",
  fontSize: "0.62rem",
  letterSpacing: "0.08rem",
  fontWeight: 700,
};

const greyTag: CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#666",
  padding: "0.2rem 0.55rem",
  borderRadius: "4px",
  fontSize: "0.62rem",
  letterSpacing: "0.08rem",
  fontWeight: 600,
};

const ghostBtn: CSSProperties = {
  background: "none",
  border: "1px solid #2a2a2a",
  color: "#666",
  borderRadius: "6px",
  padding: "0.4rem 0.9rem",
  fontSize: "0.68rem",
  letterSpacing: "0.1rem",
  fontFamily: "inherit",
  cursor: "pointer",
};