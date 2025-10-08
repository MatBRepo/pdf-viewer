"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Moon, Contrast, Notebook, Sun } from "lucide-react";

type Mode = "default" | "dark" | "paper" | "low";

export default function ViewerFrame({ src, watermarkText }: { src: string; watermarkText: string; }) {
  const [mode, setMode] = useState<Mode>("default");
  const [scale, setScale] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beforePrint = () => {
      if (containerRef.current) containerRef.current.style.display = "none";
      setTimeout(() => { if (containerRef.current) containerRef.current.style.display = ""; }, 800);
    };
    window.addEventListener("beforeprint", beforePrint);
    return () => window.removeEventListener("beforeprint", beforePrint);
  }, []);

  useEffect(() => {
    const onCtx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", onCtx);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "u")) e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    const onBlur = () => {
      if (containerRef.current) containerRef.current.style.filter = "blur(6px)";
    };
    const onFocus = () => {
      if (containerRef.current) containerRef.current.style.filter = "";
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const modeClass = {
    default: "bg-slate-50",
    dark: "bg-black [filter:invert(0.92)_hue-rotate(180deg)]",
    paper: "bg-[#f9f7f2]",
    low: "[filter:contrast(0.85)_brightness(1.08)] bg-slate-50",
  }[mode];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container py-2 flex items-center gap-2">
          <div className="font-medium">Reader</div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={()=>setMode("default")} title="Default"><Sun size={16}/></Button>
            <Button variant="outline" onClick={()=>setMode("dark")} title="Dark"><Moon size={16}/></Button>
            <Button variant="outline" onClick={()=>setMode("paper")} title="Paper"><Notebook size={16}/></Button>
            <Button variant="outline" onClick={()=>setMode("low")} title="Low contrast"><Contrast size={16}/></Button>
            <Button variant="outline" onClick={()=>setScale(s=>Math.max(0.5, s-0.1))}><ZoomOut size={16}/></Button>
            <div className="w-10 text-center">{(scale*100)|0}%</div>
            <Button variant="outline" onClick={()=>setScale(s=>Math.min(3, s+0.1))}><ZoomIn size={16}/></Button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className={`flex-1 ${modeClass} select-none`} style={{ WebkitUserSelect: "none", userSelect: "none" }}>
        <div className="container py-6 relative">
          {/* Watermark overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="wm" patternUnits="userSpaceOnUse" width="420" height="240" patternTransform="rotate(-22)">
                  <text x="20" y="120" fontSize="24">{watermarkText}</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wm)"></rect>
            </svg>
          </div>

          <div style={{ transform:`scale(${scale})`, transformOrigin:"top center" }}>
            <object data={src} type="application/pdf" className="w-full h-[85vh]" aria-label="Secure PDF">
              <p>Cannot display PDF.</p>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
}
