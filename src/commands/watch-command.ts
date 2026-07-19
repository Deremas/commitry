import { findRepositoryRoot } from "../git/repository.js";
import { watchRepository } from "../reminders/watcher.js";
import { paint, section } from "../ui/theme.js";
export async function watchCommand(cwd = process.cwd()): Promise<void> { const root = await findRepositoryRoot(cwd); const controller = new AbortController(); const stop = () => controller.abort(); process.once("SIGINT", stop); process.once("SIGTERM", stop); console.log(`${section("Watching repository")}\n${paint.info(root)}\n${paint.muted("Press Ctrl+C to stop.")}`); try { await watchRepository(root, controller.signal); } finally { process.off("SIGINT", stop); process.off("SIGTERM", stop); } }
