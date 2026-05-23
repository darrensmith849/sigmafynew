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

const CATALOG_TTL_MS = 60 * 60 * 1000; // 1 hour
let cached: { at: number; data: Catalog } | null = null;

export function clearCatalogCache(): void {
  cached = null;
}

/**
 * Fetch the catalog. Cached for one hour per process.
 *
 * Pass `baseUrl` of the upstream API (e.g. https://sigmafy-tools.fly.dev).
 * Pass `force: true` to skip the cache.
 */
export async function fetchCatalog(opts: { baseUrl: string; force?: boolean }): Promise<Catalog> {
  const now = Date.now();
  if (!opts.force && cached && now - cached.at < CATALOG_TTL_MS) {
    return cached.data;
  }

  const url = `${opts.baseUrl.replace(/\/$/, "")}/tools`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Catalog fetch failed: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as RawCatalogResponse;

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

  cached = { at: now, data: catalog };
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
