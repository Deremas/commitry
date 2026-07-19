import { readFile } from "node:fs/promises";
import { loadConfig } from "../config/load-config.js";
import { validateMessage } from "../validation/validate-message.js";
import { paint } from "../ui/theme.js";

export async function lintCommand(message: string, options: { json?: boolean }, cwd = process.cwd()): Promise<void> {
  const result = validateMessage(message, await loadConfig(cwd));
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else if (result.valid) { console.log(paint.success("✓ Valid Conventional Commit message.")); result.warnings.forEach((warning) => console.log(paint.warning(`! Warning: ${warning}`))); }
  else result.errors.forEach((error) => console.error(paint.danger(`✗ Error: ${error}`)));
  if (!result.valid) process.exitCode = 1;
}

export async function lintFileCommand(path: string, options: { json?: boolean }, cwd = process.cwd()): Promise<void> { return lintCommand(await readFile(path, "utf8"), options, cwd); }
