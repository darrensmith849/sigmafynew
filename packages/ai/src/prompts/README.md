# Prompt registry

## Convention

```
prompts/
  <domain>/
    <name>.v<n>.ts
```

Each file exports two named constants:

```ts
export const PROMPT = `…system prompt text…`;
export const VERSION = "1";
```

## Hard rules

- **Never edit a published version.** A new revision gets a new file (`v2.ts`).
  Logged AI calls reference `(promptId, version)`, so old logs must remain
  resolvable to their exact prompt text.
- **Index every prompt in `index.ts`** so the registry is discoverable.
- **No business logic in prompt files.** They export strings only.
