"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Book, Plus, User } from "lucide-react";

export default function NavBar() {
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone;
    setInstalled(!!isStandalone);
  }, []);
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="container py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold">Entriso PDFs</Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <Link href="/redeem" className="inline-flex items-center gap-1 hover:underline"><Plus size={16}/> Redeem</Link>
          <Link href="/library" className="inline-flex items-center gap-1 hover:underline"><Book size={16}/> Library</Link>
          <Link href="/account" className="inline-flex items-center gap-1 hover:underline"><User size={16}/> Account</Link>
          {!installed && <span className="hidden sm:inline-flex items-center text-xs text-slate-500"><Bell size={14} className="mr-1"/>Install via browser menu</span>}
        </nav>
      </div>
    </header>
  );
}
