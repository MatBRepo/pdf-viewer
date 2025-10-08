"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Mail, LogOut, Bell, BellRing, CheckCircle2, AlertTriangle,
  ShieldCheck, KeyRound, Loader2, Plus, UserRound
} from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

function normalizeCode(raw: string) {
  return String(raw)
    .replace(/[\s\u00AD\u200B\u2060\uFEFF\u00B7\u2022\u2013\u2014]+/g, "") // strip hidden junk & exotic dashes
    .replace(/[^A-Za-z0-9._-]/g, "");                                     // allow '-' and '_'
}


// for display you MAY uppercase (visual), but DO NOT submit the uppercased value
function prettyCodeForDisplay(raw: string) {
  const cleaned = normalizeCode(raw).toUpperCase(); // visual only
  const parts = cleaned.split(".");
  const chunk  = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
  return parts.length === 2 ? `${chunk(parts[0])}.${chunk(parts[1])}` : chunk(cleaned);
}

export default function AccountPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // push
  const [subscribed, setSubscribed] = useState(false);

  // redeem
  const [code, setCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<Status>("idle");
  const [redeemMsg, setRedeemMsg] = useState("");

  const codePretty = useMemo(() => {
    const cleaned = normalizeCode(code).toUpperCase();
    const parts = cleaned.split(".");
    const chunk = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
    return parts.length === 2 ? `${chunk(parts[0])}.${chunk(parts[1])}` : chunk(cleaned);
  }, [code]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || null);

      if (typeof window !== "undefined") {
        const remembered = localStorage.getItem("loginEmail");
        if (remembered && !email) setLoginEmail(remembered);
      }

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
  }

  async function redeem() {
    const payload = normalizeCode(code);
    if (!payload) return;
    setRedeemStatus("loading"); setRedeemMsg("");
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
    }
  }

  async function subscribePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push nie jest wspierany w tej przeglądarce."); return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) { alert("Brak VAPID public key."); return; }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      await fetch("/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub)
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
      <section className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-brand/10 p-3 text-brand">
            <UserRound size={24} />
          </div>
          <div className="grow">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Twoje konto</h1>
            <p className="mt-1 text-slate-600">
              Zaloguj się magicznym linkiem na ten sam adres e-mail, którego używasz przy zakupach.
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
                <Button disabled={busy} aria-busy={busy}>
                  {busy ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Wysyłanie…</>) : "Wyślij magiczny link"}
                </Button>
              </form>
              <p className="text-sm text-slate-600 mt-2">
                Nie masz konta? Zostanie utworzone automatycznie po kliknięciu linku.
              </p>

              {/* Helpful tips */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium flex items-center"><ShieldCheck size={16} className="mr-2" /> Bezpieczne logowanie</div>
                  <p className="text-sm text-slate-600 mt-1">Zero haseł. Link działa jednorazowo i tylko przez chwilę.</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium flex items-center"><KeyRound size={16} className="mr-2" /> Dodawanie kodów</div>
                  <p className="text-sm text-slate-600 mt-1">Po zalogowaniu wkleisz kod z e-maila, aby dodać swoje PDF-y.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="font-medium">Zalogowano jako <span className="font-semibold">{email}</span></div>
                  <Button variant="outline" onClick={signOut} disabled={busy}>
                    <LogOut size={16} className="mr-2" /> Wyloguj
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Push controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    {subscribed ? <BellRing size={18} /> : <Bell size={18} />}
                    <div className="text-sm">Powiadomienia push</div>
                  </div>
                  <Switch
                    checked={subscribed}
                    onChange={(v) => (v ? subscribePush() : unsubscribePush())}
                  />
                  <Button
                    variant="outline"
                    className="sm:ml-2"
                    onClick={async () => {
                      const r = await fetch("/api/push/test", { method: "POST" });
                      const dj = await r.json();
                      alert(dj.ok ? "Wysłano test" : (dj.error || "Błąd"));
                    }}
                  >
                    Wyślij test
                  </Button>
                </div>

                {/* Redeem code */}
                <div className="mt-8">
                  <div className="text-sm font-medium mb-2 flex items-center">
                    <KeyRound size={16} className="mr-2" /> Dodaj kod dostępu
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                    <Input
                      value={codePretty}
                      onChange={(e) => setCode(e.target.value)}
                      onPaste={(e) => {
                        const txt = e.clipboardData?.getData("text") || "";
                        if (txt) { e.preventDefault(); setCode(txt); }
                      }}
                      placeholder="XXXXXX-XXXXXX-…"
                    />
                    <Button onClick={redeem} disabled={redeemStatus === "loading"}>
                      {redeemStatus === "loading" ? (<><Loader2 size={16} className="mr-2 animate-spin" /> Dodawanie…</>) : (<><Plus size={16} className="mr-2" /> Dodaj</>)}
                    </Button>
                  </div>

                  {redeemStatus === "ok" && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                      <CheckCircle2 size={18} className="mt-0.5" />
                      <div>
                        <div className="font-medium">Sukces</div>
                        <p className="text-sm">{redeemMsg}</p>
                        <div className="mt-2">
                          <Button variant="outline" onClick={()=> (window.location.href="/library")}>Otwórz bibliotekę</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {redeemStatus === "error" && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                      <AlertTriangle size={18} className="mt-0.5" />
                      <div>
                        <div className="font-medium">Nie udało się dodać kodu</div>
                        <p className="text-sm">{redeemMsg}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </main>
  );
}

// helper
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
