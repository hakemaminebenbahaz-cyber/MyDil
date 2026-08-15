"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; message: string; type: ToastType; }

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>");
  return ctx;
}

const ACCENT: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#4BAFD6",
};

const ICON: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 300,
        display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-in" style={{
            pointerEvents: "auto",
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 18px", borderRadius: 12, minWidth: 220, maxWidth: 340,
            background: "#0f172a", color: "#fff",
            fontSize: 13, fontWeight: 600, lineHeight: 1.4,
            boxShadow: "0 8px 24px rgba(15,23,42,0.28)",
            borderLeft: `3px solid ${ACCENT[t.type]}`,
          }}>
            <span style={{ color: ACCENT[t.type], fontWeight: 800, flexShrink: 0 }}>{ICON[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
