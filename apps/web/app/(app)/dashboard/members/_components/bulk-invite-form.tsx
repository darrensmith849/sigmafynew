"use client";

import { useState, useTransition } from "react";
import { Button, Label } from "@sigmafy/ui";
import {
  bulkInvite,
  type BulkInviteRow,
  type BulkInviteRowResult,
} from "../_actions/bulk-invite";
import type { InviteRole } from "../_actions/invite";

const VALID_ROLES = new Set<InviteRole>([
  "owner",
  "admin",
  "sponsor",
  "trainer",
  "delegate",
]);

interface ParsedRow {
  rowNumber: number;
  email: string;
  role: InviteRole;
  error?: string;
}

/**
 * Parses CSV-ish text. First row is treated as a header. Recognised columns:
 *   - email  (required)
 *   - role   (optional; defaults to defaultRole)
 *
 * Whitespace tolerated. Lines starting with '#' are comments.
 */
function parseCsv(text: string, defaultRole: InviteRole): { rows: ParsedRow[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length === 0) return { rows: [] };

  // Detect header
  const firstFields = lines[0]!.split(",").map((f) => f.trim().toLowerCase());
  const hasHeader = firstFields.includes("email");
  const cols = hasHeader ? firstFields : ["email", "role"];
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const emailIdx = cols.indexOf("email");
  const roleIdx = cols.indexOf("role");

  const rows: ParsedRow[] = [];
  dataLines.forEach((line, i) => {
    const fields = line.split(",").map((f) => f.trim());
    const email = (emailIdx >= 0 ? fields[emailIdx] : fields[0]) ?? "";
    const roleRaw = roleIdx >= 0 ? (fields[roleIdx] ?? "") : "";
    const lineNum = i + (hasHeader ? 2 : 1);

    let role: InviteRole = defaultRole;
    let error: string | undefined;
    if (!email.includes("@")) error = "invalid or missing email";
    if (roleRaw) {
      const candidate = roleRaw.toLowerCase() as InviteRole;
      if (VALID_ROLES.has(candidate)) {
        role = candidate;
      } else {
        error = error ?? `unknown role: ${roleRaw}`;
      }
    }

    rows.push({ rowNumber: lineNum, email, role, error });
  });

  return { rows };
}

const RESULT_LABEL: Record<BulkInviteRowResult["status"], string> = {
  invited: "Invited",
  reused: "Re-sent",
  already_member: "Already a member",
  error: "Error",
};

const RESULT_STYLE: Record<BulkInviteRowResult["status"], string> = {
  invited: "bg-green-50 text-green-800",
  reused: "bg-sigmafyBlue-50 text-sigmafyBlue-700",
  already_member: "bg-neutral-100 text-neutral-700",
  error: "bg-red-50 text-red-800",
};

export function BulkInviteForm() {
  const [text, setText] = useState("");
  const [defaultRole, setDefaultRole] = useState<InviteRole>("delegate");
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<BulkInviteRowResult[] | null>(null);

  const parsed = text.trim() ? parseCsv(text, defaultRole) : { rows: [] };
  const validRows = parsed.rows.filter((r) => !r.error);
  const invalidRows = parsed.rows.filter((r) => r.error);

  const onSend = () => {
    if (validRows.length === 0) return;
    setResults(null);
    startTransition(async () => {
      const payload: BulkInviteRow[] = validRows.map((r) => ({
        email: r.email,
        role: r.role,
      }));
      const r = await bulkInvite(payload);
      setResults(r.results);
      setText("");
    });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="bulk-csv">Paste CSV</Label>
        <p className="-mt-1 text-xs text-muted-foreground">
          One row per delegate. Header line optional. Columns: <code>email</code>{" "}
          (required), <code>role</code> (optional). Lines starting with{" "}
          <code>#</code> are ignored.
        </p>
        <textarea
          id="bulk-csv"
          rows={6}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          placeholder={"email,role\ndelegate1@example.com,delegate\ndelegate2@example.com,delegate\nsponsor1@example.com,sponsor"}
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm focus:border-sigmafyBlue-400 focus:outline-none focus:ring-2 focus:ring-sigmafyBlue-100"
        />
      </div>

      <div className="grid gap-2">
        <Label>Default role (when CSV omits it)</Label>
        <div className="flex flex-wrap gap-2">
          {(["delegate", "trainer", "sponsor", "admin", "owner"] as InviteRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDefaultRole(r)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                defaultRole === r
                  ? "border-sigmafyBlue-300 bg-sigmafyBlue-50 text-sigmafyBlue-900"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {parsed.rows.length > 0 && (
        <div className="grid gap-2">
          <p className="text-sm font-medium text-foreground">
            Preview — {validRows.length} valid
            {invalidRows.length > 0 && `, ${invalidRows.length} skipped`}
          </p>
          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Line</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.map((r) => (
                  <tr
                    key={r.rowNumber}
                    className={`border-t border-border ${r.error ? "bg-red-50/50" : ""}`}
                  >
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{r.rowNumber}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{r.email}</td>
                    <td className="px-3 py-1.5 text-xs">{r.role}</td>
                    <td className="px-3 py-1.5 text-xs text-red-600">{r.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onSend} disabled={pending || validRows.length === 0}>
          {pending ? "Sending…" : `Send ${validRows.length} invitation${validRows.length === 1 ? "" : "s"}`}
        </Button>
      </div>

      {results && (
        <div className="grid gap-1 rounded-md border border-border p-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Results
          </p>
          {results.map((r, i) => (
            <div key={`${r.email}-${i}`} className="flex items-center justify-between">
              <span className="font-mono text-xs">{r.email}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESULT_STYLE[r.status]}`}
              >
                {RESULT_LABEL[r.status]}
                {r.status === "error" && `: ${r.error}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
