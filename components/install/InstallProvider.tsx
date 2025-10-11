"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type Ctx = {
  installed: boolean;
  canInstall: boolean;
  promptInstall: () => Promise<void>;
};

const InstallCtx = createContext<Ctx | null>(null);

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const bipRef = useRef<any>(null);
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window as any).navigator?.standalone;
    setInstalled(!!standalone);

    const onBIP = (e: any) => {
      e.preventDefault();
      bipRef.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      bipRef.current = null;
      setCanInstall(false);
      localStorage.setItem("entriso.installDismissed", "1");
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!bipRef.current?.prompt) return;
    bipRef.current.prompt();
    try {
      await bipRef.current.userChoice;
    } catch {}
  }

  const value = useMemo<Ctx>(() => ({ installed, canInstall, promptInstall }), [installed, canInstall]);

  return <InstallCtx.Provider value={value}>{children}</InstallCtx.Provider>;
}

export function useInstall() {
  const v = useContext(InstallCtx);
  if (!v) throw new Error("useInstall must be used within <InstallProvider>");
  return v;
}
