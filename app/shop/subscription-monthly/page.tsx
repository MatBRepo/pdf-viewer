"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, Crown, ShieldCheck, FileText, Globe, Sparkles, ChevronRight } from "lucide-react";

// ⚠️ Load the sheet only on the client to avoid prerender issues
const CheckoutSheet = dynamic(() => import("@/components/CheckoutSheet"), {
  ssr: false,
  loading: () => null,
});


export default function SubscriptionMonthlyPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumbs" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <li><Link href="/" className="hover:underline">Strona główna</Link></li>
          <li className="opacity-50">/</li>
          <li><Link href="/shop" className="hover:underline">Sklep</Link></li>
          <li className="opacity-50">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-slate-100 font-medium">Subskrypcja miesięczna</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs text-slate-700 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5" /> Plan Pro
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Subskrypcja miesięczna
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Generowanie kodów w WooCommerce, bezpieczny podgląd PDF z watermarkiem oraz integracje.
        </p>
      </header>

      {/* Quick switch */}
      <div className="mb-8 inline-flex rounded-lg border border-slate-200/70 p-1 dark:border-slate-800/70">
        <Link href="/shop/subscription-monthly" className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
          Miesięczna
        </Link>
        <Link href="/shop/subscription-yearly" className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          Roczna <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">oszczędzasz</span>
        </Link>
      </div>

      {/* Pricing card */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white dark:bg-slate-200 dark:text-slate-900">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Plan Pro</h2>
              <p className="text-slate-600 dark:text-slate-400">Pełna integracja z WooCommerce</p>
            </div>
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-bold">€19 / miesiąc</span>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <Line>Generowanie kodów (e-mail po zakupie)</Line>
            <Line>Podgląd PDF w Entriso (bez publicznych URL)</Line>
            <Line>Znak wodny z e-mailem klienta</Line>
            <Line>Wtyczka WordPress + API</Line>
            <Line>Powiadomienia push (opcjonalnie)</Line>
            <Line>Priorytetowe wsparcie e-mail</Line>
          </ul>

          <div className="mt-6">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-white transition hover:brightness-110 active:translate-y-[1px] dark:bg-slate-200 dark:text-slate-900"
            >
              Kup subskrypcję <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Side box */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/40">
          <h3 className="mb-3 text-lg font-semibold">Dlaczego to bezpieczne?</h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-green-600" /> Brak publicznych linków do PDF</li>
            <li className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-blue-600" /> Strumieniowanie z watermarkiem</li>
            <li className="flex items-start gap-2"><Globe className="mt-0.5 h-4 w-4 text-slate-500" /> Krótkotrwałe bilety dostępu</li>
          </ul>
          <a
            href="https://wordpress.org/plugins/"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Pobierz wtyczkę WordPress
          </a>
        </div>
      </section>

      {/* Shared CheckoutSheet (client-only) */}
      <CheckoutSheet
        open={open}
        onOpenChange={setOpen}
        plan="pro_monthly"
        priceLabel="€19 / miesiąc"
      />
    </main>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> {children}</li>;
}
