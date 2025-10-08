import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Node runtime only (web-push is Node)
export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase.from("push_subscriptions")
    .select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ✅ get the default export
  const { default: webpush } = await import("web-push");

  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@example.com";
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Server missing VAPID keys" }, { status: 500 });
  }
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const payload = JSON.stringify({ title: "Entriso", body: "Hello from Entriso!", url: "/" });
  for (const s of (data || [])) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
    } catch { /* ignore gone subs */ }
  }
  return NextResponse.json({ ok: true });
}
