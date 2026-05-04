/**
 * Prompt registry.
 *
 * Convention: prompts live at `prompts/<domain>/<name>.v<n>.ts` and export
 * named constants `PROMPT` (the system prompt text) and `VERSION` (e.g. "1").
 *
 * Never edit a published version. New revisions get a new file.
 *
 * Phase -1: empty registry. Phase 0B adds the SIPOC grading prompt.
 */
export const PromptRegistry = {} as const;
