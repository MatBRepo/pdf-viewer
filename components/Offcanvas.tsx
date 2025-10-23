"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type OffcanvasProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  side?: "right" | "left";
  width?: number; // px
  children: React.ReactNode;
  titleId?: string; // for aria-labelledby
};

export default function Offcanvas({
  open,
  onOpenChange,
  side = "right",
  width = 560,
  children,
  titleId,
}: OffcanvasProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [portalEl] = useState(() => {
    if (typeof window === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("id", "offcanvas-root");
    return el;
  });

  // mount portal container
  useEffect(() => {
    setMounted(true);
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      try { document.body.removeChild(portalEl); } catch {}
    };
  }, [portalEl]);

  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!mounted || !portalEl) return null;

  const translateClass =
    side === "right"
      ? open ? "translate-x-0" : "translate-x-full"
      : open ? "translate-x-0" : "-translate-x-full";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999999999999999999] bg-black/40 transition-opacity duration-300
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        className={`fixed top-0 ${side === "right" ? "right-0" : "left-0"} z-[1001] h-full w-full max-w-[90vw] sm:max-w-[${width}px]
          transform bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 overflow-hidden`}
        style={{ maxWidth: width }}
      >
        <div
          className={`h-full w-full ${translateClass}`}
          style={{ willChange: "transform" }}
        >
          <div className="flex h-full flex-col">{children}</div>
        </div>
      </div>
    </>,
    portalEl
  );
}
