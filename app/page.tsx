"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import Head from "next/head";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence, type Variants } from "framer-motion";
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
  X,
  Expand,
} from "lucide-react";

/**
 * Visual refresh notes:
 * - Mozilla font via Google (Zilla Slab) for headings, Inter for UI/body.
 * - Better typographic rhythm (line-height, sizes, spacing).
 * - Softer glass backgrounds, subtle borders, and improved contrast.
 * - Cleaned gradients + grain, aura blobs refined.
 * - Fixed FeatureModal prop types to include `href`.
 */

export default function Home() {
  const prefersReduced = useReducedMotion();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Hero fade-up helper
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" }
  });

  // Enhanced variants with scroll-triggered animations
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
    hidden: { opacity: 0, y: prefersReduced ? 0 : 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Feature data for better management
  const features = [
    {
      id: "redeem",
      href: "/redeem",
      Icon: KeyRound,
      title: "Wykorzystaj kod",
      description: "Wklej kod dostępu z e-maila po zakupie.",
      fullDescription:
        "Bezpiecznie wykorzystaj swój kod licencyjny otrzymany po zakupie w naszym sklepie. Natychmiastowy dostęp do zakupionych treści."
    },
    {
      id: "library",
      href: "/library",
      Icon: Library,
      title: "Twoja biblioteka",
      description: "Zobacz wszystkie PDF-y powiązane z kontem.",
      fullDescription:
        "Przejrzyj całą swoją kolekcję PDF-ów w jednym miejscu. Organizuj, wyszukuj i zarządzaj swoimi dokumentami."
    },
    {
      id: "account",
      href: "/account",
      Icon: UserRound,
      title: "Twoje konto",
      description: "Logowanie, powiadomienia, łączenie źródeł.",
      fullDescription:
        "Zarządzaj swoim kontem, ustawieniami bezpieczeństwa i powiadomieniami. Połącz różne źródła zakupów."
    }
  ] as const;

  const miniFeatures = [
    {
      icon: <Moon className="h-4 w-4" />,
      title: "Tryby czytania",
      description: "Ciemny, niski kontrast i papier — wygoda dla oczu."
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      title: "Chroniony podgląd",
      description: "Brak publicznych URL; znaki wodne; blokada kopiowania/drukowania*."
    },
    {
      icon: <Smartphone className="h-4 w-4" />,
      title: "PWA na telefon",
      description: "Szybka instalacja, powłoka offline, gotowe powiadomienia."
    }
  ];

  return (
    <main className="relative overflow-hidden">
      {/* Google Fonts (Mozilla: Zilla Slab + Inter) */}
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mozilla:wght@400;500;600&family=Zilla+Slab:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Global font + typographic tune */}
      <style jsx global>{`
        html {
          font-feature-settings: "cv02","cv03","cv04","ss01","ss02","ss03";
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        :root {
      
        }
        body, .font-ui { font-family: var(--font-ui); }
        .font-mozilla { font-family: var(--font-mozilla); }
        /* Elevated contrast for outline buttons on hover in dark mode */
        .btn-outline-strong:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(148,163,184,.6);
        }
      `}</style>

      {/* Enhanced background with grainy gradients */}
      <EnhancedBackgroundFX />

      {/* Improved aurora effects */}
      <EnhancedAuroraFX />

      <section className="container relative py-12 md:py-16 max-w-6xl">
        {/* Enhanced Hero Section */}
{/* HERO */}
<motion.div {...fadeUp(0)} className="relative">
  <div className="mx-auto max-w-3xl text-center">
    {/* Top line: Nowość + subline */}
    <div className="flex flex-col items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.15 }}
      >
        <Badge
          variant="secondary"
          className="gap-1 border border-slate-200/70 dark:border-slate-800/60"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Nowość
        </Badge>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.25 }}
      >
        Instalowalna PWA • Bezpieczne streamowanie
      </motion.span>
    </div>

    {/* Title */}
    <motion.h1
      className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      Entriso{" "}
      <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 bg-clip-text text-transparent">
        PDF Viewer
      </span>
    </motion.h1>

    {/* Subcopy */}
    <motion.p
      className="mx-auto mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-slate-700 dark:text-slate-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
    >
      Kup w WordPress/WooCommerce, zrealizuj kod w aplikacji i czytaj bezpiecznie.
      Brak publicznych linków, utrudnione kopiowanie / drukowanie (best-effort)
      oraz wygodne tryby czytania.
    </motion.p>

    {/* Actions */}
    <motion.div
      className="mt-7 flex flex-wrap items-center justify-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <ShineButton asChild size="lg" className="group">
        <Link
          href="/redeem"
          aria-label="Przejdź do wykorzystania kodu"
          className="inline-flex items-center gap-2"
        >
          Wykorzystaj kod
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </ShineButton>

      <Button
        asChild
        size="lg"
        variant="outline"
        className="btn-outline-strong backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/40 border-2"
      >
        <Link
          href="/library"
          aria-label="Otwórz bibliotekę"
          className="inline-flex items-center gap-2"
        >
          Otwórz bibliotekę
        </Link>
      </Button>
    </motion.div>

    {/* Feature ticks */}
    <motion.div
      className="mx-auto mt-5 flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55 }}
    >
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        Zabezpieczone odtwarzanie
      </span>
      <span className="opacity-40">•</span>
      <span className="inline-flex items-center gap-2">
        <Smartphone className="h-4 w-4" />
        Instalacja na telefonie (PWA)
      </span>
    </motion.div>
  </div>
