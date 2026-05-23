"use client";

import { useState, useTransition } from "react";
import type { CatalogTool, CatalogField } from "@sigmafy/stats-gateway";
import { Button, Card, Chip } from "@sigmafy/ui";
import { runTool, type RunToolResult } from "../_actions/run-tool";
import { ToolResult } from "./tool-result";

interface ToolFormProps {
  tool: CatalogTool;
}

export function ToolForm({ tool }: ToolFormProps) {
  const [mode, setMode] = useState<"form" | "json">("form");
  const [inputs, setInputs] = useState<Record<string, string>>(() => initFormValues(tool));
  const [rawJson, setRawJson] = useState<string>(() =>
    tool.example ? JSON.stringify(tool.example, null, 2) : "{}",
  );
  const [result, setResult] = useState<RunToolResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let payload: Record<string, unknown>;
    try {
      payload = mode === "json" ? JSON.parse(rawJson) : parseFormValues(tool.fields, inputs);
    } catch (exc) {
      setResult({
        ok: false,
        runId: null,
        code: "input_parse_error",
        message: exc instanceof Error ? exc.message : String(exc),
        requestId: null,
      });
      return;
    }
    setResult(null);
    startTransition(async () => {
      const res = await runTool({ slug: tool.slug, payload });
      setResult(res);
    });
  }

  function loadExample() {
    if (mode === "json") {
      setRawJson(tool.example ? JSON.stringify(tool.example, null, 2) : "{}");
    } else {
      setInputs(initFormValues(tool));
    }
  }

  function clearAll() {
    if (mode === "json") {
      setRawJson("{}");
    } else {
      const cleared: Record<string, string> = {};
      for (const f of tool.fields) cleared[f.key] = "";
      setInputs(cleared);
    }
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Chip
              role="button"
              tabIndex={0}
              onClick={() => setMode("form")}
              className={mode === "form" ? "bg-accent text-accent-fg" : "cursor-pointer"}
            >
              Form
            </Chip>
            <Chip
              role="button"
              tabIndex={0}
              onClick={() => setMode("json")}
              className={mode === "json" ? "bg-accent text-accent-fg" : "cursor-pointer"}
            >
              Raw JSON
            </Chip>
          </div>
          <div className="flex gap-2">
            {tool.example && (
              <Button type="button" variant="ghost" onClick={loadExample} disabled={pending}>
                Load example
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={clearAll} disabled={pending}>
              Clear
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "form" ? (
            tool.fields.length === 0 ? (
              <p className="text-sm text-muted">
                This tool has no declared form fields in the catalogue. Switch to Raw JSON
                to send a payload.
              </p>
            ) : (
              tool.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={inputs[field.key] ?? ""}
                  onChange={(val) =>
                    setInputs((prev) => ({ ...prev, [field.key]: val }))
                  }
                />
              ))
            )
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-fg">
                Request body (JSON)
              </label>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                rows={Math.max(8, Math.min(20, rawJson.split("\n").length))}
                className="block w-full rounded-md border border-border-subtle bg-surface-1 p-3 font-mono text-xs text-fg"
                spellCheck={false}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Running…" : "Run analysis"}
            </Button>
            {tool.sampleKey && (
              <a
                href={`${process.env.NEXT_PUBLIC_STATS_API_BASE_URL ?? "https://sigmafy-tools.fly.dev"}/api/samples/${tool.sampleKey}.csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-fg"
              >
                Download sample CSV ↗
              </a>
            )}
          </div>
        </form>
      </Card>

      {result && <ToolResult result={result} tool={tool} />}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CatalogField;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `field-${field.key}`;
  const isOptional = field.type.endsWith("_optional");
  const isTextarea =
    field.type === "array" || field.type === "intarray" || field.type === "json";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-fg">
        {field.label}
        {isOptional && <span className="ml-2 text-xs text-muted">(optional)</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === "json" ? 4 : 2}
          placeholder={field.placeholder}
          className="block w-full rounded-md border border-border-subtle bg-surface-1 p-2 font-mono text-xs text-fg"
          spellCheck={false}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-md border border-border-subtle bg-surface-1 p-2 text-sm text-fg"
        >
          <option value="">— select —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === "int" || field.type === "float" || field.type === "float_optional" ? "number" : "text"}
          step={field.type === "int" ? "1" : "any"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="block w-full rounded-md border border-border-subtle bg-surface-1 p-2 text-sm text-fg"
        />
      )}
    </div>
  );
}

function initFormValues(tool: CatalogTool): Record<string, string> {
  const out: Record<string, string> = {};
  const example = tool.example ?? {};
  for (const f of tool.fields) {
    out[f.key] = serializeForField(example[f.key], f.type);
  }
  return out;
}

function serializeForField(value: unknown, type: string): string {
  if (value === undefined || value === null) return "";
  if (type === "array" || type === "intarray") {
    return Array.isArray(value) ? value.join(", ") : String(value);
  }
  if (type === "json") {
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function parseFormValues(
  fields: readonly CatalogField[],
  inputs: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = (inputs[f.key] ?? "").trim();
    if (raw === "") {
      if (f.type.endsWith("_optional")) continue;
      // Required-but-empty: let the server return a validation error
      continue;
    }
    switch (f.type) {
      case "array":
        out[f.key] = parseNumericList(raw, false, f.label);
        break;
      case "intarray":
        out[f.key] = parseNumericList(raw, true, f.label);
        break;
      case "json":
        out[f.key] = JSON.parse(raw);
        break;
      case "int":
        out[f.key] = parseInt(raw, 10);
        break;
      case "float":
      case "float_optional":
        out[f.key] = parseFloat(raw);
        break;
      default:
        out[f.key] = raw;
    }
  }
  return out;
}

function parseNumericList(raw: string, asInt: boolean, label: string): number[] {
  const parts = raw.split(/[,\s]+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    throw new Error(`'${label}' needs at least one number`);
  }
  return parts.map((p, i) => {
    if (!/^-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(p)) {
      throw new Error(`'${label}' value '${p}' (position ${i + 1}) is not a number`);
    }
    return asInt ? parseInt(p, 10) : parseFloat(p);
  });
}
