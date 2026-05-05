export { createAiClient, type AiClientEnv } from "./client";
export { consoleAiLogger, type AiLogger } from "./logging";
export type { AiProvider } from "./provider";
export type {
  AiProviderId,
  AiMessage,
  AiRequest,
  AiResponse,
  AiCallRecord,
} from "./types";

// Prompt registry
export * as Prompts from "./prompts";
