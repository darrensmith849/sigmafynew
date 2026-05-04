import type { AiRequest, AiResponse } from "./types";

export interface AiProvider {
  complete(req: AiRequest): Promise<AiResponse>;
  stream(req: AiRequest): AsyncIterable<string>;
}
