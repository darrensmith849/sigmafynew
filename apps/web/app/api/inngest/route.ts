import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { gradeSipocFn } from "@/lib/inngest/functions/grade-sipoc";

/**
 * Inngest webhook endpoint.
 *
 * - GET: Inngest's health/registration probe.
 * - POST: incoming function executions.
 * - PUT: function registration when Inngest discovers the app.
 *
 * Signature is verified using `INNGEST_SIGNING_KEY` (env). If the key isn't
 * set, the SDK falls back to dev mode and signature checks are skipped —
 * fine in dev, but production must have the key set.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [gradeSipocFn],
});
