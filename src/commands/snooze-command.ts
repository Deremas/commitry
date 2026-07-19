import pc from "picocolors";
import { readRepositorySnapshot } from "../git/repository.js";
import { ReminderStore } from "../reminders/reminder-store.js";
import { parseDuration } from "../utils/duration.js";
export async function snoozeCommand(duration: string, cwd = process.cwd()): Promise<void> { const snapshot = await readRepositorySnapshot(cwd); const store = new ReminderStore(); const state = await store.load(snapshot.gitDirectory); const milliseconds = parseDuration(duration); state.snoozedUntil = milliseconds === null ? null : new Date(Date.now() + milliseconds).toISOString(); await store.save(snapshot.gitDirectory, state); console.log(milliseconds === null ? pc.green("Reminders resumed.") : pc.green(`Reminders snoozed until ${state.snoozedUntil}.`)); }
