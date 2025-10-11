"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BellRing, Book, Plus, Smartphone, User, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export default function MobileTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // PWA install
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null);

  // Notifications
  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  // Install helper UIs
  const [showTip, setShowTip] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  useEffect(() => setMounted(true), []);

  // Always reserve space so content isn't covered
  useEffect(() => {
    const applyPadding = () => {
      const mobile = window.innerWidth < 640;
      document.body.style.paddingBottom = mobile ? "calc(64px + env(safe-area-inset-bottom, 0px))" : "";
    };
    applyPadding();
    window.addEventListener("resize", applyPadding);
    return () => window.removeEventListener("resize", applyPadding);
  }, []);

  useEffect(() => {
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!standalone);

    const onBIP = (e: any) => { e.preventDefault(); dp.current = e; setCanInstall(true); setShowTip(false); };
    const onInstalled = () => { setInstalled(true); setCanInstall(false); dp.current = null; setShowTip(false); setShowIOS(false); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const hasNotif = "Notification" in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    const dismissed = localStorage.getItem("entrisoInstallDismissed") === "1";
    const mobile = window.innerWidth < 640;
    if (!standalone && mobile && !dismissed) {
      if (isIOS) setShowIOS(true); else setShowTip(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isIOS]);

  async function handleInstall() {
    if (dp.current?.prompt) {
      dp.current.prompt();
      await dp.current.userChoice.catch(() => null);
    } else {
      // Fallback helpers
      if (isIOS) setShowIOS(true); else setShowTip(true);
    }
  }

  async function enableNotifications() {
    try { const p = await Notification.requestPermission(); setNotifPerm(p); } catch {}
  }

  const active = (href: string) => pathname === href;

  const bar = (
    <>
      {/* Bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[1000] border-t bg-white/90 backdrop-blur transform-none will-change-auto isolation-auto sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Nawigacja dolna"
      >
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-4 place-items-stretch px-2">
          <TabIcon href="/redeem" active={active("/redeem")} label="Kod"><Plus className="h-6 w-6" /></TabIcon>
          <TabIcon href="/library" active={active("/library")} label="Biblioteka"><Book className="h-6 w-6" /></TabIcon>
          <TabIcon href="/account" active={active("/account")} label="Konto"><User className="h-6 w-6" /></TabIcon>

          {!installed ? (
            <button
              onClick={handleInstall}
              className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-600 transition active:scale-[0.96] hover:bg-slate-100"
              aria-label="Zainstaluj aplikację" title="Zainstaluj aplikację"
            >
              <Smartphone className="h-6 w-6" />
              {canInstall && <Dot />}
            </button>
          ) : notifSupport ? (
            notifPerm === "default" ? (
              <button
                onClick={enableNotifications}
                className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-600 transition active:scale-[0.96] hover:bg-slate-100"
                aria-label="Włącz powiadomienia" title="Powiadomienia"
              >
                <Bell className="h-6 w-6" />
              </button>
            ) : notifPerm === "granted" ? (
              <div className="group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-emerald-600">
                <BellRing className="h-6 w-6" />
                <Dot />
              </div>
            ) : <div className="mx-1" />
          ) : <div className="mx-1" />}
        </div>
      </nav>

      {/* Android tip bubble */}
      {showTip && !installed && !isIOS && (
        <div className="fixed inset-x-0 bottom-[84px] z-[1001] flex justify-center sm:hidden">
          <div className="max-w-[92%] rounded-full bg-black/80 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
            Dotknij <b>⋮</b> i wybierz <b>„Zainstaluj aplikację”</b>.
            <button
              onClick={() => { setShowTip(false); localStorage.setItem("entrisoInstallDismissed", "1"); }}
              className="ml-2 rounded px-1 text-white/80 hover:text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* iOS help sheet */}
      {showIOS && !installed && isIOS && (
        <div className="fixed inset-0 z-[1002] sm:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => { setShowIOS(false); localStorage.setItem("entrisoInstallDismissed", "1"); }} aria-label="Zamknij" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t bg-white p-4 shadow-2xl">
            <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
            <h3 className="mt-3 text-base font-medium">Dodaj Entriso do ekranu głównego</h3>
            <p className="mt-1 text-sm text-slate-600">
              W Safari dotknij ikony Udostępnij ⤴︎, a następnie wybierz <b>„Dodaj do ekranu głównego”</b>.
            </p>
            <div className="mt-3 flex justify-end">
              <button onClick={() => { setShowIOS(false); localStorage.setItem("entrisoInstallDismissed", "1"); }} className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100">
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!mounted) return null;
  // Render OUTSIDE any transformed parents to keep position:fixed stable on iOS
  return createPortal(bar, document.body);
}

function TabIcon({ href, active, label, children }:{
  href: string; active: boolean; label: string; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group relative mx-1 inline-flex flex-col items-center justify-center rounded-xl px-2 py-1.5 transition active:scale-[0.96] ${
        active ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span className="sr-only">{label}</span>
      <div className="h-6 w-6">{children}</div>
      <span className={`absolute -top-1 h-1.5 w-1.5 rounded-full transition ${active ? "bg-primary opacity-100" : "opacity-0"}`} />
    </Link>
  );
}

function Dot() {
  return <span className="absolute -top-1 right-2 h-1.5 w-1.5 rounded-full bg-primary" />;
}
