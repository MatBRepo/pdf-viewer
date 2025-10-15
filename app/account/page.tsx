"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

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
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

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
      toast.success("Sprawdź skrzynkę", { description: "Wysłaliśmy link logowania." });
    } catch (err: any) {
      toast.error("Nie udało się wysłać linku", { description: err?.message || "Spróbuj ponownie." });
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
    toast("Wylogowano.");
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
      toast.success("Kod dodany", { description: dj?.source_label || "Źródło zostało powiązane z kontem." });
    } catch (e: any) {
      setRedeemStatus("error");
      setRedeemMsg(e?.message || "Błąd.");
      setShakeKey((k) => k + 1);
      toast.error("Błąd dodawania kodu", { description: e?.message || "Sprawdź dane i spróbuj ponownie." });
    }
  }

  async function subscribePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Brak wsparcia", { description: "Powiadomienia push nie są wspierane w tej przeglądarce." });
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("Zablokowane", { description: "Włącz powiadomienia w ustawieniach przeglądarki." });
      return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      toast.error("Konfiguracja", { description: "Brak klucza VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY)." });
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
      toast.success("Powiadomienia włączone");
    } catch (e: any) {
      toast.error("Nie udało się włączyć powiadomień", { description: e?.message || "Spróbuj ponownie." });
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setSubscribed(false);
    toast("Powiadomienia wyłączone");
  }

  return (
    <main className="container py-6 sm:py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3 sm:mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Strona główna</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Konto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="rounded-xl border bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl bg-indigo-600/10 p-2.5 sm:p-3 text-indigo-600"
          >
            <UserRound size={22} />
          </motion.div>
          <div className="grow">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Twoje konto</h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-base">
              Zaloguj się magicznym linkiem (bez haseł). Po zalogowaniu możesz dodawać kody i zarządzać powiadomieniami.
            </p>
          </div>
        </div>

        {/* NOT SIGNED IN */}
        {!email ? (
          <Card className="mt-5 sm:mt-6">
            <CardHeader>
              <div className="font-medium flex items-center text-base sm:text-lg">
                <Mail className="mr-2" size={18} /> Zaloguj / Załóż konto
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={sendMagicLink} className="grid gap-2 sm:gap-3 sm:grid-cols-[1fr_auto] max-w">
                <Input
                  id="loginEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ty@przyklad.pl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <Button disabled={busy} aria-busy={busy} className="h-11 inline-flex items-center gap-2">
                  {busy ? (<><Loader2 size={16} className="animate-spin" /> Wysyłanie…</>) : "Wyślij magiczny link"}
                </Button>
              </form>

              <p className="text-sm text-slate-600">
                Nie masz konta? Zostanie utworzone automatycznie po kliknięciu linku.
              </p>

              {/* Tips */}
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium flex items-center">
                    <ShieldCheck size={16} className="mr-2" /> Bezpieczne logowanie
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Zero haseł. Link działa jednorazowo i tylko przez chwilę.</p>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium flex items-center">
                    <KeyRound size={16} className="mr-2" /> Dodawanie kodów
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Po zalogowaniu wkleisz kod z e-maila, aby dodać swoje PDF-y.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* SIGNED IN */
          <div className="mt-5 sm:mt-6 grid gap-5 lg:grid-cols-2">
            {/* Redeem first (mobile-first priority) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-base sm:text-lg font-medium flex items-center">
                    <KeyRound size={18} className="mr-2" /> Dodaj kod dostępu
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex gap-2"
                    onClick={() => (window.location.href = "/library")}
                  >
                    <Library size={16} /> Biblioteka
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  key={shakeKey}
                  initial={false}
                  animate={redeemStatus === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.32 }}
                >
                  <motion.div
                    animate={justPasted ? { boxShadow: "0 0 0 6px rgba(99,102,241,0.18)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                    transition={{ duration: 0.55 }}
                    className="rounded-xl"
                  >
                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-[1fr_auto_auto] max-w-xl">
                      <Input
                        value={codePretty}
                        onChange={(e) => setCode(e.target.value)}
                        onPaste={(e) => {
                          const txt = e.clipboardData?.getData("text") || "";
                          if (txt) {
                            e.preventDefault();
                            setCode(txt);
                            setJustPasted(true);
                            setTimeout(() => setJustPasted(false), 900);
                          }
                        }}
                        placeholder="XXXXXX-XXXXXX-…"
                        className="h-11"
                        aria-label="Kod dostępu"
                      />
                      <Button onClick={redeem} disabled={redeemStatus === "loading"} className="h-11 inline-flex items-center gap-2">
                        {redeemStatus === "loading" ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Dodawanie…
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Dodaj
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const t = await navigator.clipboard.readText();
                            if (t) {
                              setCode(t);
                              setJustPasted(true);
                              setTimeout(() => setJustPasted(false), 900);
                            }
                          } catch {}
                        }}
                        className="h-11 inline-flex items-center gap-2"
                      >
                        <ClipboardPaste className="h-4 w-4" /> Wklej
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>

                <AnimatePresence mode="popLayout">
                  {redeemStatus === "ok" && (
                    <motion.div
                      {...fadeUp}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-3 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800"
                    >
                      <CheckCircle2 size={18} className="mt-0.5" />
                      <div>
                        <div className="font-medium">Sukces</div>
                        <p className="text-sm">{redeemMsg}</p>
                        <div className="mt-2">
                          <Button variant="outline" onClick={() => (window.location.href = "/library")}>
                            Otwórz bibliotekę
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {redeemStatus === "error" && (
                    <motion.div
                      {...fadeUp}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                    >
                      <AlertTriangle size={18} className="mt-0.5" />
                      <div>
                        <div className="font-medium">Nie udało się dodać kodu</div>
                        <p className="text-sm">{redeemMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Push notifications */}
            <Card>
              <CardHeader>
                <div className="text-base sm:text-lg font-medium flex items-center">
                  {subscribed ? <BellRing size={18} className="mr-2" /> : <Bell size={18} className="mr-2" />}
                  Powiadomienia push
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        notifPerm === "granted" ? "secondary" : notifPerm === "denied" ? "destructive" : "outline"
                      }
                    >
                      {notifPerm === "granted" ? "Włączone" : notifPerm === "denied" ? "Zablokowane" : "Nieustawione"}
                    </Badge>
                  </div>

                  <Switch
                    checked={subscribed}
                    onCheckedChange={(v) => (v ? subscribePush() : unsubscribePush())}
                    disabled={busy || notifPerm === "denied"}
                  />

                  <Button
                    variant="outline"
                    onClick={async () => {
                      const r = await fetch("/api/push/test", { method: "POST" });
                      const dj = await r.json();
                      if (dj.ok) toast.success("Wysłano testowe powiadomienie");
                      else toast.error("Błąd wysyłki", { description: dj.error || "Spróbuj ponownie." });
                    }}
                    disabled={!subscribed}
                  >
                    Wyślij test
                  </Button>
                </div>

                {notifPerm === "denied" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                    Powiadomienia są zablokowane w przeglądarce. Odblokuj je w ustawieniach witryny, a następnie włącz
                    przełącznik.
                  </div>
                )}

                <details className="text-sm text-slate-600">
                  <summary className="cursor-pointer select-none">Więcej informacji</summary>
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    <li>Powiadomienia są opcjonalne i można je wyłączyć w każdej chwili.</li>
                    <li>Do działania wymagają zainstalowanej usługi Service Worker.</li>
                  </ul>
                </details>
              </CardContent>
            </Card>

            {/* Session / account box */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                  <div className="font-medium flex items-center gap-2 text-base sm:text-lg">
                    Zalogowano jako <span className="font-semibold truncate max-w-[60vw]">{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(email || "");
                          toast.success("Skopiowano adres e-mail");
                        } catch {
                          toast.error("Nie udało się skopiować");
                        }
                      }}
                      title="Kopiuj e-mail"
                      aria-label="Kopiuj e-mail"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={signOut}
                    disabled={busy}
                    className="inline-flex items-center gap-2"
                  >
                    <LogOut size={16} /> Wyloguj
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => (window.location.href = "/library")} className="gap-2">
                    <Library size={16} /> Otwórz bibliotekę
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.section>
    </main>
  );
}
