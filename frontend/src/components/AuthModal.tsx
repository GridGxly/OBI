"use client";

import { useState, FormEvent, CSSProperties } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  mode: "login" | "signup";
  onClose: () => void;
}

/**
 * Render an authentication modal for sign-in or account creation.
 *
 * The modal displays email and password fields for both modes, and additional
 * username/confirm-password fields when `mode` is `"signup"`. It validates
 * signup passwords (match and minimum length) before calling the auth API,
 * shows validation or external errors inside the modal, and closes via
 * `onClose` when the user dismisses the modal or when authentication succeeds.
 *
 * @param mode - Either `"login"` to show the sign-in form or `"signup"` to show the account creation form
 * @param onClose - Callback invoked to close the modal (called when the user dismisses the modal or after successful authentication)
 * @returns The JSX element for the authentication modal
 */
export default function AuthModal({ mode, onClose }: Props) {
  const { login, signUp, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (mode === "signup") {
      if (form.password !== form.confirmPassword) return setLocalError("Passwords don't match.");
      if (form.password.length < 8) return setLocalError("Password must be 8+ characters.");
      await signUp(form.email, form.username, form.password);
    } else {
      await login(form.email, form.password);
    }
    if (!error) onClose();
  };

  const displayError = localError ?? error;

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "2.5rem", width: "100%", maxWidth: "400px", fontFamily: "'Courier New', monospace" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ color: "#e8e0c8", fontSize: "0.8rem", letterSpacing: "0.15rem", margin: 0 }}>
            {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          {mode === "signup" && (
            <Field
              label="Username"
              name="username"
              type="text"
              value={form.username}
              onChange={(v) => setForm((f) => ({ ...f, username: v }))}
            />
          )}
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          />
          {mode === "signup" && (
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
            />
          )}

          {displayError && (
            <p style={{ color: "#c0392b", fontSize: "0.72rem", margin: 0, padding: "0.5rem 0.75rem", backgroundColor: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "4px" }}>
              {displayError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ marginTop: "0.25rem", backgroundColor: "#b8a96a", color: "#0a0a0a", border: "none", borderRadius: "6px", padding: "0.8rem", fontSize: "0.72rem", letterSpacing: "0.15rem", fontFamily: "inherit", fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Renders a labeled input field wired as a controlled component.
 *
 * @param label - Text label displayed above the input (rendered uppercase)
 * @param name - HTML `name` attribute for the input element
 * @param type - HTML `type` attribute for the input element (e.g., "text", "email", "password")
 * @param value - Current input value
 * @param onChange - Callback invoked with the updated input value
 * @returns A JSX element containing the label and a controlled input element
 */
function Field({ label, name, type, value, onChange }: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ color: "#666", fontSize: "0.68rem", letterSpacing: "0.12rem" }}>{label.toUpperCase()}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{ backgroundColor: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "0.7rem 0.9rem", color: "#e8e0c8", fontSize: "0.875rem", fontFamily: "inherit", outline: "none" }}
        onFocus={(e) => (e.target.style.borderColor = "#b8a96a")}
        onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
      />
    </div>
  );
}

const ghostBtn: CSSProperties = { background: "none", border: "1px solid #2a2a2a", color: "#666", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", cursor: "pointer" };
const goldBtn: CSSProperties = { backgroundColor: "#b8a96a", border: "none", color: "#0a0a0a", borderRadius: "6px", padding: "0.4rem 0.9rem", fontSize: "0.68rem", letterSpacing: "0.1rem", fontFamily: "inherit", fontWeight: 600, cursor: "pointer" };