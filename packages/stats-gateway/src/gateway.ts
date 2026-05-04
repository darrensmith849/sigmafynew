import { isAllowed } from "./allowlist";
import { checkQuota } from "./quota";
import type { GatewayOptions } from "./types";

const PHASE_MINUS_ONE = "stats-gateway not implemented in Phase -1 — see docs/phase-log.md";

export interface StatsGateway {
  call(endpoint: string, init?: RequestInit): Promise<unknown>;
}

export function createStatsGateway(opts: GatewayOptions): StatsGateway {
  return {
    async call(endpoint: string, _init?: RequestInit): Promise<unknown> {
      if (!isAllowed(endpoint)) {
        throw new Error(`stats endpoint not allowlisted: ${endpoint}`);
      }
      const quota = await checkQuota(opts.auth.workspaceId, endpoint);
      if (!quota.ok) {
        throw new Error(`stats quota exceeded for endpoint: ${endpoint}`);
      }
      // Phase 0A: signed fetch to opts.baseUrl + endpoint, log via opts.logger.
      throw new Error(PHASE_MINUS_ONE);
    },
  };
}
