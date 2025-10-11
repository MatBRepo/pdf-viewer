"use client";
import { useEffect, useRef, useState } from "react";
import { Smartphone, X } from "lucide-react";

export default function InstallPrompt() {
  const dp = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    const isStandalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!isStandalone);

    const dismissed = localStorage.getItem("installDismissed") === "1";
    if (dismissed || isStandalone) return;

    function onBIP(e: any) {
      e.preventDefault();
      dp.current = e;
      // Show only on mobile widths
      if (window.innerWidth <= 768) setVisible(true);
    }
    function onInstalled() {
      setInstalled(true);
      setVisible(false);
      dp.current = null;
    }

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS: show tip (no prompt available)
    if (ios && window.innerWidth <= 820 && !isStandalone) {
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !visible) return null;

  const onInstall = async () => {
    if (dp.current?.prompt) {
      dp.current.prompt();
      const choice = await dp.current.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setVisible(false);
    }
  };
  const onDismiss = () => {
    setVisible(false);
    localStorage.setItem("installDismissed", "1");
  };

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3">
      <div className="w-full max-w-md rounded-2xl border bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-sm">
            <div className="font-medium">
              {isIOS ? "Dodaj Entriso do ekranu głównego" : "Zainstaluj Entriso"}
            </div>
            {isIOS ? (
              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                Otwórz w Safari → udostępnij <span aria-hidden>⤴︎</span> → <b>„Dodaj do ekranu głównego”</b>.
              </p>
            ) : (
              <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                Zainstaluj aplikację na telefonie dla szybszego dostępu i trybu pełnoekranowego.
              </p>
            )}
            {!isIOS && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={onInstall}
                  className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-white hover:opacity-95"
                >
                  Zainstaluj
                </button>
                <button onClick={onDismiss} className="rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10">
                  Nie teraz
                </button>
              </div>
            )}
          </div>
          <button onClick={onDismiss} aria-label="Zamknij" className="ml-auto rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
