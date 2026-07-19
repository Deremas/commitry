import { loadConfig } from "../config/load-config.js";
import { readRepositorySnapshot } from "../git/repository.js";
import type { ReminderEvaluation } from "../types/reminders.js";
import { notifyTerminal } from "./notifications/terminal-notifier.js";
import { ReminderStore } from "./reminder-store.js";
import { updateReminderState } from "./reminder-state.js";
import { cooldownExpired, evaluateReminder } from "./trigger-evaluator.js";

export async function evaluateRepository(cwd: string, options: { notify?: boolean; now?: Date } = {}): Promise<ReminderEvaluation> {
  const now = options.now ?? new Date(); const [snapshot, config] = await Promise.all([readRepositorySnapshot(cwd), loadConfig(cwd)]); const store = new ReminderStore();
  const state = updateReminderState(snapshot, await store.load(snapshot.gitDirectory), now); const evaluation = evaluateReminder(snapshot, state, config.reminders, now);
  if (evaluation.shouldNotify && cooldownExpired(state, config.reminders.cooldownMinutes, now)) { if (options.notify !== false && config.reminders.notify.includes("terminal")) notifyTerminal(snapshot, evaluation, config.reminders.playTerminalBell); state.lastReminderAt = now.toISOString(); }
  else if (evaluation.shouldNotify) evaluation.shouldNotify = false;
  await store.save(snapshot.gitDirectory, state); return evaluation;
}
