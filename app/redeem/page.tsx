"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [msg, setMsg] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setMsg("");
    try {
      const res = await fetch("/api/ott/redeem", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to redeem");
      setStatus("ok");
      setMsg(`Added source: ${data?.source_label || "OK"}`);
      setCode("");
    } catch (err:any) {
      setStatus("error");
      setMsg(err.message || "Error");
    }
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold">Redeem access code</h1>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input
          placeholder="XXXXXX-XXXXXX-XXXXXX-..."
          value={code}
          onChange={e=>setCode(e.target.value)}
          required
        />
        <Button disabled={status==="loading"}>{status==="loading" ? "Redeeming..." : "Redeem"}</Button>
      </form>
      {msg && (
        <p className={`mt-3 ${status==="error" ? "text-red-600":"text-green-700"}`}>{msg}</p>
      )}
      <p className="text-sm text-slate-500 mt-6">
        You can add multiple codes to merge libraries from different orders/sites.
      </p>
    </main>
  );
}
