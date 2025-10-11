"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, BellRing, Book, CheckCircle2, Plus, Smartphone, User,
  Menu, X
} from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  // PWA/install & notifications
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null); // deferredPrompt
  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  // Mobile menu
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Close menu on route change
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    // PWA installed?
    const isStandalone =
      (typeof window !== "undefined" &&
        ((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
          (window as any).navigator?.standalone)) ||
      false;
    setInstalled(!!isStandalone);

    // Capture install prompt
    const onBIP = (e: any) => {
      e.preventDefault();
      dp.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      dp.current = null;
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // Notifications support
    const hasNotif = typeof window !== "undefined" && "Notification" in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    // ESC to close
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  async function handleInstall() {
    if (!dp.current) return;
    dp.current.prompt();
    const choice = await dp.current.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") setCanInstall(false);
  }

  async function enableNotifications() {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
    } catch {}
  }

  // Basic styles
  const linkBase =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/10";
  const active = "text-primary bg-primary/10 hover:bg-primary/15 dark:text-primary";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-black/40">
      <div className="container max-w-5xl mx-auto py-3 flex items-center gap-3">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-tight no-underline">
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Entriso PDF Viewer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden sm:flex items-center gap-1 text-sm">
          <Link
            href="/redeem"
            aria-label="Wykorzystaj kod"
            className={`${linkBase} group ${pathname === "/redeem" ? active : ""}`}
          >
            <Plus size={16} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Wykorzystaj kod</span>
          </Link>
          <Link
            href="/library"
            aria-label="Biblioteka"
            className={`${linkBase} group ${pathname === "/library" ? active : ""}`}
          >
            <Book size={16} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Biblioteka</span>
          </Link>
          <Link
            href="/account"
            aria-label="Konto"
            className={`${linkBase} group ${pathname === "/account" ? active : ""}`}
          >
            <User size={16} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Konto</span>
          </Link>

          {/* Install PWA */}
          {!installed &&
            (canInstall ? (
              <button
                onClick={handleInstall}
                className={`${linkBase} group`}
                aria-label="Zainstaluj aplikację"
              >
                <Smartphone size={16} className="transition-transform group-hover:-translate-y-0.5" />
                <span>Zainstaluj</span>
              </button>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                <Smartphone size={14} />
                Zainstaluj z menu przeglądarki
              </span>
            ))}

          {/* Notifications */}
          {notifSupport && notifPerm === "default" && (
            <button onClick={enableNotifications} className={linkBase} aria-label="Włącz powiadomienia">
              <Bell size={16} />
              <span>Powiadomienia</span>
            </button>
          )}
          {notifSupport && notifPerm === "granted" && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 px-2 py-1.5">
              <BellRing size={14} />
              Włączone
            </span>
          )}
          {notifSupport && notifPerm === "denied" && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
              <Bell size={14} />
              Zablokowane
            </span>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto sm:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/10"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown (collapsible) */}
      <div
        id="mobile-nav"
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container max-w-5xl mx-auto pb-3">
          <div className="grid grid-cols-1 gap-1 text-sm">
            <Link
              href="/redeem"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 ${
                pathname === "/redeem" ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Plus size={16} />
              <span>Wykorzystaj kod</span>
            </Link>
            <Link
              href="/library"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 ${
                pathname === "/library" ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Book size={16} />
              <span>Biblioteka</span>
            </Link>
            <Link
              href="/account"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 ${
                pathname === "/account" ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <User size={16} />
              <span>Konto</span>
            </Link>

            {/* Install & notifications as rows */}
            {!installed && canInstall && (
              <button
                onClick={handleInstall}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Smartphone size={16} />
                <span>Zainstaluj aplikację</span>
              </button>
            )}
            {notifSupport && notifPerm === "default" && (
              <button
                onClick={enableNotifications}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Bell size={16} />
                <span>Włącz powiadomienia</span>
              </button>
            )}
            {notifSupport && notifPerm === "granted" && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-emerald-600">
                <BellRing size={16} />
                <span>Powiadomienia włączone</span>
                <CheckCircle2 size={14} className="ml-auto" />
              </div>
            )}
            {notifSupport && notifPerm === "denied" && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500">
                <Bell size={16} />
                <span>Powiadomienia zablokowane</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click-away dimmer on mobile when menu open */}
      {open && (
        <button
          aria-hidden
          className="fixed inset-0 z-20 sm:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
