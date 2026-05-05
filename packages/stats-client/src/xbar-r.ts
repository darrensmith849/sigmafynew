import type {
  XbarRRequest,
  XbarRResponse,
  StatsClientError,
} from "./types";

const XBAR_R_PATH = "/api/control-charts/xbar-r";

export interface XbarRCallOptions {
  baseUrl: string;
  signature?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function xbarRCall(
  body: XbarRRequest,
  opts: XbarRCallOptions,
): Promise<XbarRResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}${XBAR_R_PATH}`;
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
        `X-bar R endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = XBAR_R_PATH;
      throw err;
    }
    return (await res.json()) as XbarRResponse;
  } finally {
    clearTimeout(timer);
  }
}
