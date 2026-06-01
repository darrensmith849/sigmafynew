import { Chip } from "@sigmafy/ui";
import type { FunnelEventType } from "../_data/events";

/**
 * Tiny inline label showing the mock event a CTA would fire and an optional
 * future-action note. Surface-only — nothing is actually emitted.
 */
export function MockEventChip({
  event,
  futureAction,
  className,
}: {
  event: FunnelEventType;
  futureAction?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <Chip tint="ai" className="!text-[10px]">
          Mock event
        </Chip>
        <code className="text-[11px] font-mono text-muted-foreground">
          {event}
        </code>
      </div>
      {futureAction && (
        <p className="text-[11px] italic text-muted-foreground">
          Future action: {futureAction}
        </p>
      )}
    </div>
  );
}
