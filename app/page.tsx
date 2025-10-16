"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRound,
  Library,
  UserRound,
  ShieldCheck,
  Smartphone,
  Moon,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const prefersReduced = useReducedMotion();

  // Hero fade-up helper
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  });

  // Variants for lists + items (fixed names: hidden/show)
  const listStagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.06,
        delayChildren: 0.05,
      },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 10, scale: 0.99 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <main className="relative overflow-hidden">
      {/* FX: global subtle grid + grain */}
      <BackgroundFX />

      {/* Decorative aurora + parallax orbs */}
      <AuroraFX />

      <section className="container relative py-12 md:py-16">
        {/* Badge + Hero */}
        <motion.div {...fadeUp(0)}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Badge variant="secondary" className="gap-1 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="h-3.5 w-3.5" /> Nowość
            </Badge>
            <span className="opacity-80">Instalowalna PWA • Bezpieczne streamowanie</span>
          </div>

          <div className="mt-3 inline-flex flex-col">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Entriso{" "}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                PDF Viewer
              </span>
            </h1>
            {/* Shimmer underline */}
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="mt-2 h-[3px] w-40 origin-left rounded-full bg-gradient-to-r from-primary/70 via-primary to-transparent"
            />
          </div>

          <p className="mt-4 max-w-2xl text-slate-700 dark:text-slate-300">
            Kup w WordPress/WooCommerce, zrealizuj kod w aplikacji i czytaj bezpiecznie. Brak publicznych linków,
            utrudnione kopiowanie / drukowanie (best‑effort) oraz wygodne tryby czytania.
          </p>

          <div className="mt-7 flex  items-center gap-3">
            <ShineButton asChild size="lg" className="group">
              <Link href="/redeem" aria-label="Przejdź do wykorzystania kodu" className="flex items-center">
                Wykorzystaj kod
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </ShineButton>

            <Button asChild size="lg" variant="outline" className="backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40">
              <Link href="/library" aria-label="Otwórz bibliotekę">
                Otwórz bibliotekę
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Zabezpieczone odtwarzanie
            <span className="opacity-50">•</span>
            <Smartphone className="h-4 w-4" /> Instalacja na telefonie (PWA)
          </div>
        </motion.div>

        {/* Feature cards with tilt/glow */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={listStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <TiltGlow>
              <FeatureCard
                href="/redeem"
                Icon={KeyRound}
                title="Wykorzystaj kod"
                description="Wklej kod dostępu z e‑maila po zakupie."
              />
            </TiltGlow>
          </motion.div>
          <motion.div variants={item}>
            <TiltGlow>
              <FeatureCard
                href="/library"
                Icon={Library}
                title="Twoja biblioteka"
                description="Zobacz wszystkie PDF‑y powiązane z kontem."
              />
            </TiltGlow>
          </motion.div>
          <motion.div variants={item}>
            <TiltGlow>
              <FeatureCard
                href="/account"
                Icon={UserRound}
                title="Twoje konto"
                description="Logowanie, powiadomienia, łączenie źródeł."
              />
            </TiltGlow>
          </motion.div>
        </motion.div>

        {/* Highlighted mini features */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={listStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <SmallCard
              icon={<Moon className="h-4 w-4" />}
              title="Tryby czytania"
              description="Ciemny, niski kontrast i papier — wygoda dla oczu."
            />
          </motion.div>
          <motion.div variants={item}>
            <SmallCard
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Chroniony podgląd"
              description="Brak publicznych URL; znaki wodne; blokada kopiowania/drukowania*."
            />
          </motion.div>
          <motion.div variants={item}>
            <SmallCard
              icon={<Smartphone className="h-4 w-4" />}
              title="PWA na telefon"
              description="Szybka instalacja, powłoka offline, gotowe powiadomienia."
            />
          </motion.div>
        </motion.div>

        <p className="mt-4 text-xs text-slate-500">
          * Ochrona „best‑effort”: techniczne utrudnienia po stronie przeglądarki.
        </p>

        {/* Pricing & license */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PricingSection />
          <LicenseConnect />
        </div>

        {/* Decorative separator */}
        <WaveDivider className="mt-12" />

        {/* CTA band */}
        <motion.div
          {...fadeUp(0.1)}
          className="relative mt-12 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800/70 dark:from-slate-900 dark:to-slate-900/60"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-20 -z-10 opacity-60 blur-3xl"
            animate={{ rotate: [0, 10, -6, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
            style={{
              background:
                "radial-gradient(40% 60% at 30% 40%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(45% 60% at 70% 60%, rgba(139,92,246,0.6) 0%, transparent 65%)",
            }}
          />

          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-medium">Gotowy, by dodać swoje PDF‑y?</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Połącz WooCommerce i zacznij dostarczać treści natychmiast.
              </p>
            </div>
            <ShineButton asChild>
              <Link href="/redeem">Zacznij teraz</Link>
            </ShineButton>
          </div>
        </motion.div>
      </section>

      {/* Floating action cue */}
      <ScrollCuePortal />
    </main>
  );
}

// ===== UI building blocks ===== //

type IconComp = ComponentType<{ className?: string }>;

function FeatureCard({
  href,
  Icon,
  title,
  description,
}: {
  href: string;
  Icon: IconComp;
  title: string;
  description: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-black/30">
      {/* Soft gradient glow border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-px -z-10 rounded-[1rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, rgba(139,92,246,0.28), rgba(99,102,241,0.24), transparent 60%)",
          mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          maskComposite: "exclude",
        }}
      />

      <Link
        href={href}
        className="block rounded-2xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <CardHeader className="p-0">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="h-5 w-5" />
            </span>
            <CardTitle className="flex items-center gap-1 text-base">
              {title}
              <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </CardTitle>
          </div>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <span className="mt-3 block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-primary/40 to-transparent transition-transform group-hover:scale-x-100" />
        </CardContent>
      </Link>
    </Card>
  );
}

function SmallCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative transition-all hover:shadow-md dark:hover:shadow-black/30">
      <GlowBlur />
      <CardContent className="relative p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Effects & utilities ===== //

function PricingSection() {
  const shopMonthly = process.env.NEXT_PUBLIC_SHOP_SUBSCRIPTION_URL || "/shop/subscription-monthly";
  const shopYearly = process.env.NEXT_PUBLIC_SHOP_SUBSCRIPTION_YEARLY_URL || "/shop/subscription-yearly";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800/70 dark:from-slate-900 dark:to-slate-900/60">
      <div className="mb-4 text-lg font-medium">Subskrypcja Entriso PDF Viewer</div>
      <ul className="mb-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Aktualizacje i wsparcie</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Integracja z WooCommerce</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Ochrona podglądu i znaki wodne</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm"><Link href={shopMonthly}>Kup subskrypcję miesięczną</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href={shopYearly}>Kup subskrypcję roczną</Link></Button>
      </div>
      <p className="mt-3 text-xs text-slate-500">Przycisk prowadzi do sklepu WordPress (WooCommerce). Po zakupie otrzymasz klucz licencyjny.</p>
    </div>
  );
}

function LicenseConnect() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setStatus("working");
    setMessage("");
    try {
      const res = await fetch("/api/licenses/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
      if (!res.ok) throw new Error(await res.text());
      setStatus("ok");
      setMessage("Licencja powiązana z Twoim kontem.");
      setKey("");
    } catch (err: any) {
      setStatus("err");
      setMessage(err?.message || "Nie udało się powiązać licencji.");
    }
  }

  return (
    <form onSubmit={submit} className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40">
      <div className="mb-2 text-lg font-medium">Powiąż klucz licencyjny</div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Wklej klucz otrzymany po zakupie, aby aktywować funkcje Pro i synchronizację.</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="lic-key">Klucz licencji</Label>
          <Input id="lic-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="ENT-XXXX-XXXX-XXXX" className="mt-1" />
        </div>
        <Button disabled={status === "working"} type="submit" className="sm:ml-2">
          {status === "working" ? "Łączenie…" : "Powiąż"}
        </Button>
      </div>
      {message && (
        <div className={`mt-3 text-sm ${status === "ok" ? "text-emerald-600" : status === "err" ? "text-rose-600" : "text-slate-600"}`}>
          {message}
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">To powiąże licencję z Twoim kontem użytkownika w aplikacji.</p>
    </form>
  );
}

// ===== Effects & utilities ===== //

function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "#0f172a",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.08]"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(grainSVG)}')` }}
      />
    </div>
  );
}

function AuroraFX() {
  const prefersReduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft aurora blobs */}
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25"
        animate={prefersReduced ? undefined : { y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-48 -right-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-400/20"
        animate={prefersReduced ? undefined : { y: [0, 8, 0], x: [0, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Floating light specks */}
      <FloatingSpecks count={prefersReduced ? 0 : 18} />
    </div>
  );
}

function FloatingSpecks({ count = 12 }: { count?: number }) {
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/40 shadow-[0_0_8px_2px_rgba(255,255,255,0.45)] dark:bg-white/60"
          style={{ left: `${(i * 97) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 8 + (i % 5), delay: (i % 7) * 0.35, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 1440 120"
        className="h-10 w-full text-slate-200/70 dark:text-slate-800/70"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C320,120 1120,0 1440,60 L1440,120 L0,120 Z"
          className="fill-current"
        />
      </svg>
    </div>
  );
}

function GlowBlur() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(60% 80% at 20% 0%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(60% 80% at 80% 100%, rgba(99,102,241,0.16), transparent 60%)",
      }}
    />
  );
}

function ScrollCuePortal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY || 0;
      setVisible(y < 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setVisible(false), 6000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs text-slate-700 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-200">
        Przewiń, by odkryć więcej
        <motion.span aria-hidden animate={{ y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block">↓</motion.span>
      </div>
    </motion.div>,
    document.body
  );
}

function ShineButton({
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
        "relative overflow-hidden rounded-xl shadow-sm transition-[transform,box-shadow] hover:shadow-lg active:translate-y-[1px] " +
        className
      }
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-white/30"
      />
    </Comp>
  );
}

function TiltGlow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rX = py * -6;
    const rY = px * 6;
    setStyle({ transform: `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg)` });
  }

  function onLeave() {
    setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className="relative will-change-transform [transform-style:preserve-3d]"
    >
      {/* hotspot glow */}
      <div className="pointer-events-none absolute -inset-px -z-10 rounded-[1.1rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120px 100px at var(--x,50%) var(--y,50%), rgba(139,92,246,0.25), transparent 60%)",
        }}
      />
      {children}
    </div>
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
