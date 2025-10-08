import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main>
      <section className="container py-10">
        <h1 className="text-3xl font-semibold">Entriso PDF Viewer</h1>
        <p className="text-slate-600 mt-2">Buy on WordPress, redeem in app, read securely. Installable PWA with push notifications.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/redeem" className="rounded-2xl border p-4 hover:shadow-soft transition">
            <h2 className="font-medium">Redeem a code →</h2>
            <p className="text-sm text-slate-600 mt-1">Paste the access code from your email.</p>
          </a>
          <a href="/library" className="rounded-2xl border p-4 hover:shadow-soft transition">
            <h2 className="font-medium">Open your library →</h2>
            <p className="text-sm text-slate-600 mt-1">See all PDFs linked to your account.</p>
          </a>
          <a href="/account" className="rounded-2xl border p-4 hover:shadow-soft transition">
            <h2 className="font-medium">Your account →</h2>
            <p className="text-sm text-slate-600 mt-1">Manage login and notifications.</p>
          </a>
        </div>
      </section>
    </main>
  );
}
