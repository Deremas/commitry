import { loadConfig } from "../config/load-config.js";
import { evaluateRepository } from "./reminder-engine.js";

export async function watchRepository(cwd: string, signal: AbortSignal): Promise<void> {
  const config = await loadConfig(cwd);
  while (!signal.aborted) { try { await evaluateRepository(cwd); } catch (error) { if (!signal.aborted) console.error(`Commitry watcher: ${error instanceof Error ? error.message : String(error)}`); } await delay(config.reminders.pollIntervalSeconds * 1000, signal); }
}
export function delay(milliseconds: number, signal: AbortSignal): Promise<void> { return new Promise((resolve) => { if (signal.aborted) return resolve(); const timer = setTimeout(resolve, milliseconds); signal.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true }); }); }
