import Link from "next/link";
import { fetchCatalog, type Catalog, type CatalogTool } from "@sigmafy/stats-gateway";
import { Card, Chip, Eyebrow } from "@sigmafy/ui";

const STATS_API_BASE_URL = process.env.STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev";

export const metadata = { title: "Catalogue — Sigmafy Statistics Studio" };

export default async function CatalogPage() {
  let catalog: Catalog | null = null;
  let error: string | null = null;
  try {
    catalog = await fetchCatalog({ baseUrl: STATS_API_BASE_URL });
  } catch (exc) {
    error = exc instanceof Error ? exc.message : String(exc);
  }

  return (
    <section className="mx-auto max-w-shell px-5 py-10 sm:px-8 lg:py-14">
      <Eyebrow>The catalogue</Eyebrow>
      <h1 className="h-display-md mt-2 text-fg">
        {catalog ? `${catalog.totalTools} tools across ${catalog.categories.length} categories` : "Catalogue"}
      </h1>
      <p className="t-lede mt-3 max-w-2xl text-muted">
        Every analysis powered by validated scipy / statsmodels code. Pick any tool to
        run it with your own data — results land in your workspace history.
      </p>

      {error && (
        <div className="mt-8 rounded-card border border-border-strong bg-surface-1 p-5 text-sm">
          <strong className="block text-fg">Catalogue unavailable.</strong>
          <p className="mt-1 text-muted">
            We couldn&apos;t reach the stats engine. Try again in a moment.
          </p>
          <p className="mt-2 text-xs text-muted">
            <code className="font-mono">{error}</code>
          </p>
        </div>
      )}

      {catalog && (
        <div className="mt-10 space-y-12">
          {catalog.categories.map((cat) => (
            <section key={cat.name}>
              <header className="mb-4 flex items-baseline justify-between gap-4 border-b border-border-subtle pb-2">
                <div>
                  <h2 className="h-headline text-fg">{cat.name}</h2>
                  {cat.description && (
                    <p className="mt-1 text-sm text-muted">{cat.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted">{cat.tools.length} tools</span>
              </header>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function ToolCard({ tool }: { tool: CatalogTool }) {
  return (
    <Link
      href={`/t/${tool.slug}` as never}
      className="block transition-shadow hover:shadow-md"
    >
      <Card className="h-full p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-fg">{tool.name}</h3>
          {tool.status !== "active" && (
            <Chip className="bg-surface-2 text-xs text-muted">{tool.status}</Chip>
          )}
        </div>
        <code className="block text-[10px] text-muted">{tool.slug}</code>
        {tool.summary && (
          <p className="mt-2 line-clamp-2 text-xs text-muted">{tool.summary}</p>
        )}
      </Card>
    </Link>
  );
}
