import type {
  CapabilityRequest,
  CapabilityResponse,
  StatsClientError,
} from "./types";

const PATH = "/api/capability/analysis";

export interface CapabilityCallOptions {
  baseUrl: string;
  signature?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export async function capabilityCall(
  body: CapabilityRequest,
  opts: CapabilityCallOptions,
): Promise<CapabilityResponse> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}${PATH}`;
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
        `capability endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = PATH;
      throw err;
    }
    return (await res.json()) as CapabilityResponse;
  } finally {
    clearTimeout(timer);
  }
}
