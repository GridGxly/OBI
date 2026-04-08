"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  mode: "login" | "signup";
  onClose: () => void;
}

export default function AuthModal({ mode: initialMode, onClose }: Props) {
  const { login, signUp, isLoading, error } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  useEffect(() => {
    setLocalError(null);
    setFieldErrors({});
    setForm({ email: "", username: "", password: "", confirmPassword: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email";
    }

    if (mode === "signup" && !form.username) {
      errors.username = "Username is required";
    } else if (mode === "signup" && form.username.length < 3) {
      errors.username = "At least 3 characters";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "At least 8 characters";
    }

    if (mode === "signup") {
      if (!form.confirmPassword) {
        errors.confirmPassword = "Confirm your password";
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(form.email, form.username, form.password);
      } else {
        await login(form.email, form.password);
      }
      setSuccessFlash(true);
      setTimeout(() => onClose(), 400);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError ?? error;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{
          opacity: successFlash ? 0 : 1,
          y: 0,
          scale: successFlash ? 0.95 : 1,
        }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth: "380px",
          background: "linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 120px rgba(212,175,55,0.03)",
        }}
      >

        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 10%, rgba(212,175,55,0.3) 50%, transparent 90%)",
          }}
        />

        <div className="px-8 pt-8 pb-2">

          <div className="flex flex-col items-center mb-7">

            <div className="flex items-center gap-[3px] mb-4">
              {[0.35, 0.6, 0.9, 1, 0.7, 0.45, 0.3].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-[2.5px] rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{
                    height: [h * 10, h * 16, h * 10],
                  }}
                  transition={{
                    duration: 2.2,
                    delay: i * 0.12,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              ))}
            </div>

            <h2
              className="font-display text-[22px] font-bold tracking-[0.3em] text-white/90"
              style={{ textShadow: "0 0 30px rgba(212,175,55,0.08)" }}
            >
              OBI
            </h2>

            <p
              className="font-data text-[9px] uppercase tracking-[4px] mt-1.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {mode === "login" ? "Welcome back" : "Join the dig"}
            </p>
          </div>


          <div
            className="flex items-center rounded-lg p-[3px] mb-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-md font-data text-[10px] uppercase tracking-[3px] transition-all duration-200 relative"
                style={{
                  color: mode === m ? "var(--accent)" : "var(--text-tertiary)",
                  background: mode === m ? "rgba(212,175,55,0.08)" : "transparent",
                }}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
                {mode === m && (
                  <motion.div
                    layoutId="authTabIndicator"
                    className="absolute bottom-0 left-[20%] right-[20%] h-[1px]"
                    style={{ background: "rgba(212,175,55,0.4)" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>


        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: mode === "signup" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "signup" ? -20 : 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="px-8 pb-8"
          >
            <div className="flex flex-col gap-4">
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={(v) => {
                  setForm((f) => ({ ...f, email: v }));
                  if (fieldErrors.email)
                    setFieldErrors((e) => ({ ...e, email: "" }));
                }}
                error={fieldErrors.email}
                autoFocus
              />

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Field
                      label="Username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={(v) => {
                        setForm((f) => ({ ...f, username: v }));
                        if (fieldErrors.username)
                          setFieldErrors((e) => ({ ...e, username: "" }));
                      }}
                      error={fieldErrors.username}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(v) => {
                  setForm((f) => ({ ...f, password: v }));
                  if (fieldErrors.password)
                    setFieldErrors((e) => ({ ...e, password: "" }));
                }}
                error={fieldErrors.password}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.2)";
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Field
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(v) => {
                        setForm((f) => ({ ...f, confirmPassword: v }));
                        if (fieldErrors.confirmPassword)
                          setFieldErrors((e) => ({
                            ...e,
                            confirmPassword: "",
                          }));
                      }}
                      error={fieldErrors.confirmPassword}
                      trailing={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color =
                              "rgba(255,255,255,0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              "rgba(255,255,255,0.2)";
                          }}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            <AnimatePresence>
              {displayError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[12px] mt-4 px-3 py-2.5 rounded-lg overflow-hidden font-display"
                  style={{
                    color: "rgba(255,120,120,0.9)",
                    background: "rgba(255,50,50,0.06)",
                    border: "1px solid rgba(255,50,50,0.12)",
                  }}
                >
                  {displayError}
                </motion.p>
              )}
            </AnimatePresence>


            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-6 py-3.5 rounded-xl font-data text-[11px] font-bold uppercase tracking-[4px] transition-all duration-300 relative overflow-hidden group disabled:cursor-not-allowed"
              style={{
                background: isSubmitting
                  ? "rgba(212,175,55,0.15)"
                  : "linear-gradient(180deg, rgba(212,175,55,0.9) 0%, rgba(180,148,40,0.9) 100%)",
                color: isSubmitting ? "var(--accent)" : "#0a0a0a",
                border: "1px solid rgba(212,175,55,0.3)",
                boxShadow:
                  isSubmitting
                    ? "none"
                    : "0 4px 24px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting || isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </>
                )}
              </span>
            </button>


            <p
              className="text-center mt-5 font-display text-[12px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {mode === "login" ? (
                <>
                  New to OBI?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="transition-colors duration-150"
                    style={{ color: "var(--accent-dim)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--accent-dim)";
                    }}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="transition-colors duration-150"
                    style={{ color: "var(--accent-dim)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--accent-dim)";
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.form>
        </AnimatePresence>


        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-md transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.15)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.15)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  name,
  type,
  value,
  onChange,
  error,
  trailing,
  autoFocus,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  trailing?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="font-data text-[9px] uppercase tracking-[3px] transition-colors duration-200"
        style={{
          color: error
            ? "rgba(255,120,120,0.7)"
            : isFocused
              ? "var(--accent-dim)"
              : "var(--text-tertiary)",
        }}
      >
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          autoFocus={autoFocus}
          autoComplete={
            name === "password" || name === "confirmPassword"
              ? "new-password"
              : name
          }
          className="w-full font-display text-[14px] outline-none transition-all duration-200"
          style={{
            backgroundColor: isFocused
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.02)",
            border: error
              ? "1px solid rgba(255,80,80,0.3)"
              : isFocused
                ? "1px solid rgba(212,175,55,0.35)"
                : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: trailing ? "12px 40px 12px 14px" : "12px 14px",
            color: "rgba(255,255,255,0.9)",
            boxShadow: isFocused
              ? "0 0 0 3px rgba(212,175,55,0.06), 0 0 20px rgba(212,175,55,0.04)"
              : error
                ? "0 0 0 3px rgba(255,50,50,0.04)"
                : "none",
          }}
        />
        {trailing}
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="font-data text-[9px] tracking-[1px]"
            style={{ color: "rgba(255,120,120,0.8)" }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}