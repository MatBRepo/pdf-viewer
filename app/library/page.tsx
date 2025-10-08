"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Source = { id:string; source_label:string; wp_base_url:string; created_at:string };
type FileItem = { download_id: string; name: string; product_id: number; downloads_remaining: string|null; access_expires: string|null };

export default function LibraryPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [filesBySource, setFilesBySource] = useState<Record<string, FileItem[]>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function loadSources() {
    setLoading(true);
    const r = await fetch("/api/sources");
    const dj = await r.json();
    setLoading(false);
    setSources(dj.sources || []);
  }

  async function openSource(id: string) {
    const r = await fetch(`/api/sources/${id}/list`, { method:"POST" });
    const dj = await r.json();
    if (!r.ok) { alert(dj?.error || "Error"); return; }
    setFilesBySource((m)=>({ ...m, [id]: dj.items || [] }));
  }

  async function openFile(id: string, download_id: string) {
    const r = await fetch(`/api/sources/${id}/ticket`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ file_id: download_id })
    });
    const dj = await r.json();
    if (!r.ok) { alert(dj?.error || "Error"); return; }
    router.push(dj.viewer_path);
  }

  useEffect(() => { loadSources(); }, []);

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold">Your library</h1>
      {loading && <p className="mt-3 text-slate-600">Loading…</p>}

      {sources.length === 0 && !loading && (
        <p className="mt-3 text-slate-600">No sources yet. Add one on the <a href="/redeem" className="underline">Redeem</a> page.</p>
      )}

      <div className="mt-6 space-y-6">
        {sources.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="font-medium">{s.source_label}</div>
                <Button className="ml-auto" variant="outline" onClick={()=>openSource(s.id)}>List files</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(filesBySource[s.id] || []).map((f) => (
                  <div key={f.download_id} className="rounded-2xl border p-3 flex flex-col">
                    <div className="font-medium text-sm">{f.name}</div>
                    <div className="text-xs text-slate-500 mt-1">#{f.download_id}</div>
                    <Button className="mt-2" onClick={()=>openFile(s.id, f.download_id)}>Open</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
