import {
  paretoCall,
  histogramCall,
  imrCall,
  xbarRCall,
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
} from "@sigmafy/stats-client";
import { isAllowed } from "./allowlist";
import { checkQuota } from "./quota";
import type { GatewayOptions, StatsCallRecord } from "./types";

export interface StatsGateway {
  pareto(request: ParetoRequest): Promise<ParetoResponse>;
  histogram(request: HistogramRequest): Promise<HistogramResponse>;
  imrChart(request: IMRRequest): Promise<IMRResponse>;
  xbarRChart(request: XbarRRequest): Promise<XbarRResponse>;
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
  };
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
