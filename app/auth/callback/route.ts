import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles magic link + email OTP redirects
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/library"; // where to land after login

  if (!code) {
    return NextResponse.redirect(new URL("/account?error=missing_code", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/account?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  // Session cookie is now set by the server client; go to library
  return NextResponse.redirect(new URL(next, req.url));
}
