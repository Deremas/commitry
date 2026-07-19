import { findRepositoryRoot } from "../git/repository.js";
import { runWithWatcher } from "../reminders/command-runner.js";
export async function runCommand(parts: string[], cwd = process.cwd()): Promise<void> { if (!parts.length) throw new Error("Provide a command after -- (for example: commitcraft run -- npm run dev)."); const root = await findRepositoryRoot(cwd); process.exitCode = await runWithWatcher(parts[0]!, parts.slice(1), root); }
