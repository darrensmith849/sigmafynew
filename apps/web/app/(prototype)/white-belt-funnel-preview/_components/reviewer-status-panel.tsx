import { Chip } from "@sigmafy/ui";

const items: {
  label: string;
  value: string;
  tint?: "projects" | "ai";
  pulse?: boolean;
}[] = [
  { label: "Review mode", value: "Surface only", tint: "projects" },
  { label: "Backend", value: "Not connected" },
  { label: "Database", value: "Not touched" },
  { label: "Emails", value: "Not sending" },
  { label: "Ads", value: "Not connected" },
  { label: "Payments", value: "Not connected" },
  { label: "AI agent", value: "Mock only" },
  { label: "Sign-off", value: "Pending", tint: "ai", pulse: true },
];

/**
 * Persistent floating panel anchored to the bottom-right that re-confirms
 * the prototype's safeguards on every screen. Uses the shipped `.glass`
 * utility for a frosted treatment. Only the Sign-off "Pending" chip pulses
 * — every other row is static.
 */
export function ReviewerStatusPanel() {
  return (
    <aside
      aria-label="Reviewer status"
      className="pointer-events-none fixed bottom-4 right-4 z-30 hidden max-w-[300px] lg:block"
    >
      <div
        className="pointer-events-auto rounded-card p-3 text-[11px] shadow-card glass"
        style={{
          borderColor:
            "color-mix(in srgb, var(--tint-training) 22%, var(--color-border))",
        }}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-fg">
            Reviewer status
          </p>
          <Chip tint="training" className="!text-[9px]">
            Prototype
          </Chip>
        </div>
        <dl className="flex flex-col gap-1.5">
          {items.map((i) => (
            <div
              key={i.label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-muted-foreground">{i.label}</dt>
              <dd>
                <Chip
                  tint={i.tint}
                  className={`!py-0 !text-[10px] ${i.pulse ? "pulse-soft" : ""}`}
                >
                  {i.value}
                </Chip>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
