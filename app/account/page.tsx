"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

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
} from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

// --- helpers ---
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
      const { data: { user } } = await supabase.auth.getUser();
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
      alert("Sprawdź skrzynkę — wysłaliśmy link logowania.");
    } catch (err: any) {
      alert(err?.message || "Nie udało się wysłać linku.");
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
    } catch (e: any) {
      setRedeemStatus("error");
      setRedeemMsg(e?.message || "Błąd.");
      setShakeKey((k) => k + 1);
    }
  }

  async function subscribePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Powiadomienia push nie są wspierane w tej przeglądarce.");
      return;
    }
    if (Notification.permission === "denied") {
      alert("Powiadomienia są zablokowane w ustawieniach przeglądarki.");
      return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      alert("Brak klucza VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY).");
      return;
    }
    setBusy(true);
    try {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        setNotifPerm(perm);
        if (perm !== "granted") { setBusy(false); return; }
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
    } catch (e: any) {
      alert(e?.message || "Nie udało się włączyć powiadomień.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setSubscribed(false);
  }

  return (
    <main className="container py-10">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border bg-gradient-to-br from-white to-slate-50 p-6 md:p-8"
      >
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="rounded-lg bg-indigo-600/10 p-3 text-indigo-600"
          >
            <UserRound size={24} />
          </motion.div>
          <div className="grow">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Twoje konto</h1>
            <p className="mt-1 text-slate-600">
              Zaloguj się magicznym linkiem na ten sam adres e‑mail, którego używasz przy zakupach.
              Po zalogowaniu możesz dodawać kody i zarządzać powiadomieniami.
            </p>
          </div>
        </div>

        {!email ? (
          <Card className="mt-6">
            <CardHeader>
              <div className="font-medium flex items-center">
                <Mail className="mr-2" size={18} /> Zaloguj / Załóż konto
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMagicLink} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="ty@przyklad.pl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Button disabled={busy} aria-busy={busy} className="inline-flex items-center gap-2">
                  {busy ? (<><Loader2 size={16} className="animate-spin" /> Wysyłanie…</>) : "Wyślij magiczny link"}
                </Button>
              </form>
              <p className="text-sm text-slate-600 mt-2">
                Nie masz konta? Zostanie utworzone automatycznie po kliknięciu linku.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium flex items-center"><ShieldCheck size={16} className="mr-2" /> Bezpieczne logowanie</div>
                  <p className="text-sm text-slate-600 mt-1">Zero haseł. Link działa jednorazowo i tylko przez chwilę.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium flex items-center"><KeyRound size={16} className="mr-2" /> Dodawanie kodów</div>
                  <p className="text-sm text-slate-600 mt-1">Po zalogowaniu wkleisz kod z e‑maila, aby dodać swoje PDF‑y.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
                  <div className="font-medium flex items-center gap-2">
                    Zalogowano jako <span className="font-semibold">{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={async () => { await navigator.clipboard.writeText(email); }}
                      title="Kopiuj e‑mail"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" onClick={signOut} disabled={busy} className="inline-flex items-center gap-2">
                    <LogOut size={16} /> Wyloguj
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Push controls */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      {subscribed ? <BellRing size={18} /> : <Bell size={18} />}
                      <div className="text-sm">Powiadomienia push</div>
                      <Badge variant={notifPerm === "granted" ? "secondary" : notifPerm === "denied" ? "destructive" : "outline"}>
                        {notifPerm === "granted" ? "Włączone" : notifPerm === "denied" ? "Zablokowane" : "Nieustawione"}
                      </Badge>
                    </div>

                    <Switch
                      checked={subscribed}
                      // shadcn/ui uses onCheckedChange
                      onCheckedChange={(v) => (v ? subscribePush() : unsubscribePush())}
                      disabled={busy || notifPerm === "denied"}
                    />

                    <Button
                      variant="outline"
                      className="sm:ml-2"
                      onClick={async () => {
                        const r = await fetch("/api/push/test", { method: "POST" });
                        const dj = await r.json();
                        alert(dj.ok ? "Wysłano test" : (dj.error || "Błąd"));
                      }}
                      disabled={!subscribed}
                    >
                      Wyślij test
                    </Button>
                  </div>

                  {notifPerm === "denied" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
                      Powiadomienia są zablokowane w przeglądarce. Odblokuj je w ustawieniach witryny, a następnie włącz przełącznik.
                    </div>
                  )}
                </div>

                {/* Redeem code */}
                <div className="mt-8">
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <KeyRound size={16} className="mr-2" /> Dodaj kod dostępu
                  </div>

                  <motion.div
                    initial={false}
                    animate={redeemStatus === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <motion.div
                      animate={justPasted ? { boxShadow: "0 0 0 6px rgba(99,102,241,0.2)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                      transition={{ duration: 0.6 }}
                      className="rounded-xl"
                    >
                      <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                        <Input
                          value={codePretty}
                          onChange={(e) => setCode(e.target.value)}
                          onPaste={(e) => {
                            const txt = e.clipboardData?.getData("text") || "";
                            if (txt) { e.preventDefault(); setCode(txt); setJustPasted(true); setTimeout(()=>setJustPasted(false), 900);} }
                          }
                          placeholder="XXXXXX-XXXXXX-…"
                        />
                        <Button onClick={redeem} disabled={redeemStatus === "loading"} className="inline-flex items-center gap-2">
                          {redeemStatus === "loading" ? (<><Loader2 size={16} className="animate-spin" /> Dodawanie…</>) : (<><Plus size={16} /> Dodaj</>)}
                        </Button>
                        <Button type="button" variant="outline" onClick={async()=>{ try{ const t=await navigator.clipboard.readText(); if(t){ setCode(t); setJustPasted(true); setTimeout(()=>setJustPasted(false), 900);} } catch{} }} className="inline-flex items-center gap-2">
                          <ClipboardPaste className="h-4 w-4" /> Wklej
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {redeemStatus === "ok" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-3 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800"
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                      >
                        <AlertTriangle size={18} className="mt-0.5" />
                        <div>
                          <div className="font-medium">Nie udało się dodać kodu</div>
                          <p className="text-sm">{redeemMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.section>
    </main>
  );
}
