import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const logFilePath = path.join(currentDir, "seed-execution.log");

function appendToLogFile(level: string, message: string): void {
  const timestamp = new Date().toISOString();
  const formattedLine = `[${timestamp}] [${level}] ${message}\n`;
  try {
    fs.appendFileSync(logFilePath, formattedLine, "utf8");
  } catch {
    // Abaikan kegagalan penulisan berkas pada filesystem read-only
  }
}

export const seedLogger = {
  info(message: string): void {
    console.info(`ℹ️  [SEED:INFO] ${message}`);
    appendToLogFile("INFO", message);
  },

  success(message: string): void {
    console.info(`✅ [SEED:SUCCESS] ${message}`);
    appendToLogFile("SUCCESS", message);
  },

  warn(message: string): void {
    console.warn(`⚠️  [SEED:WARN] ${message}`);
    appendToLogFile("WARN", message);
  },

  error(message: string, err?: unknown): void {
    const errorDetail = err instanceof Error ? err.message : String(err ?? "");
    const fullMessage = errorDetail ? `${message} — ${errorDetail}` : message;
    console.error(`❌ [SEED:ERROR] ${fullMessage}`);
    appendToLogFile("ERROR", fullMessage);
  },
};
