import {
  paretoCall,
  histogramCall,
  imrCall,
  xbarRCall,
  capabilityCall,
  oneSampleTCall,
  twoSampleTCall,
} from "@sigmafy/stats-client";
import type {
  ParetoRequest,
  ParetoResponse,
  HistogramRequest,
  HistogramResponse,
  IMRRequest,
  IMRResponse,
  XbarRRequest,
  XbarRResponse,
  CapabilityRequest,
  CapabilityResponse,
  OneSampleTRequest,
  OneSampleTResponse,
  TwoSampleTRequest,
  TwoSampleTResponse,
} from "@sigmafy/stats-client";
import { isAllowed } from "./allowlist";
import { checkQuota } from "./quota";
import type { GatewayOptions, StatsCallRecord } from "./types";

export interface StatsGateway {
  pareto(request: ParetoRequest): Promise<ParetoResponse>;
  histogram(request: HistogramRequest): Promise<HistogramResponse>;
  imrChart(request: IMRRequest): Promise<IMRResponse>;
  xbarRChart(request: XbarRRequest): Promise<XbarRResponse>;
  capability(request: CapabilityRequest): Promise<CapabilityResponse>;
  oneSampleT(request: OneSampleTRequest): Promise<OneSampleTResponse>;
  twoSampleT(request: TwoSampleTRequest): Promise<TwoSampleTResponse>;
  /**
   * Generic tool runner — accepts any slug present in the Python catalog
   * (e.g. "control-charts.imr", "hypothesis.t-test.one-sample"). Used by
   * the standalone stats-studio app where users browse the full catalog
   * directly. Goes through the same quota + audit pipeline as the typed
   * methods, but skips the 7-tool allowlist (which exists to scope the
   * DMAIC project flow, not as a security boundary).
   *
   * Returns the raw response body plus the X-Request-ID header echoed
   * back from the Python service, so callers can correlate the run with
   * the upstream log + Sentry trace.
   */
  run(slug: string, payload: unknown): Promise<{ result: unknown; requestId: string | null }>;
}

/**
 * Error thrown when `gateway.run()` receives a 4xx/5xx from the upstream
 * Python service. Carries the structured envelope fields so callers can
 * surface stable error codes and link logs by request ID.
 */
export class StatsGatewayError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly requestId: string | null,
  ) {
    super(message);
    this.name = "StatsGatewayError";
  }
}

/**
 * Construct a workspace-scoped stats gateway.
 *
 * Every method enforces the same pipeline: allowlist check → quota check →
 * fetch → audit log. The gateway is the only sanctioned path between app
 * code and the FastAPI service.
 */
export function createStatsGateway(opts: GatewayOptions): StatsGateway {
  return {
    async pareto(request) {
      return runCall("pareto", opts, () =>
        paretoCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async histogram(request) {
      return runCall("histogram", opts, () =>
        histogramCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async imrChart(request) {
      return runCall("imr-chart", opts, () =>
        imrCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async xbarRChart(request) {
      return runCall("xbar-r-chart", opts, () =>
        xbarRCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async capability(request) {
      return runCall("capability", opts, () =>
        capabilityCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async oneSampleT(request) {
      return runCall("one-sample-t", opts, () =>
        oneSampleTCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async twoSampleT(request) {
      return runCall("two-sample-t", opts, () =>
        twoSampleTCall(request, {
          baseUrl: opts.baseUrl,
          signature: opts.signingSecret,
        }),
      );
    },
    async run(slug, payload) {
      return runGeneric(slug, payload, opts);
    },
  };
}

/**
 * Generic call path used by the standalone stats-studio surface. Translates
 * a dotted slug ("control-charts.imr") into the canonical /api/v1/... URL
 * and POSTs the payload. Audit + quota still enforced; the only thing
 * skipped is the typed-method allowlist.
 */
async function runGeneric(
  slug: string,
  payload: unknown,
  opts: GatewayOptions,
): Promise<{ result: unknown; requestId: string | null }> {
  const quota = await checkQuota(opts.auth.workspaceId, slug);
  if (!quota.ok) {
    await record(opts, slug, "blocked", 0, "quota exceeded");
    throw new StatsGatewayError(
      `stats quota exceeded for slug: ${slug}`,
      "quota_exceeded",
      429,
      null,
    );
  }

  const path = "/api/v1/" + slug.replace(/\./g, "/");
  const url = `${opts.baseUrl.replace(/\/$/, "")}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts.signingSecret) {
    headers["Authorization"] = `Bearer ${opts.signingSecret}`;
  }

  const t0 = performance.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const latency = Math.round(performance.now() - t0);
    const requestId = res.headers.get("X-Request-ID");

    if (!res.ok) {
      // Python's structured error envelope: { detail, code, request_id }
      const body = (await res.json().catch(() => ({}))) as {
        detail?: unknown;
        code?: string;
        request_id?: string;
      };
      const message =
        typeof body.detail === "string"
          ? body.detail
          : typeof body.detail === "object"
            ? JSON.stringify(body.detail)
            : `HTTP ${res.status}`;
      const code = body.code ?? `http_${res.status}`;
      const reqId = requestId ?? body.request_id ?? null;
      await record(opts, slug, "error", latency, `${code}: ${message}`);
      throw new StatsGatewayError(message, code, res.status, reqId);
    }

    const result = await res.json();
    await record(opts, slug, "ok", latency);
    return { result, requestId };
  } catch (err) {
    if (err instanceof StatsGatewayError) {
      // Already recorded above
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    await record(opts, slug, "error", Math.round(performance.now() - t0), message);
    throw err;
  }
}

async function runCall<T>(
  endpoint: string,
  opts: GatewayOptions,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isAllowed(endpoint)) {
    await record(opts, endpoint, "blocked", 0, `endpoint not allowlisted: ${endpoint}`);
    throw new Error(`stats endpoint not allowlisted: ${endpoint}`);
  }
  const quota = await checkQuota(opts.auth.workspaceId, endpoint);
  if (!quota.ok) {
    await record(opts, endpoint, "blocked", 0, "quota exceeded");
    throw new Error(`stats quota exceeded for endpoint: ${endpoint}`);
  }
  const t0 = performance.now();
  try {
    const result = await fn();
    await record(opts, endpoint, "ok", Math.round(performance.now() - t0));
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await record(opts, endpoint, "error", Math.round(performance.now() - t0), message);
    throw err;
  }
}

async function record(
  opts: GatewayOptions,
  endpoint: string,
  status: StatsCallRecord["status"],
  latencyMs: number,
  errorMessage?: string,
): Promise<void> {
  await opts.logger.log({
    workspaceId: opts.auth.workspaceId,
    userId: opts.auth.userId,
    endpoint,
    status,
    latencyMs,
    errorMessage,
    occurredAt: new Date().toISOString(),
  });
}
