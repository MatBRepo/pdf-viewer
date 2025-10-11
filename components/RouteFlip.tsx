"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteFlip({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("is-turning");
    const id = setTimeout(() => el.classList.remove("is-turning"), 850);
    return () => clearTimeout(id);
  }, [path]);

  return (
    <div ref={ref} className="page-turn">
      {children}
    </div>
  );
}
