import { NextRequest } from "next/server";

function parseIssuerFromTicket(ticket: string): string | null {
  try {
    const compact = ticket.replace(/[^A-Za-z0-9\-\._]/g, "");
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

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { ticket: string } }) {
  const ticket = params.ticket;
  const iss = parseIssuerFromTicket(ticket);
  if (!iss) return new Response("Bad ticket", { status: 400 });

  const res = await fetch(`${iss.replace(/\/+$/,'')}/wp-json/epw/v1/stream?ticket=${encodeURIComponent(ticket)}`, {
    headers: { "Cache-Control":"no-store" }
  });

  const hdrs = new Headers(res.headers);
  hdrs.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  hdrs.set("Content-Disposition", "inline; filename=\"document.pdf\"");
  hdrs.set("X-Accel-Buffering", "no");

  return new Response(res.body, { status: res.status, headers: hdrs });
}
