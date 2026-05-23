/**
 * Catalog fetcher — reads the Sigmafy stats engine's /tools endpoint and
 * normalises it into a typed structure that stats-studio (and any other
 * client) can render.
 *
 * The Python service is the single source of truth for what tools exist
 * and what fields they take. We cache the catalog server-side for one hour
 * to keep page loads snappy.
 */

export interface CatalogField {
  key: string;
  label: string;
  /** array | intarray | json | int | float | float_optional | string | select */
  type: string;
  placeholder?: string;
  options?: string[];
}

export interface CatalogTool {
  slug: string;
  name: string;
  category: string;
  summary: string;
  /** Canonical /api/v1/... path. */
  endpoint: string;
  method: string;
  status: string;
  fields: CatalogField[];
  example?: Record<string, unknown> | null;
  chartType?: string | null;
  requiresPlotly: boolean;
  sampleKey?: string | null;
}

export interface CatalogCategory {
  name: string;
  prefix: string;
  description: string;
  tools: CatalogTool[];
}

export interface Catalog {
  version: string;
  totalTools: number;
  categories: CatalogCategory[];
  /** Lookup helper — slug → tool. Built once on fetch. */
  bySlug: ReadonlyMap<string, CatalogTool>;
}

interface RawCatalogTool {
  slug?: string;
  name?: string;
  category?: string;
  summary?: string;
  endpoint?: string;
  method?: string;
  status?: string;
  fields?: CatalogField[];
  example?: Record<string, unknown> | null;
  chart_type?: string | null;
  requires_plotly?: boolean;
  sample_key?: string | null;
}

interface RawCatalogResponse {
  version?: string;
  total_tools?: number;
  categories?: Array<{
    name?: string;
    prefix?: string;
    description?: string;
    tools?: RawCatalogTool[];
  }>;
}

const CATALOG_REVALIDATE_SECONDS = 60 * 60; // 1 hour
export const CATALOG_CACHE_TAG = "stats-catalog";

/**
 * No-op kept for API compatibility. The Next.js cache is now the
 * primary surface; to bust it, call `revalidateTag(CATALOG_CACHE_TAG)`
 * from app code on a Vercel deployment.
 */
export function clearCatalogCache(): void {
  // intentionally empty — see CATALOG_CACHE_TAG above
}

/**
 * Fetch the catalog. Uses Next.js's `fetch` cache with a 1-hour
 * `revalidate` and a stable `stats-catalog` tag.
 *
 * On Vercel this means: the first request after a deploy hits the
 * upstream; subsequent requests for the next hour read from the Next.js
 * data cache (per-region). To force a refresh, call
 * `revalidateTag('stats-catalog')` from a server action — useful when
 * the Python service ships a new tool.
 *
 * In non-Next environments (CLI, tests) the `next` option on `fetch` is
 * silently ignored and every call hits the upstream.
 */
export async function fetchCatalog(opts: {
  baseUrl: string;
  /** Force-fetch by passing `cache: "no-store"` semantics. */
  force?: boolean;
}): Promise<Catalog> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}/tools`;
  // Next.js extends RequestInit with `next: { revalidate, tags }` at runtime
  // but the type-only definition isn't visible in this leaf TypeScript
  // library. Pass through `unknown` to keep this file's tsconfig
  // independent of next.
  const init = {
    headers: { Accept: "application/json" },
    ...(opts.force
      ? { cache: "no-store" }
      : { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] } }),
  } as unknown as RequestInit;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Catalog fetch failed: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as RawCatalogResponse;
  return normaliseRawCatalog(raw);
}

function normaliseRawCatalog(raw: RawCatalogResponse): Catalog {

  const categories: CatalogCategory[] = (raw.categories ?? []).map((cat) => ({
    name: cat.name ?? "Uncategorised",
    prefix: cat.prefix ?? "",
    description: cat.description ?? "",
    tools: (cat.tools ?? []).map((t) => normaliseTool(cat.name ?? "Uncategorised", t)),
  }));

  const bySlug = new Map<string, CatalogTool>();
  for (const cat of categories) {
    for (const tool of cat.tools) {
      bySlug.set(tool.slug, tool);
    }
  }

  const catalog: Catalog = {
    version: raw.version ?? "unknown",
    totalTools: raw.total_tools ?? bySlug.size,
    categories,
    bySlug,
  };

  return catalog;
}

function normaliseTool(categoryName: string, raw: RawCatalogTool): CatalogTool {
  const endpoint = raw.endpoint ?? "";
  return {
    slug: raw.slug ?? endpointToSlug(endpoint),
    name: raw.name ?? endpoint,
    category: raw.category ?? categoryName,
    summary: raw.summary ?? "",
    endpoint,
    method: (raw.method ?? "POST").toUpperCase(),
    status: raw.status ?? "active",
    fields: raw.fields ?? [],
    example: raw.example ?? null,
    chartType: raw.chart_type ?? null,
    requiresPlotly: Boolean(raw.requires_plotly),
    sampleKey: raw.sample_key ?? null,
  };
}

function endpointToSlug(endpoint: string): string {
  return endpoint
    .replace(/^\/api(?:\/v1)?\//, "")
    .replace(/^\//, "")
    .replace(/\//g, ".");
}
