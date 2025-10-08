import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sub = await req.json();
  const endpoint = String(sub.endpoint || "");
  const p256dh = String(sub.keys?.p256dh || "");
  const auth = String(sub.keys?.auth || "");
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: user.id, endpoint, p256dh, auth, user_agent: req.headers.get("user-agent") || ""
  }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
