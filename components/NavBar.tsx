"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell, BellRing, Book, Plus, Smartphone, User, X,
} from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  // PWA / install
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null); // deferredPrompt

  // Notifications
  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  // Install helpers
  const [showTip, setShowTip] = useState(false);    // Android/Chrome fallback
  const [showIOS, setShowIOS] = useState(false);    // iOS sheet (no BIP)

  // --- detection helpers ---
  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  };
  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;

  // Reserve space for bottom bar so content isn’t covered
  useEffect(() => {
    const applyPadding = () => {
      const mobile = isMobile();
      document.body.style.paddingBottom = mobile
        ? "calc(64px + env(safe-area-inset-bottom, 0px))"
        : "";
    };
    applyPadding();
    window.addEventListener("resize", applyPadding);
    return () => window.removeEventListener("resize", applyPadding);
  }, []);

  // Init install + notifications
  useEffect(() => {
    // standalone?
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!standalone);

    // notifications support
    const hasNotif = "Notification" in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    // beforeinstallprompt
    const onBIP = (e: any) => {
      e.preventDefault();
      dp.current = e;
      setCanInstall(true);
      setShowTip(false); // we have a proper prompt
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      dp.current = null;
      setShowTip(false);
      setShowIOS(false);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // Fallback hints (only on mobile, if not installed)
    // - iOS: show sheet (no BIP exists)
    // - Android/others: show a one-time tip if BIP didn’t fire yet
    const dismissed = localStorage.getItem("entrisoInstallDismissed") === "1";
    if (!standalone && isMobile() && !dismissed) {
      if (isIOS()) setShowIOS(true);
      else setShowTip(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInstall() {
    if (dp.current?.prompt) {
      dp.current.prompt();
      const choice = await dp.current.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setCanInstall(false);
    } else {
      // If BIP not available: show platform-specific help
      if (isIOS()) setShowIOS(true);
      else setShowTip(true);
    }
  }

  async function enableNotifications() {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
    } catch {}
  }

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-[60] hidden border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-black/40 sm:block">
        <div className="container mx-auto max-w-5xl py-3 flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight no-underline">
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Entriso PDF Viewer
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 text-sm">
            <TopLink href="/redeem" active={isActive("/redeem")} icon={<Plus size={16} />}>Wykorzystaj kod</TopLink>
            <TopLink href="/library" active={isActive("/library")} icon={<Book size={16} />}>Biblioteka</TopLink>
            <TopLink href="/account" active={isActive("/account")} icon={<User size={16} />}>Konto</TopLink>

            {!installed && (
              canInstall ? (
                <button onClick={handleInstall} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Zainstaluj aplikację">
                  <Smartphone size={16} /><span>Zainstaluj</span>
                </button>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                  <Smartphone size={14} /> Zainstaluj z menu przeglądarki
                </span>
              )
            )}
            {notifSupport && notifPerm === "default" && (
              <button onClick={enableNotifications} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Włącz powiadomienia">
                <Bell size={16} /><span>Powiadomienia</span>
              </button>
            )}
            {notifSupport && notifPerm === "granted" && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 px-2 py-1.5">
                <BellRing size={14} /> Włączone
              </span>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar (true fixed, safe-area aware) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[70] sm:hidden border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur transform-none will-change-auto isolation-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Nawigacja dolna"
      >
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-4 place-items-stretch px-2">
          <TabIcon href="/redeem" active={isActive("/redeem")} label="Kod"><Plus className="h-6 w-6" /></TabIcon>
          <TabIcon href="/library" active={isActive("/library")} label="Biblioteka"><Book className="h-6 w-6" /></TabIcon>
          <TabIcon href="/account" active={isActive("/account")} label="Konto"><User className="h-6 w-6" /></TabIcon>

          {/* Install / Notifications */}
          {!installed ? (
            <button
              onClick={handleInstall}
              className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-600 transition active:scale-[0.96] hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Zainstaluj aplikację"
              title="Zainstaluj aplikację"
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
              <div className="mx-1" />
            )
          ) : (
            <div className="mx-1" />
          )}
        </div>
      </nav>

      {/* ANDROID/CHROME TIP (if BIP didn't fire) */}
      {showTip && !installed && !isIOS() && (
        <Toast onClose={() => { setShowTip(false); localStorage.setItem("entrisoInstallDismissed", "1"); }}>
          Dotknij <b>⋮</b> w przeglądarce i wybierz <b>„Zainstaluj aplikację”</b>.
        </Toast>
      )}

      {/* iOS SHEET (Safari has no BIP) */}
      {showIOS && !installed && isIOS() && (
        <IOSInstallSheet onClose={() => { setShowIOS(false); localStorage.setItem("entrisoInstallDismissed", "1"); }} />
      )}
    </>
  );
}

/* ---------- Pieces ---------- */

function TopLink({ href, active, icon, children }:{
  href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/10 ${
        active ? "text-primary bg-primary/10 hover:bg-primary/15 dark:text-primary" : ""
      }`}
    >
      <span className="transition-transform group-hover:-translate-y-0.5">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function TabIcon({
  href, active, label, children,
}: { href: string; active: boolean; label: string; children: React.ReactNode; }) {
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
      <span className={`absolute -top-1 h-1.5 w-1.5 rounded-full transition ${active ? "bg-primary opacity-100" : "opacity-0"}`} />
    </Link>
  );
}

function Dot({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className="absolute -top-1 right-2 h-1.5 w-1.5 rounded-full bg-primary" />;
}

function Toast({ children, onClose }:{ children: React.ReactNode; onClose: ()=>void; }) {
  return (
    <div className="fixed inset-x-0 bottom-[84px] z-[75] flex justify-center sm:hidden">
      <div className="max-w-[92%] rounded-full bg-black/80 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
        {children}
        <button onClick={onClose} className="ml-2 rounded px-1 text-white/80 hover:text-white">OK</button>
      </div>
    </div>
  );
}

function IOSInstallSheet({ onClose }:{ onClose: ()=>void; }) {
  return (
    <div className="fixed inset-0 z-[80] sm:hidden">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Zamknij" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t bg-white p-4 shadow-2xl">
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
        <h3 className="mt-3 text-base font-medium">Dodaj Entriso do ekranu głównego</h3>
        <p className="mt-1 text-sm text-slate-600">
          W Safari dotknij ikony <span aria-hidden>Udostępnij ⤴︎</span>, a następnie wybierz <b>„Dodaj do ekranu głównego”</b>.
        </p>
        <div className="mt-3 flex justify-end">
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100">Zamknij</button>
        </div>
      </div>
    </div>
  );
}
