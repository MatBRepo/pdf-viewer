"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function AccountPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string|null>(null);
  const [code, setCode] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || null);
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    })();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const emailInput = (document.getElementById("loginEmail") as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithOtp({ email: emailInput, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) alert(error.message); else alert("Check your inbox for a login link.");
  }

  async function redeem() {
    setBusy(true);
    try {
      const res = await fetch("/api/ott/redeem", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ code }) });
      const dj = await res.json();
      if (!res.ok) throw new Error(dj?.error || "Failed to redeem");
      alert("Added: " + (dj.source_label || "OK"));
      setCode("");
    } catch(e:any) { alert(e.message); }
    finally { setBusy(false); }
  }

  async function subscribePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { alert("Push not supported."); return; }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as any;
    if (!vapid) { alert("Missing VAPID public key."); return; }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) });
      await fetch("/api/push/subscribe", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(sub) });
      setSubscribed(true);
    } catch (e:any) { alert(e.message || "Failed to subscribe"); }
    finally { setBusy(false); }
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    setSubscribed(false);
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold">Your account</h1>

      {!email && (
        <Card className="mt-4">
          <CardHeader><div className="font-medium">Sign in</div></CardHeader>
          <CardContent>
            <form onSubmit={login} className="flex gap-2 max-w-md">
              <Input id="loginEmail" type="email" placeholder="you@example.com" required />
              <Button disabled={busy}>Send login link</Button>
            </form>
            <p className="text-sm text-slate-600 mt-2">Use the same email you use for purchases.</p>
          </CardContent>
        </Card>
      )}

      {email && (
        <Card className="mt-4">
          <CardHeader><div className="font-medium">Signed in as {email}</div></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div>Push notifications</div>
              <Switch checked={subscribed} onChange={(v)=> v ? subscribePush() : unsubscribePush()} />
              <Button variant="outline" onClick={async ()=>{
                const r = await fetch("/api/push/test",{method:"POST"});
                const dj = await r.json(); alert(dj.ok ? "Test sent" : (dj.error||"Error"));
              }}>Send test</Button>
            </div>

            <div className="mt-6 max-w-xl">
              <div className="text-sm font-medium mb-2">Add an access code</div>
              <div className="flex gap-2">
                <Input value={code} onChange={e=>setCode(e.target.value)} placeholder="XXXXXX-XXXXXX-..." />
                <Button onClick={redeem} disabled={busy}>Add</Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Codes come by email after purchase on the WordPress store.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

// helper inlined
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
