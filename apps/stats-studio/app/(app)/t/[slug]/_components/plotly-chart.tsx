"use client";

import { useEffect, useRef, useState } from "react";

interface PlotlyFigure {
  data?: unknown[];
  layout?: Record<string, unknown>;
}

type PlotlyApi = {
  newPlot: (
    el: HTMLDivElement,
    data: unknown[],
    layout?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<unknown>;
  purge: (el: HTMLDivElement) => void;
};

/**
 * Lazy-loaded Plotly renderer. The plotly.js-dist-min bundle is ~3 MB —
 * imported only when this component mounts so users who never look at a
 * chart never pay for it.
 *
 * Universal renderer: every figure dict the Python service returns plots
 * correctly without per-chart-type mapping.
 */
export function PlotlyChart({ figure }: { figure: PlotlyFigure }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!figure || !ref.current) return;
    let cancelled = false;
    let plotEl: HTMLDivElement | null = null;
    let plotly: PlotlyApi | null = null;

    import("plotly.js-dist-min")
      .then((mod) => {
        if (cancelled || !ref.current) return;
        // plotly.js-dist-min may export the API as `default` or namespace
        // depending on bundler / interop settings. Probe both.
        const api = ((mod as { default?: unknown }).default ?? mod) as PlotlyApi;
        plotly = api;
        plotEl = ref.current;
        return api.newPlot(
          plotEl,
          (figure.data ?? []) as unknown[],
          (figure.layout ?? {}) as Record<string, unknown>,
          { responsive: true, displaylogo: false },
        );
      })
      .catch((exc) => {
        if (!cancelled) {
          setError(exc instanceof Error ? exc.message : String(exc));
        }
      });

    return () => {
      cancelled = true;
      if (plotEl && plotly) {
        try {
          plotly.purge(plotEl);
        } catch {
          /* node removed by React */
        }
      }
    };
  }, [figure]);

  if (error) {
    return (
      <div className="rounded-md border border-border-strong bg-surface-1 p-4 text-sm text-muted">
        Chart failed to load: <code>{error}</code>
      </div>
    );
  }

  return <div ref={ref} className="min-h-[360px] w-full" />;
}
