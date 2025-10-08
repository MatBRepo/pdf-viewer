import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase.from("pdf_sources")
    .select("id, source_label, wp_base_url, created_at")
    .order("created_at",{ascending:false});
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sources: data || [] });
}
