import type { ParetoRequest, ParetoResponse, StatsClientError } from "./types";

const PARETO_PATH = "/api/quality/pareto";

export interface ParetoCallOptions {
  baseUrl: string;
  /** HMAC signature header to be added in Phase 1; ignored for now. */
  signature?: string;
  /** Optional fetch override for tests. */
  fetchImpl?: typeof fetch;
  /** Per-call timeout in ms. */
  timeoutMs?: number;
}

/**
 * Typed wrapper around POST /api/quality/pareto on the FastAPI service.
 *
 * Always called from the gateway (`@sigmafy/stats-gateway`), never from app
 * code directly.
 */
export async function paretoCall(
  body: ParetoRequest,
  opts: ParetoCallOptions,
): Promise<ParetoResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}${PARETO_PATH}`;
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
        `pareto endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = PARETO_PATH;
      throw err;
    }
    return (await res.json()) as ParetoResponse;
  } finally {
    clearTimeout(timer);
  }
}
