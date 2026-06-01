import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockEndpointContracts,
  type MockEndpointContract,
} from "../_data/endpoints";
import { SectionHeader } from "./shell";
import { IconUsers, IconRadio, IconGift, IconCog } from "./icons";

const ROUTE = "/white-belt-funnel-preview";

const METHOD_TINT: Record<MockEndpointContract["method"], string> = {
  GET: "projects",
  POST: "training",
  PATCH: "ai",
  DELETE: "spc",
};

export function EndpointsTab({ endpointId }: { endpointId?: string }) {
  const selected =
    mockEndpointContracts.find((e) => e.id === endpointId) ??
    mockEndpointContracts[0]!;
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Step 15 — Mock endpoint contracts"
        title="The future API surface"
        description="Documentation-only contracts. No route handlers are wired in this prototype — these shapes are what the real backend would target."
      />
      <ApiMap endpoints={mockEndpointContracts} />
      <div className="grid gap-6 lg:grid-cols-[3fr_4fr]">
        <EndpointList endpoints={mockEndpointContracts} selectedId={selected.id} />
        <EndpointContractCard endpoint={selected} />
      </div>
    </div>
  );
}

type EpGroup = "learner" | "events" | "interest" | "ops";

const GROUP_DEFS: {
  id: EpGroup;
  label: string;
  detail: string;
  match: (e: MockEndpointContract) => boolean;
  Icon: typeof IconUsers;
  tint: "training" | "ai" | "projects" | "admin";
}[] = [
  {
    id: "learner",
    label: "Learner",
    detail: "Learner profile + offers",
    match: (e) => e.id === "ep_learner" || e.id === "ep_offers",
    Icon: IconUsers,
    tint: "training",
  },
  {
    id: "events",
    label: "Events",
    detail: "Event log + record",
    match: (e) =>
      e.id === "ep_events_list" || e.id === "ep_events_post",
    Icon: IconRadio,
    tint: "ai",
  },
  {
    id: "interest",
    label: "Interest capture",
    detail: "Referral · company · reseller",
    match: (e) =>
      e.id === "ep_referral" ||
      e.id === "ep_company" ||
      e.id === "ep_reseller",
    Icon: IconGift,
    tint: "projects",
  },
  {
    id: "ops",
    label: "Ops",
    detail: "Templates · sales · simulate",
    match: (e) =>
      e.id === "ep_email_templates" ||
      e.id === "ep_sales_leads" ||
      e.id === "ep_simulate_reply",
    Icon: IconCog,
    tint: "admin",
  },
];

function ApiMap({ endpoints }: { endpoints: MockEndpointContract[] }) {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>API map · by purpose</CardTitle>
          <Chip>Documentation only</Chip>
        </div>
        <p className="text-[13px] text-muted-foreground">
          The 10 mock endpoints grouped by what they serve.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GROUP_DEFS.map((g) => {
          const eps = endpoints.filter(g.match);
          const tintCss = `var(--tint-${g.tint})`;
          return (
            <div
              key={g.id}
              className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4"
              style={{
                borderColor: `color-mix(in srgb, ${tintCss} 22%, var(--color-border-subtle))`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border"
                    style={{
                      color: tintCss,
                      backgroundColor: `color-mix(in srgb, ${tintCss} 10%, var(--color-surface))`,
                      borderColor: `color-mix(in srgb, ${tintCss} 22%, transparent)`,
                    }}
                  >
                    <g.Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-fg">{g.label}</p>
                </span>
                <Chip className="!text-[10px]">{eps.length}</Chip>
              </div>
              <p className="text-[12px] text-muted-foreground">{g.detail}</p>
              <ul className="mt-1 flex flex-col gap-1 text-[11px]">
                {eps.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2"
                  >
                    <Chip
                      tint={
                        METHOD_TINT[e.method] as
                          | "projects"
                          | "spc"
                          | "training"
                          | "ai"
                          | "admin"
                          | undefined
                      }
                      className="!text-[9px]"
                    >
                      {e.method}
                    </Chip>
                    <code className="truncate text-muted-foreground">
                      {e.path.replace("/api/mock/white-belt-funnel", "…")}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function EndpointList({
  endpoints,
  selectedId,
}: {
  endpoints: MockEndpointContract[];
  selectedId: string;
}) {
  return (
    <Card data-reveal>
      <CardHeader>
        <CardTitle>Endpoints</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          {endpoints.length} contracts.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border-subtle">
          {endpoints.map((e) => {
            const selected = e.id === selectedId;
            return (
              <li
                key={e.id}
                className={selected ? "bg-surface-2" : "hover:bg-surface-2"}
              >
                <Link
                  href={`${ROUTE}?tab=endpoints&endpoint=${e.id}`}
                  prefetch={false}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <Chip
                    tint={
                      METHOD_TINT[e.method] as
                        | "projects"
                        | "spc"
                        | "training"
                        | "ai"
                        | "admin"
                        | undefined
                    }
                  >
                    {e.method}
                  </Chip>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-fg">
                      <code>{e.path}</code>
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {e.purpose}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function EndpointContractCard({ endpoint }: { endpoint: MockEndpointContract }) {
  return (
    <Card data-reveal>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            <Chip
              className="mr-2"
              tint={
                METHOD_TINT[endpoint.method] as
                  | "projects"
                  | "spc"
                  | "training"
                  | "ai"
                  | "admin"
                  | undefined
              }
            >
              {endpoint.method}
            </Chip>
            <code className="text-[15px] font-mono">{endpoint.path}</code>
          </CardTitle>
        </div>
        <p className="text-[13px] text-muted-foreground">{endpoint.purpose}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-[13px]">
        <Field label="Triggered by" value={endpoint.triggeredBy} />
        <Field label="Request" value={endpoint.requestShape} code />
        <Field label="Response" value={endpoint.responseShape} code />
        <Field label="Notes" value={endpoint.notes} />
        <aside
          className="rounded-card border p-3 text-[12px]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-muted) 6%, var(--color-bg))",
            borderColor: "var(--color-border-subtle)",
          }}
        >
          Documentation only. No route handler is registered for this path in
          the prototype.
        </aside>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  code,
}: {
  label: string;
  value: string;
  code?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      {code ? (
        <pre className="mt-1 overflow-x-auto rounded-md border border-border-subtle bg-surface p-3 text-[12px] font-mono text-fg">
          {value}
        </pre>
      ) : (
        <p className="mt-1 text-fg">{value}</p>
      )}
    </div>
  );
}
