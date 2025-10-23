"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  Sparkles,
  FolderOpen,
  Download,
  Eye,
} from "lucide-react";

/* =========================
   Types
========================= */
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

/* =========================
   Background FX
========================= */
function LibraryBackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#0f172a",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.06]"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(grainSVG)}')` }}
      />
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(139,92,246,0.1), transparent 50%)",
        }}
      />
    </div>
  );
}

function LibraryFloatingSpecks({ count = 12 }: { count?: number }) {
  const seeds = Array.from({ length: count }, (_, i) => i);
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <>
      {seeds.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/30 shadow-[0_0_6px_1px_rgba(139,92,246,0.3)]"
          style={{ left: `${(i * 83) % 100}%`, top: `${(i * 67) % 100}%` }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6 + (i % 4), delay: (i % 8) * 0.25, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* =========================
   Buttons (inline icon+text guaranteed)
========================= */
function LibraryShineButton({
  asChild,
  children,
  className = "",
  size,
  ...rest
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
  const Comp: any = Button as any;
  return (
    <Comp
      {...rest}
      size={size}
      className={
        // content is centered, single line, with spacing
        "relative overflow-hidden rounded-lg shadow-sm transition-[transform,box-shadow] hover:shadow-md active:translate-y-[1px] justify-center " +
        className
      }
    >
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
      <motion.span
        aria-hidden
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] bg-white/25"
      />
    </Comp>
  );
}

/* =========================
   File Card
========================= */
function EnhancedFileCard({
  file,
  source,
  onOpen,
  openingKey,
}: {
  file: FileItem;
  source: Source;
  onOpen: (id: string, downloadId: string) => void;
  openingKey: string | null;
}) {
  const expires = file.access_expires ? new Date(file.access_expires) : null;
  const expiresLabel = expires ? expires.toLocaleDateString() : "Bez terminu";
  const remaining = file.downloads_remaining ?? "∞";
  const prodLink = productUrl(source.wp_base_url, file.product_id);
  const host = domainOf(source.wp_base_url);
  const opening = openingKey === `${source.id}:${file.download_id}`;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex flex-col rounded-2xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-sm transition-all hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:shadow-black/30"
    >
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1), transparent 70%)",
          mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          maskComposite: "exclude",
        }}
      />

      {/* header */}
      <div className="mb-3 flex items-start gap-3">
        <motion.div
          className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <FileText className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-2 text-sm font-medium leading-tight text-slate-800 dark:text-slate-200"
            title={file.name || "Plik"}
          >
            {file.name || "Bez nazwy"}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Hash className="h-3 w-3" />
            <span>ID: {file.download_id}</span>
          </div>
        </div>
      </div>

      {/* meta */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Wygasa: {expiresLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Download className="h-3.5 w-3.5" />
          <span>Pozostało: {remaining}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Globe className="h-3.5 w-3.5" />
          <span className="truncate">{host}</span>
        </div>
      </div>

      {/* source link */}
      {prodLink && (
        <div className="mb-3">
          <a
            href={prodLink}
            target="_blank"
            rel="noreferrer"
            className="group/link inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
            title="Zobacz produkt w WordPress"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span className="border-b border-transparent transition-colors group-hover/link:border-primary/50">
              Produkt #{file.product_id}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
          </a>
        </div>
      )}

      {/* action */}
      <div className="mt-auto">
        <LibraryShineButton
          onClick={() => onOpen(source.id, file.download_id)}
          disabled={opening}
          className="w-full"
          size="sm"
          aria-label={`Otwórz PDF: ${file.name || file.download_id}`}
        >
          {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          <span>Otwórz PDF</span>
        </LibraryShineButton>
      </div>
    </motion.div>
  );
}

/* =========================
   Source Card
========================= */
function EnhancedSourceCard({
  source,
  items,
  isOpen,
  isLoading,
  searchTerm,
  onToggle,
  onSearchChange,
  onFileOpen,
  openingKey,
}: {
  source: Source;
  items: FileItem[];
  isOpen: boolean;
  isLoading: boolean;
  searchTerm: string;
  onToggle: (id: string) => void;
  onSearchChange: (id: string, value: string) => void;
  onFileOpen: (id: string, downloadId: string) => void;
  openingKey: string | null;
}) {
  const fav = faviconOf(source.wp_base_url);
  const host = domainOf(source.wp_base_url);
  const filteredItems = items.filter((f) => safeLower(f.name).includes(safeLower(searchTerm)));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} layout>
      <Card className="overflow-hidden border-slate-200/60 bg-white/50 backdrop-blur-sm transition-all hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:shadow-black/30">
        <CardHeader className="pb-3">
          <motion.div className="flex flex-wrap items-center gap-3" whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            {/* Source header */}
            <div className="min-w-0 flex-1 items-center gap-3 sm:flex">
              <motion.div
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {fav ? (
                  <img
                    src={fav}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Globe className="h-5 w-5" />
                )}
              </motion.div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-200">{source.source_label}</h3>
                <div className="truncate text-sm text-slate-500 dark:text-slate-400">{host}</div>
              </div>
            </div>

            {/* Stats & actions */}
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <Badge variant="secondary" title="Data dodania" className="text-xs">
                  {new Date(source.created_at).toLocaleDateString()}
                </Badge>
                {items.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {items.length} plików
                  </Badge>
                )}
              </div>
              <LibraryShineButton variant="outline" onClick={() => onToggle(source.id)} disabled={isLoading} className="min-w-[140px]">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                <span>{isOpen ? "Ukryj" : items.length ? "Pokaż" : "Wczytaj"}</span>
              </LibraryShineButton>
            </div>
          </motion.div>

          {/* Search within source */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 flex items-center gap-2"
              >
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="rounded-lg border-slate-300 bg-white/80 pl-10 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80"
                    placeholder="Szukaj w tym źródle…"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(source.id, e.target.value)}
                    aria-label={`Szukaj w źródle: ${source.source_label}`}
                  />
                </div>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    {filteredItems.length} wyników
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Loading skeleton inside an opened source */}
                {isLoading && items.length === 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="rounded-2xl border border-slate-200/60 p-4 dark:border-slate-800/60">
                        <Skeleton className="mb-2 h-5 w-3/4" />
                        <Skeleton className="mb-3 h-4 w-1/2" />
                        <Skeleton className="h-9 w-full rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" layout>
                    {filteredItems.map((file) => (
                      <EnhancedFileCard key={file.download_id} file={file} source={source} onOpen={onFileOpen} openingKey={openingKey} />
                    ))}

                    {/* Empty state in expanded source */}
                    {filteredItems.length === 0 && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"
                      >
                        <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                        <h4 className="mb-2 text-lg font-medium text-slate-600 dark:text-slate-400">
                          {searchTerm ? "Brak pasujących plików" : "Brak plików"}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          {searchTerm ? "Spróbuj zmienić kryteria wyszukiwania" : "To źródło nie zawiera jeszcze żadnych plików"}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* =========================
   Helpers
========================= */
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
  try {
    const u = new URL(base);
    u.searchParams.set("post_type", "product");
    u.searchParams.set("p", String(productId));
    return u.toString();
  } catch {
    return null;
  }
}

const grainSVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
    <feComponentTransfer>
      <feFuncA type='linear' slope='0.45'/>
    </feComponentTransfer>
  </filter>
  <rect width='100%' height='100%' filter='url(%23n)'/>
</svg>`;

/* =========================
   Page
========================= */
export default function LibraryPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
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
      if (!r.ok) throw new Error(dj?.error || "Błąd wczytywania");
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
      if (!r.ok) throw new Error(dj?.error || "Błąd");
      router.push(dj.viewer_path);
    } catch (e: any) {
      alert(e?.message || "Błąd");
    } finally {
      setOpeningKey(null);
    }
  }

  function handleSearchChange(sourceId: string, value: string) {
    setSearch((m) => ({ ...m, [sourceId]: value }));
  }

  useEffect(() => {
    loadSources();
  }, []);

  return (
    <main className="container relative min-h-screen py-8">
      {/* FX */}
      <LibraryBackgroundFX />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <LibraryFloatingSpecks count={prefersReduced ? 0 : 16} />
      </div>

      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="transition-colors text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Strona główna
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-900 dark:text-slate-100">Biblioteka</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Twoja biblioteka</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Zarządzaj swoimi plikami PDF ze wszystkich źródeł</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <LibraryShineButton variant="outline" onClick={loadSources} disabled={loading} className="inline-flex">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span>Odśwież</span>
          </LibraryShineButton>
          <LibraryShineButton asChild>
            <a className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/redeem">
              <BookOpen className="h-4 w-4" />
              <span>Dodaj źródło</span>
            </a>
          </LibraryShineButton>
        </div>
      </motion.div>

      {/* Empty state */}
      {!loading && sources.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/40"
        >
          <FolderOpen className="mx-auto mb-4 h-16 w-16 text-slate-400" />
          <h3 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-300">Brak źródeł w bibliotece</h3>
          <p className="mx-auto mb-6 max-w-md text-slate-600 dark:text-slate-400">
            Dodaj swoje pierwsze źródło, aby zacząć korzystać z biblioteki PDF.
          </p>
          <LibraryShineButton asChild size="lg">
            <a className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap" href="/redeem">
              <Sparkles className="h-4 w-4" />
              <span>Dodaj pierwsze źródło</span>
            </a>
          </LibraryShineButton>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <motion.div className="mt-8 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-36 rounded-lg" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="rounded-2xl border p-4">
                      <Skeleton className="mb-2 h-5 w-3/4" />
                      <Skeleton className="mb-3 h-4 w-1/2" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Sources */}
      <motion.div className="mt-8 space-y-6" layout>
        {sources.map((source) => (
          <EnhancedSourceCard
            key={source.id}
            source={source}
            items={filesBySource[source.id] || []}
            isOpen={!!openSourceIds[source.id]}
            isLoading={!!loadingList[source.id]}
            searchTerm={search[source.id] || ""}
            onToggle={toggleSource}
            onSearchChange={handleSearchChange}
            onFileOpen={openFile}
            openingKey={openingKey}
          />
        ))}
      </motion.div>

      {/* Stats footer */}
      {sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl border border-slate-200/60 bg-white/50 p-6 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{sources.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Aktywnych źródeł</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Object.values(filesBySource).flat().length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Wszystkich plików</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Object.values(openSourceIds).filter(Boolean).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Rozwiniętych sekcji</div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
