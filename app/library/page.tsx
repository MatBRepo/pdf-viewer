"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";

// Types
type Source = { id: string; source_label: string; wp_base_url: string; created_at: string };
type FileItem = {
  download_id: string;
  name: string;
  product_id: number;
  downloads_remaining: string | null;
  access_expires: string | null;
};

export default function LibraryPage() {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [filesBySource, setFilesBySource] = useState<Record<string, FileItem[]>>({});
  const [openSourceIds, setOpenSourceIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState<Record<string, boolean>>({});
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [search, setSearch] = useState<Record<string, string>>({});

  async function loadSources() {
    setLoading(true);
    try {
      const r = await fetch("/api/sources", { cache: "no-store" });
      const dj = await r.json();
      setSources(dj.sources || []);
    } finally {
      setLoading(false);
    }
  }

  async function openSource(id: string) {
    setLoadingList((m) => ({ ...m, [id]: true }));
    try {
      const r = await fetch(`/api/sources/${id}/list`, { method: "POST" });
      const dj = await r.json();
      if (!r.ok) {
        throw new Error(dj?.error || "Błąd wczytywania");
      }
      setFilesBySource((m) => ({ ...m, [id]: dj.items || [] }));
      setOpenSourceIds((m) => ({ ...m, [id]: true }));
    } catch (e: any) {
      alert(e?.message || "Błąd");
    } finally {
      setLoadingList((m) => ({ ...m, [id]: false }));
    }
  }

  function toggleSource(id: string) {
    // If we have files already, just toggle. Otherwise fetch.
    if (filesBySource[id]) {
      setOpenSourceIds((m) => ({ ...m, [id]: !m[id] }));
    } else {
      openSource(id);
    }
  }

  async function openFile(id: string, download_id: string) {
    const key = `${id}:${download_id}`;
    setOpeningKey(key);
    try {
      const r = await fetch(`/api/sources/${id}/ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: download_id }),
      });
      const dj = await r.json();
      if (!r.ok) {
        throw new Error(dj?.error || "Błąd");
      }
      router.push(dj.viewer_path);
    } catch (e: any) {
      alert(e?.message || "Błąd");
    } finally {
      setOpeningKey(null);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  return (
    <main className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Strona główna</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Biblioteka</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Twoja biblioteka</h1>
        <Button
          variant="outline"
          className="ml-auto inline-flex items-center gap-2"
          onClick={loadSources}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Odśwież
        </Button>
        <Button asChild>
          <a href="/redeem" className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Dodaj źródło
          </a>
        </Button>
      </div>

      {/* Empty state */}
      {!loading && sources.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border p-6"
        >
          <p className="text-slate-600">
            Brak źródeł. Dodaj je na stronie <a href="/redeem" className="underline">Wykorzystaj</a>.
          </p>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="rounded-2xl border p-3">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24 mt-2" />
                      <Skeleton className="h-9 w-24 mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {sources.map((s) => {
          const items = filesBySource[s.id] || [];
const term = (search[s.id] || "").toLowerCase();
const filtered = items.filter((f) =>
  f.name.toLowerCase().includes(term)
);

          return (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.source_label}</div>
                    <div className="text-xs text-slate-500 truncate">{s.wp_base_url}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <Badge variant="secondary" title="Data dodania">
                        {new Date(s.created_at).toLocaleDateString()}
                      </Badge>
                      {items.length > 0 && (
                        <Badge variant="outline">{items.length} plików</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2"
                      onClick={() => toggleSource(s.id)}
                      disabled={!!loadingList[s.id]}
                    >
                      {loadingList[s.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronDown
                          className={"h-4 w-4 transition-transform " + (openSourceIds[s.id] ? "rotate-180" : "")}
                        />
                      )}
                      {openSourceIds[s.id] ? "Ukryj pliki" : items.length ? "Pokaż pliki" : "Wczytaj pliki"}
                    </Button>
                  </div>
                </div>

                {/* Search within source */}
                {openSourceIds[s.id] && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-8"
                        placeholder="Szukaj w tym źródle…"
                        value={search[s.id] || ""}
                        onChange={(e) => setSearch((m) => ({ ...m, [s.id]: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <AnimatePresence initial={false}>
                  {openSourceIds[s.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map((f) => {
                          const opening = openingKey === `${s.id}:${f.download_id}`;
                          const expires = f.access_expires ? new Date(f.access_expires) : null;
                          const expiresLabel = expires ? expires.toLocaleDateString() : "Bez terminu";
                          const remaining = f.downloads_remaining ?? "∞";
                          return (
                            <motion.div
                              key={f.download_id}
                              whileHover={{ y: -2 }}
                              className="rounded-2xl border p-3 flex flex-col"
                            >
                              <div className="font-medium text-sm line-clamp-2" title={f.name}>{f.name}</div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" title="ID pliku">#{f.download_id}</Badge>
                                <Badge variant="secondary" title="Wygasa">Wygasa: {expiresLabel}</Badge>
                                <Badge variant="secondary" title="Pozostało pobrań">Pozostało: {remaining}</Badge>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button
                                  className="inline-flex items-center gap-2"
                                  onClick={() => openFile(s.id, f.download_id)}
                                  disabled={opening}
                                >
                                  {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                                  Otwórz
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* No results after filtering */}
                        {filtered.length === 0 && (
                          <div className="rounded-2xl border p-4 text-sm text-slate-600">
                            Brak wyników dla tego filtra.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
