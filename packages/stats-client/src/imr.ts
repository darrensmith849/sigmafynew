import type {
  IMRRequest,
  IMRResponse,
  StatsClientError,
} from "./types";

const IMR_PATH = "/api/control-charts/imr";

export interface IMRCallOptions {
  baseUrl: string;
  signature?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function imrCall(
  body: IMRRequest,
  opts: IMRCallOptions,
): Promise<IMRResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}${IMR_PATH}`;
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
        `IMR endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = IMR_PATH;
      throw err;
    }
    return (await res.json()) as IMRResponse;
  } finally {
    clearTimeout(timer);
  }
}
