"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("rt-enter");
    const id = setTimeout(() => el.classList.remove("rt-enter"), 360);
    return () => clearTimeout(id);
  }, [path]);

  return <div ref={ref} className="rt">{children}</div>;
}
