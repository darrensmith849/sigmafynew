import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCatalog } from "@sigmafy/stats-gateway";
import { Chip, Eyebrow } from "@sigmafy/ui";
import { ToolForm } from "./_components/tool-form";

const STATS_API_BASE_URL = process.env.STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `${slug} — Sigmafy Statistics Studio` };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await fetchCatalog({ baseUrl: STATS_API_BASE_URL });
  const tool = catalog.bySlug.get(slug);
  if (!tool) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-shell px-5 py-10 sm:px-8 lg:py-14">
      <nav className="mb-5 text-sm text-muted">
        <Link href="/catalog" className="hover:text-fg">
          ← Catalogue
        </Link>
      </nav>

      <Eyebrow>{tool.category}</Eyebrow>
      <h1 className="h-display-md mt-2 text-fg">{tool.name}</h1>
      {tool.summary && <p className="t-lede mt-3 max-w-2xl text-muted">{tool.summary}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <code>{tool.slug}</code>
        <Chip className="bg-surface-2 text-xs">{tool.method}</Chip>
        {tool.status !== "active" && (
          <Chip className="bg-surface-2 text-xs text-muted">{tool.status}</Chip>
        )}
      </div>

      <div className="mt-10">
        <ToolForm tool={tool} />
      </div>
    </section>
  );
}
