import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Remove only whitespace / exotic separators; KEEP '-' and '_'
function cleanCode(raw: string) {
  return String(raw).replace(/[\s\u00B7\u2022\u2013\u2014]+/g, "");
}

function parseIssuerFromCode(raw: string): string | null {
  try {
    const cleaned = cleanCode(raw);
    const compact = cleaned.replace(/[^A-Za-z0-9._-]/g, ""); // allow '-' and '_'
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

    const code = cleanCode(raw); // DO NOT strip '-' or change case
    const iss  = parseIssuerFromCode(code);
    if (!iss) return NextResponse.json({ error: "Cannot read issuer from code" }, { status: 400 });

    // Call WordPress to redeem
    const r = await fetch(`${iss.replace(/\/*$/, "")}/wp-json/epw/v1/ott/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const text = await r.text();
    let dj: any = null;
    try { dj = JSON.parse(text); } catch { /* not JSON */ }

    if (!r.ok) {
      // Surface WP error so you see the real reason (bad_sig, expired, etc.)
      return NextResponse.json(
        { error: dj?.message || text || "Redeem failed", statusFromWP: r.status },
        { status: r.status }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = dj || {};
    const { error: insErr } = await supabase.from("pdf_sources").insert({
      user_id: user.id,
      wp_base_url: payload.wp_base_url,
      source_label: payload.source_label,
      source_token: payload.source_token
    });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, source_label: payload.source_label });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
