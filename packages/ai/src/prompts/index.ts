/**
 * Prompt registry.
 *
 * Convention: prompts live at `prompts/<domain>/<name>.v<n>.ts` and export
 * named constants `PROMPT_ID`, `VERSION`, `SYSTEM_PROMPT`, plus any
 * domain-specific helpers (`buildXxxUserPrompt`, result type).
 *
 * Never edit a published version. New revisions get a new file.
 */

export * as SipocGradingV1 from "./grading/sipoc.v1";
