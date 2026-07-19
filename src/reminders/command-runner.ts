import { spawn } from "node:child_process";
import { isAbsolute } from "node:path";
import { watchRepository } from "./watcher.js";

export async function runWithWatcher(command: string, args: string[], cwd: string): Promise<number> {
  const controller = new AbortController();
  const watcher = watchRepository(cwd, controller.signal);
  const needsWindowsShell = process.platform === "win32" && !isAbsolute(command) && !/\.(exe|com)$/i.test(command);
  const code = await new Promise<number>((resolve, reject) => { const child = spawn(command, args, { cwd, shell: needsWindowsShell, stdio: "inherit", env: process.env }); child.on("error", reject); child.on("close", (value) => resolve(value ?? 1)); });
  controller.abort(); await watcher.catch(() => undefined); return code;
}
