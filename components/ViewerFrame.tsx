"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Moon,
  Contrast,
  Notebook,
  Sun,
  Maximize2,
  RotateCcw,
} from "lucide-react";

type Mode = "default" | "dark" | "paper" | "low";

export default function ViewerFrame({
  src,
  watermarkText,
}: {
  src: string;
  watermarkText: string;
}) {
  const [mode, setMode] = useState<Mode>("default");
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLObjectElement>(null);
  const wmId = useId();

  // --- Side-effects: best-effort protection & UX ---
  useEffect(() => {
    // Hide during print
    const beforePrint = () => {
      if (containerRef.current) containerRef.current.style.display = "none";
      setTimeout(() => {
        if (containerRef.current) containerRef.current.style.display = "";
      }, 800);
    };
    window.addEventListener("beforeprint", beforePrint);

    // Block context menu and common save/print/view-source
    const onCtx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", onCtx, { capture: true });

    const onKeyBlock = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "p" || k === "u" || k === "o")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyBlock, { capture: true });

    // Only react when the TAB truly becomes hidden/visible
    const onVis = () => {
      const el = containerRef.current;
      if (!el) return;
      el.style.opacity = document.hidden ? "0" : "1";
      // ensure no blur is left behind
      el.style.filter = "";
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      document.removeEventListener("contextmenu", onCtx as any, { capture: true } as any);
      document.removeEventListener("keydown", onKeyBlock as any, { capture: true } as any);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Wheel zoom (Ctrl/⌘ + wheel)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        setScale((s) => clamp(s + delta, 0.5, 3));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  // Keyboard shortcuts (not when typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.getAttribute("contenteditable") === "true");
      if (typing) return;

      const k = e.key.toLowerCase();
      if ((k === "+" || k === "=") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); zoomIn();
      } else if ((k === "-" || k === "_") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); zoomOut();
      } else if (k === "0" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); resetZoom();
      } else if (k === "f") {
        e.preventDefault(); toggleFullscreen();
      } else if (k === "d") {
        e.preventDefault(); setMode("dark");
      } else if (k === "p") {
        e.preventDefault(); setMode("paper");
      } else if (k === "l") {
        e.preventDefault(); setMode("low");
      } else if (k === "escape") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Clear any filter when interacting with the viewer
  const clearFilter = () => {
    if (containerRef.current) containerRef.current.style.filter = "";
  };

  function zoomIn()  { setScale((s) => clamp(s + 0.1, 0.5, 3)); }
  function zoomOut() { setScale((s) => clamp(s - 0.1, 0.5, 3)); }
  function resetZoom(){ setScale(1); }
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await contentRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }

  const modeClass =
    {
      default: "bg-slate-50",
      dark: "bg-black [filter:invert(0.92)_hue-rotate(180deg)]",
      paper: "bg-[#f6f3ea] [filter:contrast(1.02)_saturate(1.02)]",
      low: "[filter:contrast(0.85)_brightness(1.08)] bg-slate-50",
    }[mode] || "bg-slate-50";

  const scalePct = useMemo(() => Math.round(scale * 100), [scale]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-black/40">
        <div className="container flex items-center gap-2 py-2">
          <div className="font-medium">Czytnik</div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant={mode === "default" ? "default" : "outline"} onClick={() => setMode("default")} title="Domyślny (D)" aria-label="Tryb domyślny">
              <Sun size={16} />
            </Button>
            <Button variant={mode === "dark" ? "default" : "outline"} onClick={() => setMode("dark")} title="Ciemny (D)" aria-label="Tryb ciemny">
              <Moon size={16} />
            </Button>
            <Button variant={mode === "paper" ? "default" : "outline"} onClick={() => setMode("paper")} title="Papier (P)" aria-label="Tryb papier">
              <Notebook size={16} />
            </Button>
            <Button variant={mode === "low" ? "default" : "outline"} onClick={() => setMode("low")} title="Niski kontrast (L)" aria-label="Tryb niski kontrast">
              <Contrast size={16} />
            </Button>

            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

            <Button variant="outline" onClick={zoomOut} aria-label="Pomniejsz">
              <ZoomOut size={16} />
            </Button>
            <div className="w-12 text-center tabular-nums" aria-live="polite">
              {scalePct}%
            </div>
            <Button variant="outline" onClick={zoomIn} aria-label="Powiększ">
              <ZoomIn size={16} />
            </Button>
            <Button variant="outline" onClick={resetZoom} title="Reset (Ctrl/⌘ + 0)" aria-label="Reset powiększenia">
              <RotateCcw size={16} />
            </Button>

            <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

            <Button variant="outline" onClick={toggleFullscreen} aria-label="Pełny ekran (F)" title="Pełny ekran (F)">
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className={`relative flex-1 select-none ${modeClass}`}
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <div className="animate-pulse rounded-full bg-black/10 p-4 dark:bg-white/10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            </div>
          </div>
        )}

        {/* Watermark overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 [mix-blend-mode:multiply] dark:[mix-blend-mode:screen]"
          aria-hidden="true"
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id={`wm-${wmId}`}
                patternUnits="userSpaceOnUse"
                width="420"
                height="240"
                patternTransform="rotate(-22)"
              >
                <text x="20" y="120" fontSize="24" fontFamily="ui-sans-serif,system-ui">
                  {watermarkText}
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#wm-${wmId})`} />
          </svg>
        </div>

        {/* Optional top strip overlay to discourage built-in toolbar clicks */}
        <div
          className="pointer-events-auto absolute left-0 right-0 top-0 z-[5] h-10"
          aria-hidden
          onPointerDown={clearFilter}
          style={{ background: "transparent" }}
        />

        {/* Content area (scaled) */}
        <div ref={contentRef} className="container relative py-4" onPointerDown={clearFilter}>
          <div
            className="transition-transform"
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          >
            <object
              ref={objRef}
              data={src}
              type="application/pdf"
              className="h-[85vh] w-full"
              aria-label="Zabezpieczony dokument PDF"
              onLoad={() => setLoading(false)}
            >
              <p className="p-3 text-sm text-slate-600">
                Nie można wyświetlić PDF w tej przeglądarce.
              </p>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
}

/* utils */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
