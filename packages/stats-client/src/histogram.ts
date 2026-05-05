import type { HistogramRequest, HistogramResponse, StatsClientError } from "./types";

const HISTOGRAM_PATH = "/api/graph/histogram";

export interface HistogramCallOptions {
  baseUrl: string;
  signature?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function histogramCall(
  body: HistogramRequest,
  opts: HistogramCallOptions,
): Promise<HistogramResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}${HISTOGRAM_PATH}`;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 30_000);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(opts.signature ? { "x-sigmafy-signature": opts.signature } : {}),
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `histogram endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = HISTOGRAM_PATH;
      throw err;
    }
    return (await res.json()) as HistogramResponse;
  } finally {
    clearTimeout(timer);
  }
}
