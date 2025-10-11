"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, Book, Link2, Rocket, Settings, ExternalLink } from "lucide-react";

type SubStatus = { state: "no-user"|"no-tenant"|"inactive"|"active"|"past_due"|"canceled"; email?:string; onboardingToken?:string; tenantId?:string; };

export default function SubscriptionPage() {
  const supabase = createClient();
  const [state, setState] = useState<SubStatus>({ state: "inactive" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState({ state: "no-user" }); return; }
      const r = await fetch("/api/billing/status", { cache: "no-store" });
      const dj = await r.json();
      setState(dj as SubStatus);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout() {
    setBusy(true);
    const r = await fetch("/api/billing/create-checkout-session", { method: "POST" });
    const dj = await r.json();
    setBusy(false);
    if (dj.url) window.location.href = dj.url;
  }

  async function openPortal() {
    setBusy(true);
    const r = await fetch("/api/billing/create-portal-session", { method: "POST" });
    const dj = await r.json();
    setBusy(false);
    if (dj.url) window.location.href = dj.url;
  }

  async function newOnboardingToken() {
    setBusy(true);
    const r = await fetch("/api/tenants/new-onboarding-token", { method: "POST" });
    const dj = await r.json();
    setBusy(false);
    if (r.ok) setState((s)=>({ ...s, onboardingToken: dj.token }));
  }

  return (
    <main className="container py-10">
      <header className="max-w-3xl">
        <Badge variant="secondary" className="gap-1"><Rocket className="h-3.5 w-3.5"/> Subskrypcja dla sklepów</Badge>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Entriso PDF Watermark — subskrypcja dla WordPress/WooCommerce
        </h1>
        <p className="mt-2 text-slate-600">
          Dodaj znak wodny i bezpieczny podgląd PDF w aplikacji Entriso. Link w mailu po zakupie, odtwarzanie bez publicznych URL.
        </p>
      </header>

      {/* Pricing / CTA when not subscribed */}
      {state.state === "inactive" || state.state === "no-tenant" || state.state === "canceled" ? (
        <section className="mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="text-xl font-medium">Plan Pro</div>
              <div className="text-slate-600">1 sklep • nieogran. kody • znak wodny • wsparcie email</div>
              <div className="mt-2 text-3xl font-semibold">€19<span className="text-base font-normal text-slate-500">/mies.</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                {[
                  "Generowanie kodów w WooCommerce (e-mail po zakupie)",
                  "Podgląd PDF w Entriso (bez linków publicznych)",
                  "Znak wodny z e-mailem klienta",
                  "API & wtyczka WordPress",
                  "Powiadomienia push (opcjonalnie)",
                ].map((t)=>(
                  <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600"/>{t}</li>
                ))}
              </ul>
              <Button className="mt-5 w-full" size="lg" onClick={startCheckout} disabled={busy}>
                Rozpocznij subskrypcję
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-xl font-medium">Jak to działa?</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p><ShieldCheck className="mr-1 inline h-4 w-4"/> Po zakupie klient dostaje mail z <b>kodem</b>. W Entriso wkleja kod i ogląda PDF-y powiązane z zamówieniem.</p>
              <p><Book className="mr-1 inline h-4 w-4"/> Brak publicznych linków; serwowanie strumieniowe i znaki wodne.</p>
              <p><Link2 className="mr-1 inline h-4 w-4"/> W panelu dostaniesz <b>klucz instalacyjny</b> do wtyczki WordPress.</p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {/* Manage subscription when active/past_due */}
      {(state.state === "active" || state.state === "past_due") && (
        <section className="mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="text-xl font-medium">Status subskrypcji</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="mr-2 text-sm">Stan:</span>
                <Badge variant={state.state==="active" ? "default" : "destructive"}>
                  {state.state === "active" ? "Aktywna" : "Wymaga uwagi"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={openPortal} variant="outline">Zarządzaj płatnością</Button>
                <a className="inline-flex items-center text-sm underline" href="https://wordpress.org/plugins/" target="_blank" rel="noreferrer">
                  Pobierz wtyczkę <ExternalLink className="ml-1 h-3.5 w-3.5"/>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-xl font-medium">Instalacja wtyczki</div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Zainstaluj w WordPress: <b>Entriso – PDF View API</b>.</li>
                <li>W Ustawienia → Entriso wklej <b>Klucz instalacyjny</b> i zapisz.</li>
                <li>W WooCommerce e-mailach pojawi się przycisk „Otwórz w Entriso”.</li>
              </ol>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-slate-500 mb-1">Klucz instalacyjny</div>
                <code className="block select-all break-all text-xs">
                  {state.onboardingToken || "— brak —"}
                </code>
                <div className="mt-2">
                  <Button size="sm" onClick={newOnboardingToken} variant="outline">
                    Wygeneruj nowy klucz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {state.state === "no-user" && (
        <div className="mt-8 rounded-2xl border p-4">
          <p className="text-sm">Zaloguj się, aby rozpocząć subskrypcję.</p>
          <div className="mt-2"><a className="underline" href="/account">Przejdź do logowania</a></div>
        </div>
      )}
    </main>
  );
}
