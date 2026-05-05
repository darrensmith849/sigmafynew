import { Inngest, EventSchemas } from "inngest";

/**
 * Strongly-typed Inngest client for Sigmafy.
 *
 * Events live in `Events` below. Adding an event = add a key here, then
 * write a function in `lib/inngest/functions/` that consumes it.
 *
 * `INNGEST_EVENT_KEY` is read from env at module load. In dev (and when the
 * key is missing), Inngest's SDK falls back to its dev mode and the events
 * land in the local dev server if running, or are no-ops otherwise. That
 * means our app code can fire-and-forget events without guarding for
 * "Inngest not configured" — but the grading job won't actually run until
 * keys are set on Vercel.
 */

export type Events = {
  "topic.grading.requested": {
    data: {
      workspaceId: string;
      projectId: string;
      topicSolutionId: string;
      topicKind: "sipoc";
      topicPath: string;
      submitterUserId: string;
      submitterEmail: string;
      submitterName: string | null;
    };
  };
};

export const inngest = new Inngest({
  id: "sigmafy",
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
});
