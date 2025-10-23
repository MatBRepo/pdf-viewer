"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ShieldCheck,
  Book,
  Link2,
  Rocket,
  Settings,
  ExternalLink,
  Zap,
  Crown,
  Sparkles,
  FileText,
  Lock,
  Users,
  Mail,
  Globe,
  CreditCard,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================
   Types
========================= */
type SubStatus = {
  state: "no-user" | "no-tenant" | "inactive" | "active" | "past_due" | "canceled";
  email?: string;
  onboardingToken?: string;
  tenantId?: string;
};

/* =========================
   Background FX (neutral)
========================= */
function SubscriptionBackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      {/* Subtle grid */}
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
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(grainSVG)}')`,
        }}
      />
      {/* Neutral gradient overlay */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(70% 60% at 20% 10%, rgba(15,23,42,0.06), transparent 60%), radial-gradient(60% 50% at 80% 70%, rgba(15,23,42,0.08), transparent 60%)",
        }}
      />
    </div>
  );
}

function SubscriptionFloatingSpecks({ count = 8 }: { count?: number }) {
  const seeds = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-slate-400/50 shadow-[0_0_8px_2px_rgba(100,116,139,0.25)]"
          style={{ left: `${(i * 71) % 100}%`, top: `${(i * 63) % 100}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.25, 0.6, 0.25] }}
          transition={{
            duration: 9 + (i % 7),
            delay: (i % 11) * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* =========================
   Buttons
========================= */
function SubscriptionShineButton({
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
        "relative overflow-hidden rounded-lg shadow-sm transition-[transform,box-shadow] hover:shadow-md active:translate-y-[1px] " +
        "inline-flex items-center gap-2 " + // keep icon + text on one line
        className
      }
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-white/25"
      />
    </Comp>
  );
}

/* =========================
   Small UI Bits
========================= */
function PlanFeature({
  text,
  icon,
}: {
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.li
      className="flex items-start gap-3 py-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
        {/* use provided icon; fallback to check */}
        {icon ?? <Check className="h-4 w-4" />}
      </div>
      <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {text}
      </span>
    </motion.li>
  );
}

function StatusBadge({ status }: { status: SubStatus["state"] }) {
  const statusConfig = {
    active: { label: "Aktywna", variant: "default" as const, icon: Check },
    past_due: { label: "Wymaga uwagi", variant: "destructive" as const, icon: Settings },
    inactive: { label: "Nieaktywna", variant: "outline" as const, icon: Clock },
    canceled: { label: "Anulowana", variant: "outline" as const, icon: Calendar },
    "no-tenant": { label: "Brak sklepu", variant: "secondary" as const, icon: Store },
    "no-user": { label: "Brak użytkownika", variant: "secondary" as const, icon: UserIcon },
  } as const;

  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </Badge>
  );
}

// tiny inline icons (no extra deps)
const Clock = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const Store = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16l-1 13H5L4 7zM3 7l2-3h14l2 3" />
  </svg>
);
const UserIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

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

/* =========================
   Main Page
========================= */
export default function SubscriptionPage() {
  const supabase = createClient();
  const [state, setState] = useState<SubStatus>({ state: "inactive" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState({ state: "no-user" });
        setLoading(false);
        return;
      }
      const r = await fetch("/api/billing/status", { cache: "no-store" });
      const dj = await r.json();
      setState(dj as SubStatus);
      setLoading(false);
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
    if (r.ok) setState((s) => ({ ...s, onboardingToken: dj.token }));
  }

  async function refreshStatus() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setState({ state: "no-user" });
      setLoading(false);
      return;
    }
    const r = await fetch("/api/billing/status", { cache: "no-store" });
    const dj = await r.json();
    setState(dj as SubStatus);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="container relative min-h-screen py-8">
        <SubscriptionBackgroundFX />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-slate-400/70 border-t-transparent"
            />
            <p className="text-slate-600 dark:text-slate-400">Ładowanie statusu subskrypcji…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container relative min-h-screen py-8">
      {/* Background */}
      <SubscriptionBackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <SubscriptionFloatingSpecks count={10} />
      </div>

      {/* Header */}
      <motion.header
        className="max-w-4xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1.5">
            <Rocket className="h-3.5 w-3.5" />
            Subskrypcja dla sklepów
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          Entriso PDF Watermark
        </motion.h1>

        <motion.p
          className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          Dodaj znak wodny i bezpieczny podgląd PDF w aplikacji Entriso. Link w mailu po zakupie, odtwarzanie bez publicznych URL.
        </motion.p>
      </motion.header>

      {/* Status row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={state.state} />
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={busy}
            className="inline-flex items-center gap-2"
            aria-label="Odśwież status"
          >
            <RefreshCw className="h-4 w-4" />
            Odśwież status
          </Button>
        </div>
      </motion.div>

      {/* Not subscribed */}
      <AnimatePresence mode="wait">
        {(state.state === "inactive" || state.state === "no-tenant" || state.state === "canceled") && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45 }}
            className="mt-8 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Pro Plan */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
              <Card className="h-full overflow-hidden border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-900 text-white p-2 dark:bg-slate-200 dark:text-slate-900">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Plan Pro</h3>
                      <p className="text-slate-600 dark:text-slate-400">Pełna integracja z WooCommerce</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">€19</span>
                    <span className="text-slate-500 dark:text-slate-400">/miesięcznie</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-1">
                    <PlanFeature text="Generowanie kodów w WooCommerce (e-mail po zakupie)" icon={<Mail className="h-4 w-4" />} />
                    <PlanFeature text="Podgląd PDF w Entriso (bez linków publicznych)" icon={<FileText className="h-4 w-4" />} />
                    <PlanFeature text="Znak wodny z e-mailem klienta" icon={<ShieldCheck className="h-4 w-4" />} />
                    <PlanFeature text="API & wtyczka WordPress" icon={<Globe className="h-4 w-4" />} />
                    <PlanFeature text="Powiadomienia push (opcjonalnie)" icon={<Zap className="h-4 w-4" />} />
                    <PlanFeature text="Wsparcie email – priorytetowe" icon={<Users className="h-4 w-4" />} />
                  </ul>

                  <SubscriptionShineButton
                    className="h-12 w-full items-center justify-center gap-3 text-lg"
                    onClick={startCheckout}
                    disabled={busy}
                    aria-label="Rozpocznij subskrypcję"
                  >
                    <Sparkles className="h-5 w-5" />
                    Rozpocznij subskrypcję
                  </SubscriptionShineButton>
                </CardContent>
              </Card>
            </motion.div>

            {/* How it works */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }}>
              <Card className="h-full overflow-hidden border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Book className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Jak to działa?</h3>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-slate-200 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Konfiguracja wtyczki</div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Zainstaluj wtyczkę WordPress i skonfiguruj z kluczem API</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-slate-200 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Zakup klienta</div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Klient otrzymuje e-mail z kodem dostępu po zakupie</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-slate-200 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Bezpieczny podgląd</div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Klient wykorzystuje kod w aplikacji Entriso do bezpiecznego przeglądania</p>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="mt-6 border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
                    <div className="mb-3 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">Gwarancja bezpieczeństwa</span>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <li>• Brak publicznych linków do PDF</li>
                      <li>• Strumieniowanie z watermarkiem</li>
                      <li>• Ochrona przed nieautoryzowanym dostępem</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Active / Past due */}
      <AnimatePresence>
        {(state.state === "active" || state.state === "past_due") && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45 }}
            className="mt-8 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Status Card */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="h-full overflow-hidden border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Status subskrypcji</h3>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 dark:from-emerald-900/15 dark:to-green-900/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Stan subskrypcji</div>
                        <StatusBadge status={state.state} />
                      </div>
                      <CreditCard className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SubscriptionShineButton
                      onClick={openPortal}
                      variant="outline"
                      className="w-full items-center justify-center gap-3"
                      aria-label="Zarządzaj płatnością"
                    >
                      <Settings className="h-4 w-4" />
                      Zarządzaj płatnością
                    </SubscriptionShineButton>

                    <Button asChild variant="outline" className="w-full inline-flex items-center justify-center gap-3">
                      <a href="https://wordpress.org/plugins/" target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Pobierz wtyczkę WordPress
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Installation Card */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}>
              <Card className="h-full overflow-hidden border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Link2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Instalacja wtyczki</h3>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-200 p-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <span>
                        Zainstaluj w WordPress: <b>Entriso – PDF View API</b>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-200 p-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <span>
                        W Ustawienia → Entriso wklej <b>Klucz instalacyjny</b> i zapisz
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-slate-200 p-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <span>W WooCommerce e-mailach pojawi się przycisk „Otwórz w Entriso”</span>
                    </li>
                  </ol>

                  <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-800/80">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Klucz instalacyjny</div>
                      <Button
                        size="sm"
                        onClick={newOnboardingToken}
                        variant="ghost"
                        disabled={busy}
                        className="h-8 inline-flex items-center gap-2"
                        aria-label="Wygeneruj nowy klucz instalacyjny"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Nowy klucz
                      </Button>
                    </div>
                    <code className="block select-all break-all rounded-lg bg-slate-100 p-3 font-mono text-xs dark:bg-slate-900">
                      {state.onboardingToken || "— brak —"}
                    </code>
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Skopiuj ten klucz do konfiguracji wtyczki WordPress</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* No user */}
      <AnimatePresence>
        {state.state === "no-user" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="mt-8 max-w-2xl"
          >
            <Card className="overflow-hidden border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Wymagane logowanie</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">
                  Zaloguj się, aby rozpocząć subskrypcję i skonfigurować integrację z WooCommerce.
                </p>
                <SubscriptionShineButton asChild aria-label="Przejdź do logowania">
                  <a href="/account">Przejdź do logowania</a>
                </SubscriptionShineButton>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
