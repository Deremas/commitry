import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReminderState } from "../types/reminders.js";
import { emptyReminderState } from "./reminder-state.js";

export class ReminderStore {
  async load(gitDirectory: string): Promise<ReminderState> { try { return { ...emptyReminderState(), ...JSON.parse(await readFile(this.path(gitDirectory), "utf8")) }; } catch { return emptyReminderState(); } }
  async save(gitDirectory: string, state: ReminderState): Promise<void> { const directory = join(gitDirectory, "commitcraft"); await mkdir(directory, { recursive: true }); await writeFile(this.path(gitDirectory), `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 }); }
  private path(gitDirectory: string): string { return join(gitDirectory, "commitcraft", "state.json"); }
}
