import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@sigmafy/ui";
import {
  mockEndpointContracts,
  type MockEndpointContract,
} from "../_data/endpoints";
import { SectionHeader } from "./shell";

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
      <div className="grid gap-6 lg:grid-cols-[3fr_4fr]">
        <EndpointList endpoints={mockEndpointContracts} selectedId={selected.id} />
        <EndpointContractCard endpoint={selected} />
      </div>
    </div>
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
    <Card>
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
    <Card>
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
