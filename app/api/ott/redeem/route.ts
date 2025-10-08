import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Normalize and parse the issuer from the grouped code
function parseIssuerFromCode(raw: string): string | null {
  try {
    // ✅ remove only whitespace and exotic separators, NOT '-'
    const cleaned = String(raw).replace(/[\s\u00B7\u2022\u2013\u2014]+/g, ""); // space, middle dot, bullet, en/em dash
    // keep only base64url + dot
    const compact = cleaned.replace(/[^A-Za-z0-9._-]/g, ""); // allow '-'
    const [p] = compact.split(".");
    if (!p) return null;
    const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(b64, "base64").toString("utf8");
    const obj = JSON.parse(json);
    return typeof obj?.iss === "string" ? obj.iss : null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw = String(body?.code || "");
    if (!raw) return NextResponse.json({ error: "Code required" }, { status: 400 });

    // ✅ DO NOT strip '-' from what we send
    const code = raw.replace(/[\s\u00B7\u2022\u2013\u2014]+/g, "");
    const iss  = parseIssuerFromCode(code);
    if (!iss) return NextResponse.json({ error: "Cannot read issuer from code" }, { status: 400 });

    // Call WP to redeem
    const r = await fetch(`${iss.replace(/\/*$/, "")}/wp-json/epw/v1/ott/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    // Bubble detailed error back for easier debugging
    const text = await r.text();
    let dj: any = null;
    try { dj = JSON.parse(text); } catch { /* not JSON */ }

    if (!r.ok) {
      return NextResponse.json(
        { error: dj?.message || text || "Redeem failed", statusFromWP: r.status },
        { status: r.status }
      );
    }

    const okJson = dj || {};
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { error: insErr } = await supabase.from("pdf_sources").insert({
      user_id: user.id,
      wp_base_url: okJson.wp_base_url,
      source_label: okJson.source_label,
      source_token: okJson.source_token
    });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, source_label: okJson.source_label });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
