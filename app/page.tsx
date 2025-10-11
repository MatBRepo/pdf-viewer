"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Library, UserRound, ShieldCheck, Smartphone, Moon, Sun, FileText, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <section className="container py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" /> New
            </Badge>
            <span>Installable PWA · Secure streaming</span>
          </div>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Entriso <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">PDF Viewer</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl">
            Buy on WordPress, redeem in app, read securely. No public URLs, best‑effort copy/print protection, and comfortable reader modes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="group">
              <Link href="/redeem">
                Redeem a code
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/library">Open library</Link>
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4" /> Secure streaming
            <span className="opacity-50">•</span>
            <Smartphone className="h-4 w-4" /> Install on phone
          </div>
        </motion.div>

        {/* Primary actions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard href="/redeem" Icon={KeyRound} title="Redeem a code" description="Paste the access code from your email." />
          <FeatureCard href="/library" Icon={Library} title="Open your library" description="See all PDFs linked to your account." />
          <FeatureCard href="/account" Icon={UserRound} title="Your account" description="Manage login and notifications." />
        </div>

        {/* Highlights */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SmallCard icon={<Moon className="h-4 w-4" />} title="Reader modes" description="Dark, low‑contrast, and paper mode for eye comfort." />
          <SmallCard icon={<ShieldCheck className="h-4 w-4" />} title="Protected viewing" description="No public URLs; copy/print blocked and watermark overlay." />
          <SmallCard icon={<Smartphone className="h-4 w-4" />} title="Mobile‑first PWA" description="Fast install, offline shell, push‑ready." />
        </motion.div>
      </section>
    </main>
  );
}

function FeatureCard({ href, Icon, title, description }: { href: string; Icon: any; title: string; description: string; }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <Link href={href} className="block p-4">
        <CardHeader className="p-0">
          <div className="flex items-center gap-3">
            <span className="rounded-xl p-2 bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <CardTitle className="text-base flex items-center gap-1">
              {title}
              <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </CardTitle>
          </div>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <motion.div layoutId="underline" className="mt-3 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-primary/40 to-transparent transition-transform group-hover:scale-x-100" />
        </CardContent>
      </Link>
    </Card>
  );
}

function SmallCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
