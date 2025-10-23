"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  KeyRound,
  ClipboardPaste,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  BookOpen,
  Sparkles,
  UserRound,
  LogIn,
  Zap,
  Lock,
  FileKey,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "ok" | "error";

/** Enhanced background for redeem page */
function RedeemBackgroundFX() {
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
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(139,92,246,0.15), transparent 60%)",
        }}
      />
    </div>
  );
}

/** Enhanced floating specks for redeem page */
function RedeemFloatingSpecks({ count = 8 }: { count?: number }) {
  const seeds = Array.from({ length: count }, (_, i) => i);
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/40 shadow-[0_0_8px_2px_rgba(139,92,246,0.4)]"
          style={{ left: `${(i * 73) % 100}%`, top: `${(i * 59) % 100}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 8 + (i % 6), delay: (i % 9) * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/** Shine button that guarantees inline icon + text */
function RedeemShineButton({
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
        "relative overflow-hidden rounded-lg shadow-sm transition-[transform,box-shadow] hover:shadow-lg active:translate-y-[1px] justify-center " +
        className
      }
    >
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
      <motion.span
        aria-hidden
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-white/30"
      />
    </Comp>
  );
}

/** Enhanced success state component */
function SuccessState({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg dark:border-emerald-800 dark:from-emerald-900/20 dark:to-slate-900/40"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-6 w-6" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Sukces!</h3>
          <p className="mt-1 text-emerald-800 dark:text-emerald-200">{message}</p>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            Źródło zostało pomyślnie powiązane z Twoim kontem.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <RedeemShineButton asChild>
              <Link href="/library" aria-label="Przejdź do biblioteki">
                <BookOpen className="h-4 w-4" />
                <span>Otwórz bibliotekę</span>
              </Link>
            </RedeemShineButton>
            <Button variant="outline" asChild>
              <Link href="/account" aria-label="Przejdź do konta">
                <UserRound className="h-4 w-4" />
                <span>Zarządzaj kontem</span>
              </Link>
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">Dodaj kolejny kod</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Celebration confetti effect */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}

/** Enhanced error state component */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-6 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 shadow-lg dark:border-red-800 dark:from-red-900/20 dark:to-slate-900/40"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
        >
          <AlertTriangle className="h-6 w-6" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Nie udało się wykorzystać kodu</h3>
          <p className="mt-1 text-red-800 dark:text-red-200">{message}</p>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
              aria-expanded={showDetails}
            >
              <Zap className="h-4 w-4" />
              Rozwiązywanie problemów
              <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 text-sm text-red-700 dark:text-red-300"
                >
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Upewnij się, że jesteś zalogowany tym samym e-mailem, którego użyto przy zakupie</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ClipboardPaste className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Wklej kod ponownie — myślniki i spacje są automatycznie usuwane</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileKey className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>Otwórz link bezpośrednio z e-maila, aby kod wypełnił się automatycznie</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-4 flex gap-3">
            <RedeemShineButton onClick={onRetry} variant="outline" aria-label="Spróbuj ponownie">
              <span>Spróbuj ponownie</span>
            </RedeemShineButton>
            <Button asChild variant="ghost">
              <Link href="/account" aria-label="Przejdź do konta">
                <LogIn className="h-4 w-4" />
                <span>Przejdź do konta</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Zachowaj base64url + kropkę; usuń spacje/myślniki wklejane z e-maila (NIE zmieniaj wielkości liter) */
function normalizeCode(raw: string) {
  return String(raw)
    .replace(/[\s\u00AD\u200B\u2060\uFEFF\u00B7\u2022\u2013\u2014]+/g, "")
    .replace(/[^A-Za-z0-9._-]/g, "");
}

/** Tylko do wyświetlania (można zamienić na UPPERCASE); nigdy nie wysyłaj tej wartości */
function prettyCodeForDisplay(raw: string) {
  const cleaned = normalizeCode(raw).toUpperCase();
  const chunk = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
  const parts = cleaned.split(".");
  return parts.length === 2 ? `${chunk(parts[0])}.${chunk(parts[1])}` : chunk(cleaned);
}

export default function RedeemPage() {
  const supabase = createClient();
  const prefersReduced = useReducedMotion();
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const displayCode = useMemo(() => prettyCodeForDisplay(codeInput), [codeInput]);

  useEffect(() => {
    // Autouzupełnienie z ?code=...
    const url = new URL(window.location.href);
    const q = url.searchParams.get("code");
    if (q) {
      setCodeInput(q);
      setAutoFilled(true);
    }
    // Ustal zalogowanego użytkownika (baner pomocy)
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setCodeInput(t);
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 1200);
      }
    } catch {
      // brak uprawnień – pomiń
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payloadCode = normalizeCode(codeInput);
    if (!payloadCode) return;

    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/ott/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: payloadCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Nie udało się wykorzystać kodu.");
      setStatus("ok");
      setMsg(`Powiązano źródło: ${data?.source_label || "dodano"}.`);
      setCodeInput("");
      setAutoFilled(false);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Coś poszło nie tak.");
      setShakeKey((k) => k + 1);
    }
  }

  function resetState() {
    setStatus("idle");
    setMsg("");
    setCodeInput("");
  }

  return (
    <main className="container relative min-h-screen py-8">
      {/* Enhanced background */}
      <RedeemBackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <RedeemFloatingSpecks count={prefersReduced ? 0 : 12} />

        {/* Aurora effects */}
        <motion.div
          aria-hidden
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          animate={prefersReduced ? undefined : { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl"
          animate={prefersReduced ? undefined : { scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="transition-colors text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Strona główna
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-900 dark:text-slate-100">Wykorzystaj kod</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hero section */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="rounded-2xl bg-gradient-to-br from-primary to-violet-600 p-3 text-white shadow-lg"
              >
                <KeyRound size={28} />
              </motion.div>
              <div className="grow">
                <motion.h1
                  className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Wykorzystaj kod dostępu
                </motion.h1>
                <motion.p
                  className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Wklej kod z e-maila po zakupie, aby powiązać swoje PDF-y z tym kontem.
                  Możesz dodać wiele kodów z różnych zamówień lub sklepów.
                </motion.p>
              </div>
            </div>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-700 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Bezpieczne strumieniowanie</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-700 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>Scalona biblioteka</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-700 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                <Lock className="h-4 w-4 text-amber-500" />
                <span>Ochrona przed kopiowaniem</span>
              </span>
            </motion.div>

            {/* Login banner */}
            <AnimatePresence>
              {!userEmail && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 dark:border-amber-800 dark:from-amber-900/20 dark:to-amber-900/10"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    >
                      <UserRound size={20} />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 dark:text-amber-100">Nie jesteś zalogowany/a</div>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        Wykorzystanie kodu powiąże zamówienie z Twoim kontem.
                        <RedeemShineButton asChild size="sm" className="ml-2 inline-flex h-auto px-3 py-1 text-sm align-middle">
                          <Link className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/account" aria-label="Zaloguj się">
                            <LogIn size={14} />
                            <span>Zaloguj się najpierw</span>
                          </Link>
                        </RedeemShineButton>
                        , najlepiej tym samym adresem e-mail, którego użyto przy zakupie.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <Card className="overflow-hidden border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <FileKey className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Wprowadź kod dostępu</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Kod zwykle wygląda jak: XXXXXX-XXXXXX-XXXXXX.XXXXXX</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles className="h-4 w-4" />
                    {autoFilled ? (
                      <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-green-600 dark:text-green-400">
                        Kod automatycznie wypełniony ✓
                      </motion.span>
                    ) : (
                      "Kod uzupełni się automatycznie z linku"
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <motion.form onSubmit={submit} className="space-y-4" initial={false}>
                  <motion.div
                    key={shakeKey}
                    initial={false}
                    animate={
                      status === "error"
                        ? {
                            x: [0, -8, 8, -6, 6, 0],
                            borderColor: ["rgb(226 232 240)", "rgb(248 113 113)", "rgb(226 232 240)"],
                          }
                        : {}
                    }
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <motion.div
                      animate={
                        justPasted
                          ? { boxShadow: "0 0 0 4px rgba(99,102,241,0.3)", scale: 1.02 }
                          : { boxShadow: "0 0 0 0 rgba(0,0,0,0)", scale: 1 }
                      }
                      transition={{ duration: 0.5 }}
                      className="rounded-xl"
                    >
                      <Input
                        inputMode="text"
                        spellCheck={false}
                        autoCapitalize="off"
                        placeholder="XXXXXX-XXXXXX-XXXXXX.XXXXXX (kod z e-maila)"
                        value={displayCode}
                        onChange={(e) => setCodeInput(e.target.value)}
                        onPaste={(e) => {
                          const text = e.clipboardData?.getData("text") || "";
                          if (text) {
                            e.preventDefault();
                            setCodeInput(text);
                            setJustPasted(true);
                            setTimeout(() => setJustPasted(false), 1200);
                          }
                        }}
                        className="h-12 border-2 border-slate-300 bg-white/80 text-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80"
                        aria-label="Wprowadź kod dostępu"
                        required
                      />
                    </motion.div>
                  </motion.div>

                  <div className="flex flex-wrap gap-3">
                    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                      <RedeemShineButton type="submit" disabled={status === "loading"} className="min-w-[160px]" aria-label="Wykorzystaj kod">
                        {status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Wykorzystywanie…</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4" />
                            <span>Wykorzystaj kod</span>
                          </>
                        )}
                      </RedeemShineButton>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                      <Button type="button" variant="outline" onClick={pasteFromClipboard} className="min-w-[120px] border-2" aria-label="Wklej kod z schowka">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <ClipboardPaste className="h-4 w-4" />
                          <span>Wklej</span>
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.form>

                {/* Status messages */}
                <AnimatePresence mode="popLayout">
                  {status === "ok" && <SuccessState message={msg} onClose={resetState} />}

                  {status === "error" && <ErrorState message={msg} onRetry={resetState} />}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Sidebar */}
        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="space-y-6">
          {/* Info card */}
          <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Jak to działa?
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-medium">Kup produkt PDF</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Zakup w sklepie WordPress z WooCommerce</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-medium">Otrzymaj kod</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Kod dostępu przyjdzie w e-mailu potwierdzającym</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-medium">Wykorzystaj tutaj</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Wklej kod aby dodać PDF-y do biblioteki</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security card */}
          <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5 text-green-500" />
                Bezpieczeństwo
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                Pliki są <strong>strumieniowane bezpiecznie</strong> z krótkotrwałymi biletami dostępu.
              </p>
              <p>
                <strong>Bez pobierania</strong> oryginalnych plików na urządzenie.
              </p>
              <p>
                <strong>Ochrona przed kopiowaniem</strong> i nieautoryzowanym udostępnianiem.
              </p>
            </CardContent>
          </Card>

          {/* Help card */}
          <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <CardHeader>
              <h3 className="text-lg font-semibold">Potrzebujesz pomocy?</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <RedeemShineButton asChild variant="outline" className="w-full">
                <Link className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/library" aria-label="Przejdź do biblioteki">
                  <BookOpen className="h-4 w-4" />
                  <span>Przejdź do biblioteki</span>
                </Link>
              </RedeemShineButton>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account" aria-label="Twoje konto">
                  <UserRound className="h-4 w-4" />
                  <span>Twoje konto</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.aside>
      </div>
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
