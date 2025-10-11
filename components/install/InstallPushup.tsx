"use client";
import { useEffect, useMemo, useState } from "react";
import { useInstall } from "./InstallProvider";
import { Smartphone, X } from "lucide-react";

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 640;
const isIOS = () =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

export default function InstallPushup() {
  const { installed, canInstall, promptInstall } = useInstall();
  const [visible, setVisible] = useState(false);

  const shouldShow = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (installed) return false;
    if (!isMobile()) return false;
    if (isIOS()) return false;           // iOS has no native in-app prompt – don’t show
    if (!canInstall) return false;       // show only when BIP captured (native prompt available)
    const dismissed = localStorage.getItem("entriso.installDismissed") === "1";
    return !dismissed;
  }, [installed, canInstall]);

  useEffect(() => {
    setVisible(shouldShow);
  }, [shouldShow]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[84px] z-[1100] sm:hidden flex justify-center px-3"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="dialog"
      aria-label="Zainstaluj aplikację"
    >
      <div className="w-full max-w-[560px] rounded-2xl bg-white/95 backdrop-blur shadow-2xl border p-3">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="text-sm leading-tight flex-1">
            <div className="font-medium">Zainstaluj Entriso</div>
            <div className="text-slate-600 mt-0.5">
              Dodaj aplikację do telefonu — szybki dostęp i pełny tryb offline dla interfejsu.
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={async () => {
                  await promptInstall();
                  // keep banner visible; Chrome will auto-dismiss after install or user cancels
                }}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-white text-sm active:scale-[0.98]"
              >
                Zainstaluj
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("entriso.installDismissed", "1");
                  setVisible(false);
                }}
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 active:scale-[0.98]"
              >
                <X className="mr-1 h-4 w-4" /> Później
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
