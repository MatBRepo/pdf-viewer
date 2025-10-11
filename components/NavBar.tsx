"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, BellRing, Book, CheckCircle2, Plus, Smartphone, User,
} from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  // PWA/install & notifications
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null); // deferredPrompt
  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  // ---------- Effects ----------
  useEffect(() => {
    // PWA installed?
    const isStandalone =
      (typeof window !== "undefined" &&
        ((window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
         (window as any).navigator?.standalone)) || false;
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

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Reserve space for bottom tab bar on mobile so content isn't covered
  useEffect(() => {
    const applyPadding = () => {
      const isMobile = window.innerWidth < 640; // Tailwind "sm"
      document.body.style.paddingBottom = isMobile
        ? "calc(64px + env(safe-area-inset-bottom, 0px))"
        : "";
    };
    applyPadding();
    window.addEventListener("resize", applyPadding);
    return () => window.removeEventListener("resize", applyPadding);
  }, []);

  async function handleInstall() {
    // Show native prompt if available; otherwise show a small hint
    if (dp.current?.prompt) {
      dp.current.prompt();
      const choice = await dp.current.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setCanInstall(false);
    } else {
      alert("Otwórz menu przeglądarki i wybierz „Dodaj do ekranu głównego”.");
    }
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

  // Helper for active route on tabs
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop header (hidden on mobile) */}
      <header className="sticky top-0 z-40 hidden border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-black/40 sm:block">
        <div className="container mx-auto max-w-5xl py-3 flex items-center gap-3">
          {/* Brand */}
          <Link href="/" className="font-semibold tracking-tight no-underline">
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Entriso PDF Viewer
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/redeem"
              aria-label="Wykorzystaj kod"
              className={`${linkBase} group ${isActive("/redeem") ? active : ""}`}
            >
              <Plus size={16} className="transition-transform group-hover:-translate-y-0.5" />
              <span>Wykorzystaj kod</span>
            </Link>
            <Link
              href="/library"
              aria-label="Biblioteka"
              className={`${linkBase} group ${isActive("/library") ? active : ""}`}
            >
              <Book size={16} className="transition-transform group-hover:-translate-y-0.5" />
              <span>Biblioteka</span>
            </Link>
            <Link
              href="/account"
              aria-label="Konto"
              className={`${linkBase} group ${isActive("/account") ? active : ""}`}
            >
              <User size={16} className="transition-transform group-hover:-translate-y-0.5" />
              <span>Konto</span>
            </Link>

            {/* Install & notifications helpers on desktop */}
            {!installed && (
              canInstall ? (
                <button onClick={handleInstall} className={`${linkBase}`} aria-label="Zainstaluj aplikację">
                  <Smartphone size={16} />
                  <span>Zainstaluj</span>
                </button>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                  <Smartphone size={14} /> Zainstaluj z menu przeglądarki
                </span>
              )
            )}
            {notifSupport && notifPerm === "default" && (
              <button onClick={enableNotifications} className={linkBase} aria-label="Włącz powiadomienia">
                <Bell size={16} />
                <span>Powiadomienia</span>
              </button>
            )}
            {notifSupport && notifPerm === "granted" && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 px-2 py-1.5">
                <BellRing size={14} /> Włączone
              </span>
            )}
            {notifSupport && notifPerm === "denied" && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                <Bell size={14} /> Zablokowane
              </span>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar (icons only, no logo, no hamburger) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-zinc-900/80 sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Nawigacja dolna"
      >
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-4 place-items-stretch px-2">
          {/* Redeem */}
          <TabIcon href="/redeem" active={isActive("/redeem")} label="Kod">
            <Plus className="h-6 w-6" />
          </TabIcon>

          {/* Library */}
          <TabIcon href="/library" active={isActive("/library")} label="Biblioteka">
            <Book className="h-6 w-6" />
          </TabIcon>

          {/* Account */}
          <TabIcon href="/account" active={isActive("/account")} label="Konto">
            <User className="h-6 w-6" />
          </TabIcon>

          {/* Install or Notifications */}
          {!installed ? (
            <button
              onClick={handleInstall}
              className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-600 transition active:scale-[0.96] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Zainstaluj aplikację"
              title="Zainstaluj"
            >
              <Smartphone className="h-6 w-6" />
              <Dot show={canInstall} />
            </button>
          ) : notifSupport ? (
            notifPerm === "default" ? (
              <button
                onClick={enableNotifications}
                className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-600 transition active:scale-[0.96] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Włącz powiadomienia"
                title="Powiadomienia"
              >
                <Bell className="h-6 w-6" />
              </button>
            ) : notifPerm === "granted" ? (
              <div
                className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-emerald-600 dark:text-emerald-500"
                aria-label="Powiadomienia włączone"
                title="Powiadomienia włączone"
              >
                <BellRing className="h-6 w-6" />
                <Dot show />
              </div>
            ) : (
              <div
                className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-400 dark:text-slate-600"
                aria-label="Powiadomienia zablokowane"
                title="Powiadomienia zablokowane"
              >
                <Bell className="h-6 w-6" />
              </div>
            )
          ) : (
            <div className="mx-1" />
          )}
        </div>
      </nav>
    </>
  );
}

/* --- Small helpers --- */

function TabIcon({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 transition active:scale-[0.96] ${
        active
          ? "text-primary bg-primary/10 hover:bg-primary/15"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
      }`}
    >
      <span className="sr-only">{label}</span>
      <div className="h-6 w-6">{children}</div>
      {/* Active indicator */}
      <span
        className={`absolute -top-1 h-1.5 w-1.5 rounded-full transition ${
          active ? "bg-primary opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );
}

function Dot({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className="absolute -top-1 right-2 h-1.5 w-1.5 rounded-full bg-primary" />;
}
