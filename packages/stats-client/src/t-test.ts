import type {
  OneSampleTRequest,
  OneSampleTResponse,
  TwoSampleTRequest,
  TwoSampleTResponse,
  StatsClientError,
} from "./types";

const ONE_SAMPLE_PATH = "/api/hypothesis/t-test/one-sample";
const TWO_SAMPLE_PATH = "/api/hypothesis/t-test/two-sample";

export interface TTestCallOptions {
  baseUrl: string;
  signature?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

async function postJson<T>(url: string, body: unknown, opts: TTestCallOptions, label: string): Promise<T> {
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
        `${label} endpoint returned ${res.status}: ${text.slice(0, 200)}`,
      ) as StatsClientError;
      err.statusCode = res.status;
      err.endpoint = label;
      throw err;
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function oneSampleTCall(
  body: OneSampleTRequest,
  opts: TTestCallOptions,
): Promise<OneSampleTResponse> {
  return postJson<OneSampleTResponse>(
    `${opts.baseUrl.replace(/\/$/, "")}${ONE_SAMPLE_PATH}`,
    body,
    opts,
    ONE_SAMPLE_PATH,
  );
}

export async function twoSampleTCall(
  body: TwoSampleTRequest,
  opts: TTestCallOptions,
): Promise<TwoSampleTResponse> {
  return postJson<TwoSampleTResponse>(
    `${opts.baseUrl.replace(/\/$/, "")}${TWO_SAMPLE_PATH}`,
    body,
    opts,
    TWO_SAMPLE_PATH,
  );
}
