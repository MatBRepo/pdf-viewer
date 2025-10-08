"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

/** Keep base64url + dot; drop spaces/dashes users paste from email (DO NOT change case) */
function normalizeCode(raw: string) {
  return String(raw)
    .replace(/[\s\u00B7\u2022\u2013\u2014]+/g, "")  // remove spaces, middle dot, bullet, en/em dash
    .replace(/[^A-Za-z0-9._-]/g, "");              // allow '-'
}

/** Pretty visual only (safe to uppercase for display), never submit this value */
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

  const displayCode = useMemo(() => prettyCodeForDisplay(codeInput), [codeInput]);

  useEffect(() => {
    // Pre-fill from ?code=...
    const url = new URL(window.location.href);
    const q = url.searchParams.get("code");
    if (q) {
      setCodeInput(q);
      setAutoFilled(true);
    }
    // Read current logged-in user (for helpful banner)
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setCodeInput(t);
    } catch {
      // ignore (permissions)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payloadCode = normalizeCode(codeInput); // send normalized (case-preserving)
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
      if (!res.ok) throw new Error(data?.error || "Failed to redeem the code.");
      setStatus("ok");
      setMsg(`Linked source: ${data?.source_label || "added"}.`);
      setCodeInput("");
      setAutoFilled(false);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Something went wrong.");
    }
  }

  return (
    <main className="container py-10">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-600/10 p-3 text-indigo-600">
            <KeyRound size={24} />
          </div>
          <div className="grow">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Redeem your access code
            </h1>
            <p className="mt-1 text-slate-600">
              Paste the code from your purchase email to link your PDFs to this account.
              You can add multiple codes from different orders or stores.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-600">
              <Shield className="mr-1.5" size={16} />
              Secure streaming
            </span>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-slate-600">
              <BookOpen className="mr-1.5" size={16} />
              Library merge
            </span>
          </div>
        </div>

        {/* Not signed-in hint */}
        {!userEmail && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <UserRound className="mt-0.5" size={20} />
            <div>
              <div className="font-medium">You’re not signed in</div>
              <p className="text-sm">
                Redeeming links your order to your account.{" "}
                <button
                  className="inline-flex items-center text-indigo-700 underline underline-offset-2 hover:text-indigo-800"
                  onClick={() => (window.location.href = "/account")}
                >
                  <LogIn size={14} className="mr-1" /> Sign in first
                </button>
                , preferably with the same email you used for the purchase.
              </p>
            </div>
          </div>
        )}

        {/* Form card */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="font-medium">Enter your access code</div>
              <div className="hidden sm:flex items-center text-slate-500 text-sm">
                <Sparkles size={16} className="mr-1" />
                Tip: If you opened from the email button, the code is auto-filled
                {autoFilled ? " ✓" : ""}.
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Input
                inputMode="text"
                spellCheck={false}
                autoCapitalize="off"
                placeholder="XXXXXX-XXXXXX-... (code from email)"
                value={displayCode}
                onChange={(e) => setCodeInput(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData?.getData("text") || "";
                  if (text) {
                    e.preventDefault();
                    setCodeInput(text);
                  }
                }}
                required
              />
              <Button
                type="button"
                variant="outline"
                className="sm:ml-2"
                onClick={pasteFromClipboard}
                title="Paste from clipboard"
              >
                <ClipboardPaste size={16} className="mr-2" />
                Paste
              </Button>
              <Button
                className="sm:ml-2"
                disabled={status === "loading"}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Redeeming…
                  </>
                ) : (
                  "Redeem"
                )}
              </Button>
            </form>

            {/* Feedback */}
            {status === "ok" && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                <CheckCircle2 className="mt-0.5" size={20} />
                <div>
                  <div className="font-medium">Success</div>
                  <p className="text-sm">{msg}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={() => (window.location.href = "/library")}>
                      Open library
                    </Button>
                    <Button variant="ghost" onClick={() => (window.location.href = "/account")}>
                      Manage account
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                <AlertTriangle className="mt-0.5" size={20} />
                <div>
                  <div className="font-medium">Couldn’t redeem this code</div>
                  <p className="text-sm">{msg}</p>
                  <details className="mt-2 text-sm opacity-90">
                    <summary className="cursor-pointer">Troubleshooting</summary>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Make sure you’re signed in with the same email you used to purchase.</li>
                      <li>Paste the code again (hyphens are fine; we normalize them).</li>
                      <li>Open the link directly from the email so the code auto-fills.</li>
                    </ul>
                  </details>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer help */}
        <div className="mt-6 text-sm text-slate-600">
          By redeeming, your order is linked to your account for secure, in-app viewing.
          Files are streamed with short-lived tickets (no downloads).
        </div>
      </section>
    </main>
  );
}
