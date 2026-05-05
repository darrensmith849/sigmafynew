export type AiProviderId = "openai";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiRequest {
  workspaceId: string;
  userId: string;
  promptId: string;
  promptVersion: string;
  modelId: string;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  /** "json_object" forces the model to return parseable JSON (OpenAI JSON mode). */
  responseFormat?: "json_object";
}

export interface AiResponse {
  text: string;
  modelId: string;
  tokensIn: number;
  tokensOut: number;
}

export interface AiCallRecord {
  workspaceId: string;
  userId: string;
  promptId: string;
  promptVersion: string;
  modelId: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  costUsd: number;
  status: "ok" | "error";
  errorMessage?: string;
  occurredAt: string;
}
