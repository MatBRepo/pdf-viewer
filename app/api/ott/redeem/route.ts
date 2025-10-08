import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Remove whitespace + common hidden/linewrap chars (keep '-' and '_')
function stripVisualJunk(s: string) {
  // \u00AD soft hyphen, \u200B ZERO WIDTH SPACE, \u2060 WORD JOINER, \uFEFF BOM
  // \u00B7 middle dot, \u2022 bullet, \u2013 en dash, \u2014 em dash
  return s.replace(/[\s\u00AD\u200B\u2060\uFEFF\u00B7\u2022\u2013\u2014]+/g, "");
}

function parseIssuer(compact: string): string | null {
  try {
    const [p] = compact.split(".");
    if (!p) return null;
    const json = Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const obj = JSON.parse(json);
    const iss = obj?.iss;
    return typeof iss === "string" ? iss : null;
  } catch { return null; }
}

function normalizeCandidates(raw: string) {
  const base = stripVisualJunk(String(raw));
  const keepHyphens = base.replace(/[^A-Za-z0-9._-]/g, "");
  const dropHyphens = base.replace(/-/g, "").replace(/[^A-Za-z0-9._]/g, "");
  return [keepHyphens, dropHyphens];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw = String(body?.code || "");
    if (!raw) return NextResponse.json({ error: "Code required" }, { status: 400 });

    // Try with hyphens first; if we can't parse issuer, try without hyphens
    const [candidateA, candidateB] = normalizeCandidates(raw);
    let code = candidateA;
    let iss = parseIssuer(candidateA);
    if (!iss) {
      iss = parseIssuer(candidateB);
      if (iss) code = candidateB;
    }
    if (!iss) return NextResponse.json({ error: "Cannot read issuer from code" }, { status: 400 });

    // Call WordPress to redeem
    const r = await fetch(`${iss.replace(/\/*$/, "")}/wp-json/epw/v1/ott/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const text = await r.text();
    let dj: any = null;
    try { dj = JSON.parse(text); } catch {}

    if (!r.ok) {
      // Surface WP error so you see exactly why it failed
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