</motion.div>

        {/* Enhanced Feature cards with layout animations */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={listStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          layout
        >
          {features.map((feature) => (
            <motion.div key={feature.id} variants={item} layout>
              <EnhancedTiltGlow>
                <EnhancedFeatureCard
                  {...feature}
                  onExpand={() => setSelectedFeature(feature.id)}
                />
              </EnhancedTiltGlow>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced mini features with scroll animations */}
        <motion.div
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
          variants={listStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-30px" }}
          layout
        >
          {miniFeatures.map((feature, index) => (
            <motion.div key={index} variants={item} layout>
              <EnhancedSmallCard {...feature} />
            </motion.div>
          ))}
        </motion.div>

        <motion.p 
          className="mt-4 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          * Ochrona „best-effort”: techniczne utrudnienia po stronie przeglądarki.
        </motion.p>

        {/* Enhanced Pricing & license with animations */}
        <motion.div 
          className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          layout
        >
          <PricingSection />
          <LicenseConnect />
        </motion.div>

        {/* Enhanced decorative separator */}
        <EnhancedWaveDivider className="mt-12" />

        {/* Enhanced CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-12 overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:border-slate-800/70 dark:from-slate-900 dark:to-slate-900/60"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-20 -z-10 opacity-60 blur-3xl"
            animate={{ rotate: [0, 10, -6, 0], scale: [1, 1.1, 1, 1] }}
            transition={{ rotate: { repeat: Infinity, duration: 18, ease: "linear" }, scale: { repeat: Infinity, duration: 12, ease: "easeInOut" } }}
            style={{
              background:
                "radial-gradient(40% 60% at 30% 40%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(45% 60% at 70% 60%, rgba(139,92,246,0.6) 0%, transparent 65%)",
            }}
          />

          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-mozilla text-xl font-semibold">Gotowy, by dodać swoje PDF-y?</div>
              <p className="font-ui text-sm text-slate-600 dark:text-slate-400">
                Połącz WooCommerce i zacznij dostarczać treści natychmiast.
              </p>
            </div>
            <ShineButton asChild>
              <Link href="/redeem">Zacznij teraz</Link>
            </ShineButton>
          </div>
        </motion.div>
      </section>

      {/* Feature Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <FeatureModal
            feature={features.find((f) => f.id === selectedFeature)!}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </AnimatePresence>

      {/* Enhanced floating action cue */}
      <EnhancedScrollCuePortal />
    </main>
  );
}

// ===== ENHANCED UI COMPONENTS ===== //

type IconComp = ComponentType<{ className?: string }>;

function EnhancedFeatureCard({
  href,
  Icon,
  title,
  description,
  onExpand,
}: {
  href: string;
  Icon: IconComp;
  title: string;
  description: string;
  onExpand: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-2xl dark:hover:shadow-black/40 cursor-pointer h-full border-slate-200/70 dark:border-slate-800/70">
      {/* Enhanced gradient glow border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-px -z-10 rounded-[1rem] opacity-0 transition-all duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, rgba(139,92,246,0.35), rgba(99,102,241,0.3), transparent 70%)",
          mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          maskComposite: "exclude",
          filter: "blur(8px)",
        }}
      />

      <div className="relative h-full">
        <Link
          href={href}
          className="block rounded-2xl p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 h-full"
        >
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.span 
                  className="rounded-xl bg-primary/10 p-2 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-110"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <CardTitle className="font-mozilla text-[1.05rem] font-semibold tracking-tight flex items-center gap-1">
                  {title}
                  <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExpand();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Rozwiń: ${title}`}
              >
                <Expand className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="mt-1">{description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <motion.span 
              className="mt-3 block h-px w-full origin-left bg-gradient-to-r from-primary/40 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.2 }}
            />
          </CardContent>
        </Link>
      </div>
    </Card>
  );
}

function EnhancedSmallCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative transition-all hover:shadow-xl dark:hover:shadow-black/40 group cursor-pointer h-full border-slate-200/70 dark:border-slate-800/70">
      <EnhancedGlowBlur />
      <CardContent className="relative p-4">
        <motion.div 
          className="flex items-start gap-3"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div 
            className="mt-1 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.08, rotate: 3 }}
          >
            {icon}
          </motion.div>
          <div>
            <div className="font-mozilla text-[1.05rem] font-semibold tracking-tight">{title}</div>
            <div className="font-ui text-[0.94rem] leading-[1.5] text-slate-600 dark:text-slate-400">{description}</div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// ===== ENHANCED EFFECTS & UTILITIES ===== //

function EnhancedBackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      {/* Enhanced grainy gradient background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, rgba(139,92,246,0.05) 50%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, rgba(99,102,241,0.05) 50%, transparent 51%)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Enhanced grain with gradient overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.15] dark:opacity-[0.1]"
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(grainSVG)}')`,
          backgroundSize: "256px 256px",
        }}
      />
      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 70%)",
        }}
      />
    </div>
  );
}

function EnhancedAuroraFX() {
  const prefersReduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Enhanced aurora blobs with more movement */}
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30"
        animate={prefersReduced ? undefined : { 
          y: [0, -20, 0], 
          x: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-48 -right-24 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-400/25"
        animate={prefersReduced ? undefined : { 
          y: [0, 15, 0], 
          x: [0, -15, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl dark:bg-blue-400/15"
        animate={prefersReduced ? undefined : { 
          y: [0, -10, 0], 
          x: [0, 10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Enhanced floating specks */}
      <EnhancedFloatingSpecks count={useReducedMotion() ? 0 : 24} />
    </div>
  );
}

function EnhancedFloatingSpecks({ count = 18 }: { count?: number }) {
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/50 shadow-[0_0_12px_3px_rgba(255,255,255,0.6)] dark:bg-white/70"
          style={{ 
            left: `${(i * 97) % 100}%`, 
            top: `${(i * 53) % 100}%`,
            filter: `hue-rotate(${i * 40}deg)`
          }}
          animate={{ 
            y: [0, -20, 0], 
            x: [0, Math.sin(i) * 10, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{ 
            duration: 12 + (i % 8), 
            delay: (i % 10) * 0.4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      ))}
    </>
  );
}

function EnhancedWaveDivider({ className = "" }: { className?: string }) {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, scaleX: 0.8 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <svg
        viewBox="0 0 1440 120"
        className="h-12 w-full text-slate-200/70 dark:text-slate-800/70"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,60 C320,120 1120,0 1440,60 L1440,120 L0,120 Z"
          className="fill-current"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}

function EnhancedGlowBlur() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100"
      initial={{ scale: 0.9 }}
      whileHover={{ scale: 1 }}
      style={{
        background:
          "radial-gradient(60% 80% at 20% 0%, rgba(139,92,246,0.25), transparent 60%), radial-gradient(60% 80% at 80% 100%, rgba(99,102,241,0.2), transparent 60%)",
      }}
    />
  );
}

function EnhancedScrollCuePortal() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY || 0;
      setVisible(y < 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setVisible(false), 8000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  if (!mounted) return null;
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <motion.div
        className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm text-slate-700 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200 shadow-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Przewiń, by odkryć więcej
        <motion.span 
          aria-hidden 
          animate={{ y: [0, -2, 0] }} 
          transition={{ duration: 1.5, repeat: Infinity }} 
          className="inline-block"
        >
          ↓
        </motion.span>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function EnhancedTiltGlow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rX = py * -8;
    const rY = px * 8;
    
    setMousePosition({ x, y });
    setStyle({ 
      transform: `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.02, 1.02, 1.02)` 
    });
  }

  function onLeave() {
    setStyle({ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className="relative will-change-transform [transform-style:preserve-3d] transition-transform duration-150"
    >
      {/* Enhanced hotspot glow */}
      <div 
        className="pointer-events-none absolute -inset-px -z-10 rounded-[1.1rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(150px 120px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139,92,246,0.3), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

function FeatureModal({ 
  feature, 
  onClose 
}: { 
  feature: { href: string; Icon: IconComp; title: string; fullDescription: string };
  onClose: () => void;
}) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200/70 dark:border-slate-800/70"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2.5 top-2.5"
          aria-label="Zamknij modal"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <feature.Icon className="h-6 w-6" />
          </div>
          <h3 className="font-mozilla text-xl font-semibold">{feature.title}</h3>
        </div>
        
        <p className="font-ui text-slate-600 dark:text-slate-300 leading-relaxed">
          {feature.fullDescription}
        </p>
        
        <div className="mt-6 flex justify-end">
          <Button asChild>
            <Link href={feature.href} onClick={onClose}>
              Przejdź do funkcji
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// Keep existing PricingSection and LicenseConnect components the same (polished visuals)
function PricingSection() {
  const shopMonthly = process.env.NEXT_PUBLIC_SHOP_SUBSCRIPTION_URL || "/shop/subscription-monthly";
  const shopYearly = process.env.NEXT_PUBLIC_SHOP_SUBSCRIPTION_YEARLY_URL || "/shop/subscription-yearly";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:border-slate-800/70 dark:from-slate-900 dark:to-slate-900/60">
      <div className="font-mozilla mb-3 text-lg font-semibold">Subskrypcja Entriso PDF Viewer</div>
      <ul className="mb-5 space-y-2 font-ui text-[0.95rem] leading-[1.6] text-slate-700 dark:text-slate-300">
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Aktualizacje i wsparcie</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Integracja z WooCommerce</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Ochrona podglądu i znaki wodne</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm"><Link href={shopMonthly}>Kup subskrypcję miesięczną</Link></Button>
        <Button asChild size="sm" variant="outline" className="btn-outline-strong"><Link href={shopYearly}>Kup subskrypcję roczną</Link></Button>
      </div>
      <p className="font-ui mt-3 text-xs text-slate-500">Przycisk prowadzi do sklepu WordPress (WooCommerce). Po zakupie otrzymasz klucz licencyjny.</p>
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
      const res = await fetch("/api/licenses/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
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
    <form
      onSubmit={submit}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40"
    >
      <div className="mb-2 text-lg font-semibold">Powiąż klucz licencyjny</div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Wklej klucz otrzymany po zakupie, aby aktywować funkcje Pro i synchronizację.
      </p>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="lic-key">Klucz licencji</Label>
          <Input
            id="lic-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="ENT-XXXX-XXXX-XXXX"
            className="mt-1"
            autoComplete="off"
          />
        </div>

        <Button
          disabled={status === "working"}
          type="submit"
          className="sm:ml-2"
        >
          {status === "working" ? "Łączenie…" : "Powiąż"}
        </Button>
      </div>

      {message && (
        <div
          className={`mt-3 text-sm ${
            status === "ok"
              ? "text-emerald-600"
              : status === "err"
              ? "text-rose-600"
              : "text-slate-600"
          }`}
        >
          {message}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        To powiąże licencję z Twoim kontem użytkownika w aplikacji.
      </p>
    </form>
  );
}

// ShineButton and grainSVG

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
        "relative overflow-hidden rounded-md shadow-sm transition-[transform,box-shadow] hover:shadow-lg active:translate-y-[1px] " +
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
