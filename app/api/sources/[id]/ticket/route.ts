import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = params.id;
  const body = await req.json();
  const file_id = String(body?.file_id || "");

  const { data, error } = await supabase.from("pdf_sources").select("*").eq("id", id).single();
  if (error || !data || data.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const r = await fetch(`${data.wp_base_url.replace(/\/+$/,'')}/wp-json/epw/v1/ticket`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ source: data.source_token, file_id })
  });
  const dj = await r.json();
  if (!r.ok) return NextResponse.json({ error: dj?.message || "WP error" }, { status: r.status });

  return NextResponse.json({ viewer_path: `/viewer/${encodeURIComponent(dj.ticket)}`, expires_in: dj.expires_in });
}
