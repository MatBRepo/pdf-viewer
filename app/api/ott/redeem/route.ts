import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseIssuerFromCode(code: string): string | null {
  try {
    const compact = code.replace(/[^A-Za-z0-9\-\._]/g, "");
    const [p] = compact.split(".");
    const json = Buffer.from(p.replace(/-/g,'+').replace(/_/g,'/'), "base64").toString("utf8");
    const obj = JSON.parse(json);
    const iss = obj?.iss;
    if (typeof iss === "string") return iss;
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || "");

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const iss = parseIssuerFromCode(code);
    if (!iss) return NextResponse.json({ error: "Cannot read issuer from code" }, { status: 400 });

    const r = await fetch(`${iss.replace(/\/+$/,'')}/wp-json/epw/v1/ott/redeem`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ code })
    });
    const dj = await r.json();
    if (!r.ok) return NextResponse.json({ error: dj?.message || "Redeem failed" }, { status: r.status });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { error: insErr } = await supabase.from("pdf_sources").insert({
      user_id: user.id,
      wp_base_url: dj.wp_base_url,
      source_label: dj.source_label,
      source_token: dj.source_token
    });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, source_label: dj.source_label });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
