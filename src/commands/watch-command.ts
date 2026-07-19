import pc from "picocolors";
import { findRepositoryRoot } from "../git/repository.js";
import { watchRepository } from "../reminders/watcher.js";
export async function watchCommand(cwd = process.cwd()): Promise<void> { const root = await findRepositoryRoot(cwd); const controller = new AbortController(); const stop = () => controller.abort(); process.once("SIGINT", stop); process.once("SIGTERM", stop); console.log(pc.green(`Watching ${root}. Press Ctrl+C to stop.`)); try { await watchRepository(root, controller.signal); } finally { process.off("SIGINT", stop); process.off("SIGTERM", stop); } }
