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
} from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

function normalizeCode(raw: string) {
  // keep base64url + dot; drop spaces and dashes users paste from email
  return raw.replace(/[\s\-–—]/g, "").replace(/[^A-Za-z0-9._]/g, "").toUpperCase();
}

function prettyCode(raw: string) {
  const cleaned = normalizeCode(raw);
  const chunks = (s: string) => (s.match(/.{1,6}/g) || []).join("-");
  const parts = cleaned.split(".");
  return parts.length === 2 ? `${chunks(parts[0])}.${chunks(parts[1])}` : chunks(cleaned);
}

export default function RedeemPage() {
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  const displayCode = useMemo(() => prettyCode(codeInput), [codeInput]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("code");
    if (q) setCodeInput(q);
  }, []);

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setCodeInput(t);
    } catch {
      // ignore (browser permission)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payloadCode = normalizeCode(codeInput); // send normalized
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
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "Something went wrong.");
    }
  }

  return (
    <main className="container py-10">
      {/* Hero / header */}
      <section className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-brand/10 p-3 text-brand">
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

        {/* Form card */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="font-medium">Enter your access code</div>
              <div className="hidden sm:flex items-center text-slate-500 text-sm">
                <Sparkles size={16} className="mr-1" />
                Tip: If you opened from the email button, the code is auto-filled.
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Input
                inputMode="text"
                spellCheck={false}
                autoCapitalize="characters"
                placeholder="XXXXXX-XXXXXX-... (code from email)"
                value={displayCode}
                onChange={(e) => setCodeInput(e.target.value)}
                onPaste={async (e) => {
                  // paste-friendly: grab plaintext; browser will still fire onChange
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

            {/* feedback */}
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
                      <li>Try pasting the code again (it’s OK if it contains hyphens).</li>
                      <li>If the email link opened this page, the code should be auto-filled.</li>
                    </ul>
                  </details>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer help */}
        <div className="mt-6 text-sm text-slate-600">
          By redeeming, your order is linked to your account for secure, in-app viewing. Files are
          streamed with short-lived tickets (no downloads).
        </div>
      </section>
    </main>
  );
}
