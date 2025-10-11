"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  KeyRound,
  ClipboardPaste,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  BookOpen,
  Sparkles,
  UserRound,
  LogIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "ok" | "error";

/** Zachowaj base64url + kropkę; usuń spacje/myślniki wklejane z e-maila (NIE zmieniaj wielkości liter) */
function normalizeCode(raw: string) {
  return String(raw)
    .replace(/[\s\u00AD\u200B\u2060\uFEFF\u00B7\u2022\u2013\u2014]+/g, "")
    .replace(/[^A-Za-z0-9._-]/g, "");
}

/** Tylko do wyświetlania (można zamienić na UPPERCASE); nigdy nie wysyłaj tej wartości */
function prettyCodeForDisplay(raw: string) {
  const cleaned = normalizeCode(raw).toUpperCase();
  const chunk = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
  const parts = cleaned.split(".");
  return parts.length === 2 ? `${chunk(parts[0])}.${chunk(parts[1])}` : chunk(cleaned);
}

export default function RedeemPage() {
  const supabase = createClient();
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [justPasted, setJustPasted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const displayCode = useMemo(() => prettyCodeForDisplay(codeInput), [codeInput]);

  useEffect(() => {
    // Autouzupełnienie z ?code=...
    const url = new URL(window.location.href);
    const q = url.searchParams.get("code");
    if (q) {
      setCodeInput(q);
      setAutoFilled(true);
    }
    // Ustal zalogowanego użytkownika (baner pomocy)
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setCodeInput(t);
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 900);
      }
    } catch {
      // brak uprawnień – pomiń
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payloadCode = normalizeCode(codeInput);
    if (!payloadCode) return;

    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/ott/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: payloadCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Nie udało się wykorzystać kodu.");
      setStatus("ok");
      setMsg(`Powiązano źródło: ${data?.source_label || "dodano"}.`);
      setCodeInput("");
      setAutoFilled(false);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Coś poszło nie tak.");
      setShakeKey((k) => k + 1);
    }
  }

  return (
    <main className="container py-10">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Strona główna</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Wykorzystaj kod</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-6 md:p-8"
      >
        {/* Dekoracje */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.05 }}
        />

        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-indigo-600/10 p-3 text-indigo-600"
          >
            <KeyRound size={24} />
          </motion.div>
          <div className="grow">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Wykorzystaj kod dostępu
            </h1>
            <p className="mt-1 text-slate-600">
              Wklej kod z e-maila po zakupie, aby powiązać swoje PDF-y z tym kontem.
              Możesz dodać wiele kodów z różnych zamówień lub sklepów.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex gap-2"
          >
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-600">
              <Shield className="mr-1.5" size={16} />
              Bezpieczne strumieniowanie
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-600">
              <BookOpen className="mr-1.5" size={16} />
              Scalona biblioteka
            </span>
          </motion.div>
        </div>

        {/* Baner – brak logowania */}
        <AnimatePresence>
          {!userEmail && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
            >
              <UserRound className="mt-0.5" size={20} />
              <div>
                <div className="font-medium">Nie jesteś zalogowany/a</div>
                <p className="text-sm">
                  Wykorzystanie kodu powiąże zamówienie z Twoim kontem.{" "}
                  <button
                    className="inline-flex items-center text-indigo-700 underline underline-offset-2 hover:text-indigo-800"
                    onClick={() => (window.location.href = "/account")}
                  >
                    <LogIn size={14} className="mr-1" /> Zaloguj się najpierw
                  </button>
                  , najlepiej tym samym adresem e-mail, którego użyto przy zakupie.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Karta formularza */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="font-medium">Wpisz kod dostępu</div>
                <div className="hidden sm:flex items-center text-slate-500 text-sm">
                  <Sparkles size={16} className="mr-1" />
                  Wskazówka: jeśli otworzysz przycisk z e-maila, kod uzupełni się automatycznie
                  {autoFilled ? " ✓" : "."}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={submit}
                className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
                initial={false}
                animate={{}}
              >
                <motion.div
                  key={shakeKey}
                  initial={false}
                  animate={status === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.div
                    animate={justPasted ? { boxShadow: "0 0 0 6px rgba(99,102,241,0.2)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                    transition={{ duration: 0.6 }}
                    className="rounded-xl"
                  >
                    <Input
                      inputMode="text"
                      spellCheck={false}
                      autoCapitalize="off"
                      placeholder="XXXXXX-XXXXXX-... (kod z e-maila)"
                      value={displayCode}
                      onChange={(e) => setCodeInput(e.target.value)}
                      onPaste={(e) => {
                        const text = e.clipboardData?.getData("text") || "";
                        if (text) {
                          e.preventDefault();
                          setCodeInput(text);
                          setJustPasted(true);
                          setTimeout(() => setJustPasted(false), 900);
                        }
                      }}
                      required
                    />
                  </motion.div>
                </motion.div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:ml-2"
                    onClick={pasteFromClipboard}
                    title="Wklej ze schowka"
                  >
                    <ClipboardPaste size={16} className="mr-2" />
                    Wklej
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button className="sm:ml-2" disabled={status === "loading"} aria-busy={status === "loading"}>
                    {status === "loading" ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Trwa wykorzystywanie…
                      </>
                    ) : (
                      "Wykorzystaj"
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Informacja zwrotna */}
              <AnimatePresence mode="popLayout">
                {status === "ok" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="mt-4 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-800"
                  >
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.05 }}>
                      <CheckCircle2 className="mt-0.5" size={20} />
                    </motion.div>
                    <div>
                      <div className="font-medium">Sukces</div>
                      <p className="text-sm">{msg}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" onClick={() => (window.location.href = "/library")}>
                          Otwórz bibliotekę
                        </Button>
                        <Button variant="ghost" onClick={() => (window.location.href = "/account")}>
                          Zarządzaj kontem
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                  >
                    <AlertTriangle className="mt-0.5" size={20} />
                    <div>
                      <div className="font-medium">Nie udało się wykorzystać kodu</div>
                      <p className="text-sm">{msg}</p>
                      <details className="mt-2 text-sm opacity-90">
                        <summary className="cursor-pointer">Rozwiązywanie problemów</summary>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Upewnij się, że jesteś zalogowany/a tym samym e-mailem, którego użyto przy zakupie.</li>
                          <li>Wklej kod ponownie (myślniki są OK – normalizujemy je).</li>
                          <li>Otwórz link bezpośrednio z e-maila, aby kod wypełnił się automatycznie.</li>
                        </ul>
                      </details>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stopka pomocy */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6 text-sm text-slate-600"
        >
          Wykorzystanie kodu łączy zamówienie z Twoim kontem, aby bezpiecznie przeglądać pliki w aplikacji.
          Pliki są strumieniowane z krótkotrwałymi biletami (bez pobierania).
        </motion.div>
      </motion.section>
    </main>
  );
}
