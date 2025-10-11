"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BellRing, Book, Plus, Smartphone, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TopHeader() {
  const pathname = usePathname();

  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null);

  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!standalone);

    const onBIP = (e: any) => { e.preventDefault(); dp.current = e; setCanInstall(true); };
    const onInstalled = () => { setInstalled(true); setCanInstall(false); dp.current = null; };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const hasNotif = "Notification" in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (dp.current?.prompt) {
      dp.current.prompt();
      await dp.current.userChoice.catch(() => null);
    } else {
      alert("Na tym urządzeniu użyj menu przeglądarki → „Dodaj do ekranu głównego”.");
    }
  }

  async function enableNotifications() {
    try { const p = await Notification.requestPermission(); setNotifPerm(p); } catch {}
  }

  const isActive = (href: string) => pathname === href;
  const link = "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/10";
  const active = "text-primary bg-primary/10 hover:bg-primary/15";

  return (
    <header className="sticky top-0 z-[60] hidden border-b bg-white/80 backdrop-blur dark:bg-black/40 sm:block">
      <div className="container mx-auto max-w-5xl py-3 flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Entriso PDF Viewer
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/redeem" className={`${link} ${isActive("/redeem") ? active : ""}`}><Plus size={16}/>Wykorzystaj kod</Link>
          <Link href="/library" className={`${link} ${isActive("/library") ? active : ""}`}><Book size={16}/>Biblioteka</Link>
          <Link href="/account" className={`${link} ${isActive("/account") ? active : ""}`}><User size={16}/>Konto</Link>

          {!installed && (
            canInstall
              ? <button onClick={handleInstall} className={link}><Smartphone size={16}/>Zainstaluj</button>
              : <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                  <Smartphone size={14}/> Zainstaluj z menu przeglądarki
                </span>
          )}
          {notifSupport && notifPerm === "default" && (
            <button onClick={enableNotifications} className={link}><Bell size={16}/>Powiadomienia</button>
          )}
          {notifSupport && notifPerm === "granted" && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 px-2 py-1.5"><BellRing size={14}/>Włączone</span>
          )}
        </nav>
      </div>
    </header>
  );
}
