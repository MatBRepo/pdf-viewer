"use client";

import { useEffect, useState } from "react";
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
  CalendarDays,
  Hash,
  Globe,
  Link2,
  FileText,
} from "lucide-react";

// Types
type Source = {
  id: string;
  source_label: string;
  wp_base_url: string;
  created_at: string;
};
type FileItem = {
  download_id: string;
  name: string | null;
  product_id: number;
  downloads_remaining: string | null;
  access_expires: string | null;
};

// ------- Helpers -------
function safeLower(v: unknown) {
  return (v ?? "").toString().toLowerCase();
}
function domainOf(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function faviconOf(url: string): string | null {
  try {
    const u = new URL(url);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}
function productUrl(base: string, productId: number): string | null {
  // Generic WP fallback for product preview:
  // many Woo sites support query to product by ID via ?post_type=product&p=
  try {
    const u = new URL(base);
    u.searchParams.set("post_type", "product");
    u.searchParams.set("p", String(productId));
    return u.toString();
  } catch {
    return null;
  }
}

export default function LibraryPage() {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [filesBySource, setFilesBySource] = useState<Record<string, FileItem[]>>(
    {}
  );
  const [openSourceIds, setOpenSourceIds] = useState<Record<string, boolean>>(
    {}
  );
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
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
            Brak źródeł. Dodaj je na stronie{" "}
            <a href="/redeem" className="underline">
              Wykorzystaj
            </a>
            .
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="rounded-2xl border p-3">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="mt-2 h-3 w-24" />
                      <Skeleton className="mt-3 h-9 w-24" />
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
          const term = safeLower(search[s.id] || "");
          const filtered = items.filter((f) =>
            safeLower(f.name).includes(term)
          );

          const fav = faviconOf(s.wp_base_url);
          const host = domainOf(s.wp_base_url);

          return (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Source logo + labels */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      {fav ? (
                        // favicon with graceful fallback
                        <img
                          src={fav}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {s.source_label}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {host}
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="hidden items-center gap-2 sm:flex">
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
                          className={
                            "h-4 w-4 transition-transform " +
                            (openSourceIds[s.id] ? "rotate-180" : "")
                          }
                        />
                      )}
                      {openSourceIds[s.id]
                        ? "Ukryj pliki"
                        : items.length
                        ? "Pokaż pliki"
                        : "Wczytaj pliki"}
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
                        onChange={(e) =>
                          setSearch((m) => ({ ...m, [s.id]: e.target.value }))
                        }
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
                      {/* Per-source loading shimmer */}
                      {loadingList[s.id] && items.length === 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <div key={j} className="rounded-2xl border p-3">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="mt-2 h-3 w-24" />
                              <Skeleton className="mt-3 h-9 w-24" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {filtered.map((f) => {
                            const opening =
                              openingKey === `${s.id}:${f.download_id}`;
                            const expires = f.access_expires
                              ? new Date(f.access_expires)
                              : null;
                            const expiresLabel = expires
                              ? expires.toLocaleDateString()
                              : "Bez terminu";
                            const remaining = f.downloads_remaining ?? "∞";
                            const prodLink = productUrl(
                              s.wp_base_url,
                              f.product_id
                            );

                            return (
                              <motion.div
                                key={f.download_id}
                                whileHover={{ y: -2 }}
                                className="flex flex-col rounded-2xl border p-3"
                              >
                                {/* Title row with file icon */}
                                <div
                                  className="line-clamp-2 flex items-start gap-2 text-sm font-medium"
                                  title={f.name || "Plik"}
                                >
                                  <FileText className="mt-0.5 h-4 w-4 text-primary/80" />
                                  <span>{f.name || "Bez nazwy"}</span>
                                </div>

                                {/* Meta badges */}
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" title="ID pliku">
                                    <Hash className="mr-1 h-3.5 w-3.5" />
                                    {f.download_id}
                                  </Badge>
                                  <Badge variant="secondary" title="Wygasa">
                                    <CalendarDays className="mr-1 h-3.5 w-3.5" />
                                    Wygasa: {expiresLabel}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    title="Pozostałe pobrania"
                                  >
                                    Pozostało: {remaining}
                                  </Badge>
                                </div>

                                {/* Source + product link */}
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5" />
                                    {host}
                                  </span>
                                  {prodLink && (
                                    <a
                                      href={prodLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                                      title="Zobacz produkt w WordPress"
                                    >
                                      <Link2 className="h-3.5 w-3.5" />
                                      Produkt #{f.product_id}
                                    </a>
                                  )}
                                </div>

                                <div className="mt-3 flex gap-2">
                                  <Button
                                    className="inline-flex items-center gap-2"
                                    onClick={() =>
                                      openFile(s.id, f.download_id)
                                    }
                                    disabled={opening}
                                  >
                                    {opening ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <ExternalLink className="h-4 w-4" />
                                    )}
                                    Otwórz
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}

                          {/* No results after filtering */}
                          {filtered.length === 0 && !loadingList[s.id] && (
                            <div className="rounded-2xl border p-4 text-sm text-slate-600">
                              Brak wyników dla tego filtra.
                            </div>
                          )}
                        </div>
                      )}
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
