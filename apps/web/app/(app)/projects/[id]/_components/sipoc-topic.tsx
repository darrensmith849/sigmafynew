"use client";

import { useState, useTransition } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@sigmafy/ui";
import type { TemplateTopic } from "@sigmafy/db";
import { saveSipoc, type SipocContent } from "../_actions/save-sipoc";

const COLUMNS: Array<{ key: keyof SipocContent; label: string; placeholder: string }> = [
  { key: "suppliers", label: "Suppliers", placeholder: "e.g. Steel mill" },
  { key: "inputs", label: "Inputs", placeholder: "e.g. Raw steel coil" },
  { key: "process", label: "Process", placeholder: "e.g. Cut to length" },
  { key: "outputs", label: "Outputs", placeholder: "e.g. Finished panels" },
  { key: "customers", label: "Customers", placeholder: "e.g. Assembly plant" },
];

const EMPTY: SipocContent = {
  suppliers: [""],
  inputs: [""],
  process: [""],
  outputs: [""],
  customers: [""],
};

export function SipocTopic(props: {
  projectId: string;
  phaseSlug: string;
  sectionSlug: string;
  topic: TemplateTopic;
  existingSolution: null | { content: unknown; submittedAt: Date };
}) {
  const initial = (props.existingSolution?.content as SipocContent | undefined) ?? EMPTY;
  const [content, setContent] = useState<SipocContent>(() => ({
    suppliers: padTo(initial.suppliers, 3),
    inputs: padTo(initial.inputs, 3),
    process: padTo(initial.process, 3),
    outputs: padTo(initial.outputs, 3),
    customers: padTo(initial.customers, 3),
  }));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(
    props.existingSolution ? formatTime(props.existingSolution.submittedAt) : null,
  );

  const updateCell = (col: keyof SipocContent, idx: number, value: string) => {
    setContent((prev) => {
      const next = { ...prev, [col]: [...prev[col]] };
      next[col][idx] = value;
      return next;
    });
  };

  const onSubmit = () => {
    startTransition(async () => {
      const cleaned: SipocContent = {
        suppliers: content.suppliers.filter(Boolean),
        inputs: content.inputs.filter(Boolean),
        process: content.process.filter(Boolean),
        outputs: content.outputs.filter(Boolean),
        customers: content.customers.filter(Boolean),
      };
      await saveSipoc({
        projectId: props.projectId,
        phaseSlug: props.phaseSlug,
        sectionSlug: props.sectionSlug,
        topicSlug: props.topic.slug,
        content: cleaned,
      });
      setSavedAt(formatTime(new Date()));
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.topic.name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <p className="text-sm text-muted-foreground">{props.topic.description}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.key} className="grid gap-2">
              <Label>{col.label}</Label>
              {content[col.key].map((value, idx) => (
                <Input
                  key={idx}
                  value={value}
                  placeholder={col.placeholder}
                  onChange={(e) => updateCell(col.key, idx, e.currentTarget.value)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {savedAt ? `Last saved ${savedAt}` : "Not saved yet"}
          </span>
          <Button onClick={onSubmit} disabled={pending}>
            {pending ? "Saving…" : "Save SIPOC"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function padTo<T>(arr: T[] | undefined, len: number): T[] {
  const a = (arr ?? []).slice();
  while (a.length < len) a.push("" as T);
  return a;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(d);
}
