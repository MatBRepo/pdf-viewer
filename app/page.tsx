"use client";

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
import type { ComponentType } from "react";

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
      {/* Dekoracyjne plamy */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <div className="absolute top-48 -right-24 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-400/20" />
      </div>

      <section className="container py-10 md:py-12">
        {/* Pasek „Nowość” + hero */}
        <motion.div {...fadeUp(0)}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Nowość
            </Badge>
            <span className="opacity-80">
              Instalowalna PWA • Bezpieczne streamowanie
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Entriso{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              PDF Viewer
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300">
            Kup w WordPress/WooCommerce, zrealizuj kod w aplikacji i czytaj
            bezpiecznie. Brak publicznych linków, utrudnione kopiowanie /
            drukowanie (best-effort) oraz wygodne tryby czytania.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="group">
              <Link href="/redeem" aria-label="Przejdź do wykorzystania kodu">
                Wykorzystaj kod
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
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

        {/* Karty główne */}
        <motion.div
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={listStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <FeatureCard
              href="/redeem"
              Icon={KeyRound}
              title="Wykorzystaj kod"
              description="Wklej kod dostępu z e-maila po zakupie."
            />
          </motion.div>

          <motion.div variants={item}>
            <FeatureCard
              href="/library"
              Icon={Library}
              title="Twoja biblioteka"
              description="Zobacz wszystkie PDF-y powiązane z kontem."
            />
          </motion.div>

          <motion.div variants={item}>
            <FeatureCard
              href="/account"
              Icon={UserRound}
              title="Twoje konto"
              description="Logowanie, powiadomienia, łączenie źródeł."
            />
          </motion.div>
        </motion.div>

        {/* Wyróżnienia / cechy */}
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
          * Ochrona „best-effort”: techniczne utrudnienia po stronie
          przeglądarki.
        </p>
      </section>
    </main>
  );
}

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
    <Card className="transition-all hover:shadow-md dark:hover:shadow-black/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
