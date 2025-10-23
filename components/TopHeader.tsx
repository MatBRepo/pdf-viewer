"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { Bell, BellRing, Book, Plus, Smartphone, User, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/assets/logo.svg"; // works as SVGR *or* static import depending on your setup

type TopHeaderProps = {
  /** Provide an Image src (static import object or string path) for the logo */
  logoSrc?: string | StaticImageData;
  /** Or provide a React SVG node (SVGR): e.g. <MyLogo className="h-7 w-7" /> */
  logoSvg?: ReactNode;
  /** Brand text shown next to the logo */
  brandName?: string;
};

export default function TopHeader({
  logoSrc,
  logoSvg,
  brandName = "entrisoViewer",
}: TopHeaderProps) {
  const pathname = usePathname();

  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const dp = useRef<any>(null);

  const [notifSupport, setNotifSupport] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!standalone);

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

    const hasNotif = "Notification" in window;
    setNotifSupport(hasNotif);
    if (hasNotif) setNotifPerm(Notification.permission);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function handleInstall() {
    if (dp.current?.prompt) {
      dp.current.prompt();
      await dp.current.userChoice.catch(() => null);
    } else {
      alert('Na tym urządzeniu użyj menu przeglądarki → „Dodaj do ekranu głównego”.');
    }
  }

  async function enableNotifications() {
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
    } catch {}
  }

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 border border-transparent whitespace-nowrap";
  const linkIdle =
    "text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/10 hover:border-slate-200/50 dark:hover:border-white/10";
  const linkActive = "text-primary bg-primary/10 hover:bg-primary/15 border-primary/20";

  /** Renders a default logo using the imported `Logo`:
   * - If SVGR is configured: `Logo` is a React component -> render <Logo />
   * - If Next static import: `Logo` is an object with `src` -> render <Image />
   * - If string path: render <Image />
   */
  function DefaultLogo() {
    const L: any = Logo;
    if (typeof L === "function") {
      // SVGR React component
      return <L className="h-7 w-7" aria-hidden />;
    }
    // Next static image import or string path
    return (
      <Image
        src={L as string | StaticImageData}
        alt="Logo"
        width={28}
        height={28}
        priority
        className="h-7 w-7 object-contain"
      />
    );
  }

  return (
    <motion.header
      className={`sticky top-0 z-[60] hidden sm:block transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/50 bg-white/90 backdrop-blur-xl shadow-sm dark:border-slate-800/50 dark:bg-slate-900/90"
          : "border-b border-slate-200/30 bg-white/80 backdrop-blur-lg dark:border-slate-800/30 dark:bg-slate-900/80"
      }`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      role="banner"
    >
      <div className="container mx-auto max-w-7xl py-3">
        <div className="flex items-center gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="group inline-flex items-center gap-1"
            aria-label="Przejdź na stronę główną"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="relative flex h-9  items-center justify-center rounded-xl"
            >
              {/* Priority: explicit prop -> image prop -> imported default */}
              {logoSvg ? (
                <span className="grid place-items-center text-primary" aria-hidden>
                  {logoSvg}
                </span>
              ) : logoSrc ? (
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={28}
                  height={28}
                  priority
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <DefaultLogo />
              )}

              {/* Soft glow */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-md"
                animate={{ opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 3.2, repeat: Infinity }}
              />
            </motion.div>

            <motion.span
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 }}
            >
              {brandName}
            </motion.span>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring" }}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-stone-200 to-stone-200 px-2 py-1 text-xs font-medium text-gray-900"
              aria-hidden
            >
              <Sparkles className="h-3 w-3" />
              PRO
            </motion.span>
          </Link>

          {/* Nav */}
          <nav className="ml-auto" aria-label="Główna nawigacja">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm"
            >
              <Link
                href="/redeem"
                className={`${linkBase} ${isActive("/redeem") ? linkActive : linkIdle}`}
                aria-current={isActive("/redeem") ? "page" : undefined}
              >
                <Plus size={16} className="shrink-0" />
                <span>Wykorzystaj kod</span>
              </Link>

              <Link
                href="/library"
                className={`${linkBase} ${isActive("/library") ? linkActive : linkIdle}`}
                aria-current={isActive("/library") ? "page" : undefined}
              >
                <Book size={16} className="shrink-0" />
                <span>Biblioteka</span>
              </Link>

              <Link
                href="/account"
                className={`${linkBase} ${isActive("/account") ? linkActive : linkIdle}`}
                aria-current={isActive("/account") ? "page" : undefined}
              >
                <User size={16} className="shrink-0" />
                <span>Konto</span>
              </Link>

              {/* Install PWA */}
              <AnimatePresence>
                {!installed && canInstall && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-white shadow-sm transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-md"
                    aria-label="Zainstaluj aplikację"
                  >
                    <Smartphone size={16} className="shrink-0" />
                    <span>Zainstaluj</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Install hint */}
              {!installed && !canInstall && (
                <motion.span
                  className="hidden items-center gap-1.5 rounded-lg bg-slate-100/60 px-2 py-1.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 lg:inline-flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <Smartphone size={14} />
                  <span>Dodaj do ekranu głównego</span>
                </motion.span>
              )}

              {/* Notifications ask */}
              <AnimatePresence>
                {notifSupport && notifPerm === "default" && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={enableNotifications}
                    className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-slate-700 transition-all duration-200 hover:border-slate-200/50 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10"
                    aria-label="Włącz powiadomienia"
                  >
                    <Bell size={16} className="shrink-0" />
                    <span className="hidden sm:inline">Powiadomienia</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Notifications enabled */}
              {notifSupport && notifPerm === "granted" && (
                <motion.span
                  className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 md:inline-flex"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  aria-label="Powiadomienia są włączone"
                >
                  <BellRing size={14} />
                  <span>Powiadomienia włączone</span>
                </motion.span>
              )}
            </motion.div>
          </nav>
        </div>
      </div>

      {/* Mobile install banner */}
      <AnimatePresence>
        {!installed && canInstall && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden border-t border-slate-200/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-slate-700/50 dark:from-green-900/20 dark:to-emerald-900/20"
            role="region"
            aria-label="Baner instalacyjny aplikacji"
          >
            <div className="container mx-auto max-w-7xl px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <span className="text-slate-700 dark:text-slate-300">Zainstaluj aplikację</span>
                </div>
                <button
                  onClick={handleInstall}
                  className="text-sm font-medium text-green-700 transition-colors hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
                >
                  Zainstaluj
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
