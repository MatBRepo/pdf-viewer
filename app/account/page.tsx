"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import {
  Mail,
  LogOut,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  Loader2,
  Plus,
  UserRound,
  ClipboardPaste,
  Copy,
  Library,
  Sparkles,
  Zap,
  Shield,
  FileKey,
} from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

/* ---------- Enhanced Background Components ---------- */
function AccountBackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#0f172a",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.06]"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(grainSVG)}')` }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.1), transparent 50%)",
        }}
      />
    </div>
  );
}

function AccountFloatingSpecks({ count = 10 }: { count?: number }) {
  const seeds = Array.from({ length: count }, (_, i) => i);
  const prefersReduced = useReducedMotion();
  
  if (prefersReduced) return null;
  
  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_6px_1px_rgba(139,92,246,0.3)]"
          style={{ left: `${(i * 79) % 100}%`, top: `${(i * 61) % 100}%` }}
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 7 + (i % 5), delay: (i % 8) * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function AccountShineButton({
  asChild,
  children,
  className = "",
  size,
  ...rest
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
  const Comp: any = Button as any;
  return (
    <Comp
      {...rest}
      size={size}
      className={
        "relative inline-flex overflow-hidden rounded-lg shadow-sm transition-[transform,box-shadow] hover:shadow-md active:translate-y-[1px] " +
        className
      }
    >
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
      <motion.span
        aria-hidden
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-white/25"
      />
    </Comp>
  );
}

/* ---------- Enhanced Status Components ---------- */
function EnhancedSuccessState({ message, onAction }: { message: string; onAction: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="mt-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-800 dark:from-emerald-900/20 dark:to-slate-900/40"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4" />
        </motion.div>
        <div className="flex-1">
          <div className="font-medium text-emerald-900 dark:text-emerald-100">Sukces</div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">{message}</p>
          <div className="mt-3">
            <AccountShineButton
              onClick={onAction}
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80"
            >
              <Library className="mr-2 h-4 w-4" />
              Otwórz bibliotekę
            </AccountShineButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EnhancedErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm dark:border-red-800 dark:from-red-900/20 dark:to-slate-900/40"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
        >
          <AlertTriangle className="h-4 w-4" />
        </motion.div>
        <div className="flex-1">
          <div className="font-medium text-red-900 dark:text-red-100">Nie udało się dodać kodu</div>
          <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- helpers ---------- */
function normalizeCode(raw: string) {
  return String(raw)
    .replace(/[\s\u00AD\u200B\u2060\uFEFF\u00B7\u2022\u2013\u2014]+/g, "")
    .replace(/[^A-Za-z0-9._-]/g, "");
}

function prettyCodeForDisplay(raw: string) {
  const cleaned = normalizeCode(raw).toUpperCase(); // visual only
  const parts = cleaned.split(".");
  const chunk = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
  return parts.length === 2 ? `${chunk(parts[0])}.${chunk(parts[1])}` : chunk(cleaned);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/* ---------- small motion variants ---------- */
const fadeUp = { 
  initial: { opacity: 0, y: 12 }, 
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const [email, setEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // Push
  const [subscribed, setSubscribed] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | null>(null);

  // Redeem
  const [code, setCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<Status>("idle");
  const [redeemMsg, setRedeemMsg] = useState("");
  const [justPasted, setJustPasted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const codePretty = useMemo(() => prettyCodeForDisplay(code), [code]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email || null);

      if (typeof window !== "undefined") {
        const remembered = localStorage.getItem("loginEmail");
        if (remembered && !user?.email) setLoginEmail(remembered);
      }

      // Push state
      const hasNotif = typeof window !== "undefined" && "Notification" in window;
      if (hasNotif) setNotifPerm(Notification.permission);
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      localStorage.setItem("loginEmail", loginEmail);
      toast.success("Sprawdź skrzynkę", { 
        description: "Wysłaliśmy link logowania na podany adres e-mail.",
        duration: 6000
      });
    } catch (err: any) {
      toast.error("Nie udało się wysłać linku", { 
        description: err?.message || "Spróbuj ponownie za chwilę.",
        duration: 5000
      });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    setEmail(null);
    setBusy(false);
    router.refresh();
    toast("Wylogowano pomyślnie", { duration: 3000 });
  }

  async function redeem() {
    const payload = normalizeCode(code);
    if (!payload) return;
    setRedeemStatus("loading");
    setRedeemMsg("");
    try {
      const res = await fetch("/api/ott/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: payload }),
      });
      const dj = await res.json();
      if (!res.ok) throw new Error(dj?.error || "Nie udało się dodać kodu.");
      setRedeemStatus("ok");
      setRedeemMsg(`Dodano źródło: ${dj?.source_label || "OK"}.`);
      setCode("");
      toast.success("Kod dodany pomyślnie", { 
        description: dj?.source_label || "Źródło zostało powiązane z kontem.",
        duration: 5000
      });
    } catch (e: any) {
      setRedeemStatus("error");
      setRedeemMsg(e?.message || "Błąd podczas dodawania kodu.");
      setShakeKey((k) => k + 1);
      toast.error("Błąd dodawania kodu", { 
        description: e?.message || "Sprawdź dane i spróbuj ponownie.",
        duration: 6000
      });
    }
  }

  async function subscribePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Brak wsparcia", { 
        description: "Powiadomienia push nie są wspierane w tej przeglądarce.",
        duration: 5000
      });
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("Zablokowane", { 
        description: "Włącz powiadomienia w ustawieniach przeglądarki.",
        duration: 6000
      });
      return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      toast.error("Konfiguracja", { 
        description: "Brak klucza VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY).",
        duration: 5000
      });
      return;
    }
    setBusy(true);
    try {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        setNotifPerm(perm);
        if (perm !== "granted") {
          setBusy(false);
          return;
        }
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setSubscribed(true);
      toast.success("Powiadomienia włączone", {
        description: "Otrzymasz powiadomienia o nowych aktualizacjach.",
        duration: 4000
      });
    } catch (e: any) {
      toast.error("Nie udało się włączyć powiadomień", { 
        description: e?.message || "Spróbuj ponownie za chwilę.",
        duration: 5000
      });
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setSubscribed(false);
    toast("Powiadomienia wyłączone", { 
      description: "Nie będziesz otrzymywać powiadomień push.",
      duration: 4000
    });
  }

  return (
    <main className="container relative py-8 min-h-screen">
      {/* Enhanced background */}
      <AccountBackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <AccountFloatingSpecks count={prefersReduced ? 0 : 14} />
        
        {/* Aurora effects */}
        <motion.div
          aria-hidden
          className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
          animate={prefersReduced ? undefined : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/" 
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Strona główna
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900 dark:text-slate-100 font-medium">
                Twoje konto
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      <motion.section
        {...fadeUp}
        className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="rounded-2xl bg-gradient-to-br from-primary to-violet-600 p-3 text-white shadow-lg"
          >
            <UserRound size={28} />
          </motion.div>
          <div className="grow">
            <motion.h1 
              className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Twoje konto
            </motion.h1>
            <motion.p 
              className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Zaloguj się magicznym linkiem (bez haseł). Po zalogowaniu możesz dodawać kody i zarządzać powiadomieniami.
            </motion.p>
          </div>
        </div>

        {/* NOT SIGNED IN */}
        {!email ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6"
          >
            <Card className="overflow-hidden border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Zaloguj / Załóż konto
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Wyślemy magiczny link na Twój adres e-mail
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={sendMagicLink} className="grid gap-3 sm:grid-cols-[1fr_auto] max-w-2xl">
                  <Input
                    id="loginEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="ty@przyklad.pl"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-12 text-base border-2 border-slate-300 bg-white/90 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/90"
                  />
                  <AccountShineButton 
                    disabled={busy} 
                    aria-busy={busy} 
                    className="h-12 inline-flex items-center gap-2 min-w-[160px]"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Wysyłanie…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Wyślij magiczny link
                      </>
                    )}
                  </AccountShineButton>
                </form>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nie masz konta? Zostanie utworzone automatycznie po kliknięciu linku.
                </p>

                {/* Enhanced Tips */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <motion.div 
                    className="rounded-2xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="rounded-lg bg-green-100 p-1.5 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Bezpieczne logowanie</div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Zero haseł. Link działa jednorazowo i tylko przez chwilę.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="rounded-2xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                        <FileKey className="h-4 w-4" />
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Dodawanie kodów</div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Po zalogowaniu wkleisz kod z e-maila, aby dodać swoje PDF-y.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* SIGNED IN */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 grid gap-6 lg:grid-cols-2"
          >
            {/* Redeem Card */}
            <Card className="overflow-hidden border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Dodaj kod dostępu
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Wklej kod z e-maila po zakupie
                      </p>
                    </div>
                  </div>
                  <AccountShineButton
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex gap-2"
                  >
                    <a className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/library">
                      <Library className="h-4 w-4" />
                      Biblioteka
                    </a>
                  </AccountShineButton>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  key={shakeKey}
                  initial={false}
                  animate={redeemStatus === "error" ? { 
                    x: [0, -8, 8, -6, 6, 0],
                    borderColor: ["rgb(226 232 240)", "rgb(248 113 113)", "rgb(226 232 240)"]
                  } : {}}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <motion.div
                    animate={justPasted ? { 
                      boxShadow: "0 0 0 4px rgba(99,102,241,0.3)",
                      scale: 1.02
                    } : { 
                      boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                      scale: 1
                    }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <Input
                        value={codePretty}
                        onChange={(e) => setCode(e.target.value)}
                        onPaste={(e) => {
                          const txt = e.clipboardData?.getData("text") || "";
                          if (txt) {
                            e.preventDefault();
                            setCode(txt);
                            setJustPasted(true);
                            setTimeout(() => setJustPasted(false), 1200);
                          }
                        }}
                        placeholder="XXXXXX-XXXXXX-XXXXXX.XXXXXX"
                        className="h-12 text-base border-2 border-slate-300 bg-white/90 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/90"
                        aria-label="Kod dostępu"
                      />
                      <AccountShineButton 
                        onClick={redeem} 
                        disabled={redeemStatus === "loading"} 
                        className="h-12 inline-flex items-center gap-2 min-w-[120px]"
                      >
                        {redeemStatus === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Dodawanie…
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Dodaj
                          </>
                        )}
                      </AccountShineButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const t = await navigator.clipboard.readText();
                            if (t) {
                              setCode(t);
                              setJustPasted(true);
                              setTimeout(() => setJustPasted(false), 1200);
                            }
                          } catch {}
                        }}
                        className="h-12 inline-flex items-center gap-2 border-2"
                      >
                        <ClipboardPaste className="h-4 w-4" />
                        Wklej
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>

                <AnimatePresence mode="popLayout">
                  {redeemStatus === "ok" && (
                    <EnhancedSuccessState 
                      message={redeemMsg} 
                      onAction={() => (window.location.href = "/library")}
                    />
                  )}
                  {redeemStatus === "error" && (
                    <EnhancedErrorState message={redeemMsg} />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Push Notifications Card */}
            <Card className="overflow-hidden border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${
                    subscribed 
                      ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {subscribed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Powiadomienia push
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Otrzymuj powiadomienia o nowych treściach
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        notifPerm === "granted" ? "secondary" : 
                        notifPerm === "denied" ? "destructive" : "outline"
                      }
                      className="text-xs"
                    >
                      {notifPerm === "granted" ? "Włączone" : 
                       notifPerm === "denied" ? "Zablokowane" : "Nieustawione"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={subscribed}
                      onCheckedChange={(v) => (v ? subscribePush() : unsubscribePush())}
                      disabled={busy || notifPerm === "denied"}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const r = await fetch("/api/push/test", { method: "POST" });
                        const dj = await r.json();
                        if (dj.ok) {
                          toast.success("Wysłano testowe powiadomienie", {
                            description: "Sprawdź czy dotarło do Ciebie.",
                            duration: 4000
                          });
                        } else {
                          toast.error("Błąd wysyłki", { 
                            description: dj.error || "Spróbuj ponownie za chwilę.",
                            duration: 5000
                          });
                        }
                      }}
                      disabled={!subscribed}
                    >
                      Wyślij test
                    </Button>
                  </div>
                </div>

                {notifPerm === "denied" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        Powiadomienia są zablokowane w przeglądarce. Odblokuj je w ustawieniach witryny, a następnie włącz przełącznik.
                      </div>
                    </div>
                  </motion.div>
                )}

                <details className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <summary className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4" />
                    Więcej informacji
                  </summary>
                  <ul className="mt-2 space-y-1 pl-6">
                    <li className="text-sm">• Powiadomienia są opcjonalne i można je wyłączyć w każdej chwili</li>
                    <li className="text-sm">• Do działania wymagają zainstalowanej usługi Service Worker</li>
                    <li className="text-sm">• Otrzymasz powiadomienia o nowych plikach i aktualizacjach</li>
                  </ul>
                </details>
              </CardContent>
            </Card>

            {/* Session / Account Card */}
            <Card className="lg:col-span-2 overflow-hidden border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Zalogowano jako: 
                        <span className="font-bold text-primary">{email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(email || "");
                              toast.success("Skopiowano adres e-mail", { duration: 3000 });
                            } catch {
                              toast.error("Nie udało się skopiować", { duration: 3000 });
                            }
                          }}
                          title="Kopiuj e-mail"
                          aria-label="Kopiuj e-mail"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Twoje konto jest aktywne i gotowe do użycia
                      </p>
                    </div>
                  </div>
                  <AccountShineButton
                    variant="outline"
                    onClick={signOut}
                    disabled={busy}
                    className="inline-flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Wyloguj
                  </AccountShineButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <AccountShineButton asChild className="gap-2">
                    <a className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/library">
                      <Library className="h-4 w-4" />
                      Otwórz bibliotekę
                    </a>
                  </AccountShineButton>
                  <Button asChild variant="outline" className="gap-2">
                    <a href="/redeem">
                      <KeyRound className="h-4 w-4" />
                      Dodaj kolejny kod
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="gap-2">
                    <a href="/">
                      <Sparkles className="h-4 w-4" />
                      Strona główna
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.section>
    </main>
  );
}

const grainSVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
    <feComponentTransfer>
      <feFuncA type='linear' slope='0.45'/>
    </feComponentTransfer>
  </filter>
  <rect width='100%' height='100%' filter='url(%23n)'/>
</svg>`;