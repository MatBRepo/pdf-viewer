"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, BellRing, Book, CheckCircle2, Plus, Smartphone, User } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null); // deferredPrompt
  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    // PWA installed?
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (window as any).navigator.standalone;
    setInstalled(!!isStandalone);

    // Install prompt capture
    const onBIP = (e: any) => {
      e.preventDefault();
      dp.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => { setInstalled(true); setCanInstall(false); dp.current = null; };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // Notifications support
    const hasNotif = typeof window !== 'undefined' && 'Notification' in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!dp.current) return;
    dp.current.prompt();
    const choice = await dp.current.userChoice.catch(() => null);
    if (choice?.outcome === 'accepted') { setCanInstall(false); }
  }

  async function enableNotifications() {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
    } catch (e) {
      // ignore
    }
  }

  const linkBase = "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition hover:bg-slate-100 active:scale-[0.98]";
  const active = "text-primary bg-primary/10 hover:bg-primary/15";

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur dark:bg-black/40">
      <div className="container max-w-5xl mx-auto py-3 flex items-center gap-3">
        <Link href="/" className="font-semibold tracking-tight no-underline">
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Entriso PDF Viewer</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/redeem" aria-label="Wykorzystaj kod" className={`${linkBase} group ${pathname==='/redeem'?active:''}`}>
            <Plus size={16} className="transition-transform group-hover:-translate-y-0.5"/>
            <span>Wykorzystaj kod</span>
          </Link>
          <Link href="/library" aria-label="Biblioteka" className={`${linkBase} group ${pathname==='/library'?active:''}`}>
            <Book size={16} className="transition-transform group-hover:-translate-y-0.5"/>
            <span>Biblioteka</span>
          </Link>
          <Link href="/account" aria-label="Konto" className={`${linkBase} group ${pathname==='/account'?active:''}`}>
            <User size={16} className="transition-transform group-hover:-translate-y-0.5"/>
            <span>Konto</span>
          </Link>

          {/* Install PWA */}
          {!installed && (
            canInstall ? (
              <button onClick={handleInstall} className={`${linkBase} group`} aria-label="Zainstaluj aplikację">
                <Smartphone size={16} className="transition-transform group-hover:-translate-y-0.5"/>
                <span>Zainstaluj</span>
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
                <Smartphone size={14}/>
                Zainstaluj z menu przeglądarki
              </span>
            )
          )}

          {/* Notifications */}
          {notifSupport && notifPerm === 'default' && (
            <button onClick={enableNotifications} className={`${linkBase}`} aria-label="Włącz powiadomienia">
              <Bell size={16}/>
              <span>Powiadomienia</span>
            </button>
          )}
          {notifSupport && notifPerm === 'granted' && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-600 px-2 py-1.5">
              <BellRing size={14}/>
              Włączone
            </span>
          )}
          {notifSupport && notifPerm === 'denied' && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
              <Bell size={14}/>
              Zablokowane
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
