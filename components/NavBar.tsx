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
  const headerRef = useRef<HTMLElement>(null);
  const [navTop, setNavTop] = useState(56); // fallback ~56px

  // Compute header height for menu top
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setH = () => setNavTop(el.offsetHeight || 56);
    setH();
    const ro = new ResizeObserver(setH);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close menu on route change, restore scroll
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll lock while open
  useEffect(() => {
    if (open) {
      const { scrollY } = window;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      return () => {
        const y = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(y || "0") * -1);
      };
    }
  }, [open]);

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

  const linkBase =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/10";
  const active = "text-primary bg-primary/10 hover:bg-primary/15 dark:text-primary";

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-black/40"
      >
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
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Click-away overlay (under the panel) */}
      {open && (
        <button
          aria-hidden
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Fixed mobile panel (above overlay & content) */}
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 right-0 sm:hidden z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
        }`}
        style={{ top: navTop }}
      >
        <div className="container max-w-5xl mx-auto pb-3">
          <div className="rounded-2xl border bg-white/95 shadow-xl ring-1 ring-black/5 dark:bg-zinc-900/95 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-1 text-sm p-1">
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

              {/* Install & notifications */}
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
      </div>
    </>
  );
}
