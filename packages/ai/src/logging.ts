import type { AiCallRecord } from "./types";

export interface AiLogger {
  log(record: AiCallRecord): void | Promise<void>;
}

export const consoleAiLogger: AiLogger = {
  log(record: AiCallRecord): void {
    console.log("[ai]", JSON.stringify(record));
  },
};
