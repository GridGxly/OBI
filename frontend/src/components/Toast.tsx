"use client";

import { useToast, ToastType } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Toast() {
  const { toasts, dismissToast } = useToast();

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success": return "rgba(212,175,55,0.3)";
      case "error": return "rgba(255,80,80,0.3)";
      case "info": return "rgba(255,255,255,0.1)";
      default: return "rgba(255,255,255,0.1)";
    }
  };

  return (
    <div className="fixed z-[60] flex flex-col gap-2 pointer-events-none
      top-4 md:top-auto md:bottom-24 left-0 right-0 items-center px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            layout
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto flex items-center justify-between w-full max-w-sm min-w-[280px] rounded-lg overflow-hidden relative"
            style={{
              background: "rgba(20,20,20,0.95)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${getBorderColor(toast.type)}`,
            }}
          >
            <div
              className="w-[2px] h-full absolute left-0 top-0 bottom-0 shrink-0"
              style={{
                backgroundColor: getBorderColor(toast.type).replace("0.3)", "1)"),
              }}
            />
            <div className="flex-1 py-3 px-4 pl-5">
              <p className="font-display text-[13px] text-white/90 truncate m-0 leading-tight">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-3 opacity-50 hover:opacity-100 transition-opacity shrink-0 flex items-center justify-center text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
