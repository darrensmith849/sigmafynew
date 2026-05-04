export interface StatsCallRecord {
  workspaceId: string;
  userId: string;
  endpoint: string;
  status: "ok" | "blocked" | "error";
  latencyMs: number;
  errorMessage?: string;
  occurredAt: string;
}

export interface QuotaResult {
  ok: boolean;
  remaining: number;
  resetAt: string;
}

export interface GatewayLogger {
  log(record: StatsCallRecord): void | Promise<void>;
}

export interface GatewayAuth {
  workspaceId: string;
  userId: string;
}

export interface GatewayOptions {
  baseUrl: string;
  signingSecret: string;
  auth: GatewayAuth;
  logger: GatewayLogger;
}
