import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { git, runGit } from "../git/runner.js";

export type HookMode = "auto" | "native" | "husky" | "none";
export type InstalledHook = "pre-commit" | "commit-msg" | "post-commit" | "pre-push";
export type HookSelection = Partial<Record<InstalledHook, boolean>>;
const start = "# commitcraft:start"; const end = "# commitcraft:end";
const hookBodies: Record<InstalledHook, string> = { "pre-commit": "npx --no-install commitcraft hook pre-commit", "commit-msg": 'npx --no-install commitcraft lint-file "$1"', "post-commit": "npx --no-install commitcraft hook post-commit", "pre-push": "npx --no-install commitcraft hook pre-push" };
const managed = (hook: InstalledHook) => `${start}\n${hookBodies[hook]}\n${end}`;

export interface HookInstallation { mode: Exclude<HookMode, "auto">; directory?: string; installed: InstalledHook[]; alreadyInstalled: InstalledHook[] }

export async function installHooks(root: string, requested: HookMode, selection: HookSelection = {}): Promise<HookInstallation> {
  if (!["auto", "native", "husky", "none"].includes(requested)) throw new Error(`Unknown hook mode: ${requested}`);
  if (requested === "none") return { mode: "none", installed: [], alreadyInstalled: [] };
  const resolved = await resolveHookDirectory(root, requested);
  if (!resolved.directory) return { mode: "none", installed: [], alreadyInstalled: [] };
  await mkdir(resolved.directory, { recursive: true });
  const installed: InstalledHook[] = [], alreadyInstalled: InstalledHook[] = [];
  for (const hook of Object.keys(hookBodies) as InstalledHook[]) { if (selection[hook] === false) continue; const path = join(resolved.directory, hook); const current = await readOptional(path); if (current.includes(start)) { alreadyInstalled.push(hook); continue; } const prefix = current.trim() ? `${current.trimEnd()}\n\n` : "#!/bin/sh\n"; await writeFile(path, `${prefix}${managed(hook)}\n`, { encoding: "utf8", mode: 0o755 }); installed.push(hook); }
  if (resolved.mode === "native") await git(["config", "core.hooksPath", normalizeGitPath(relative(root, resolved.directory))], root);
  return { ...resolved, installed, alreadyInstalled };
}

export async function uninstallHooks(root: string): Promise<InstalledHook[]> {
  const resolved = await resolveHookDirectory(root, "auto", false);
  if (!resolved.directory) return [];
  const removed: InstalledHook[] = [];
  for (const hook of Object.keys(hookBodies) as InstalledHook[]) { const path = join(resolved.directory, hook); const current = await readOptional(path); if (!current.includes(start)) continue; const cleaned = current.replace(new RegExp(`\\n?${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}\\n?`), "\n").trim(); if (!cleaned || cleaned === "#!/bin/sh") await rm(path, { force: true }); else await writeFile(path, `${cleaned}\n`, "utf8"); removed.push(hook); }
  return removed;
}

export async function hookStatus(root: string): Promise<{ directory?: string; secretCheck: boolean; commitMessageValidation: boolean; postCommitReset: boolean; prePushReminder: boolean }> {
  const resolved = await resolveHookDirectory(root, "auto", false);
  return { directory: resolved.directory, secretCheck: resolved.directory ? (await readOptional(join(resolved.directory, "pre-commit"))).includes(start) : false, commitMessageValidation: resolved.directory ? (await readOptional(join(resolved.directory, "commit-msg"))).includes(start) : false, postCommitReset: resolved.directory ? (await readOptional(join(resolved.directory, "post-commit"))).includes(start) : false, prePushReminder: resolved.directory ? (await readOptional(join(resolved.directory, "pre-push"))).includes(start) : false };
}

async function resolveHookDirectory(root: string, requested: HookMode, create = true): Promise<{ mode: "native" | "husky"; directory: string } | { mode: "none"; directory?: undefined }> {
  if (requested === "husky" || (requested === "auto" && await exists(join(root, ".husky")))) return { mode: "husky", directory: join(root, ".husky") };
  const configured = (await runGit(["config", "--get", "core.hooksPath"], root)).stdout.trim();
  if (requested === "auto" && configured) return { mode: "native", directory: isAbsolute(configured) ? configured : resolve(root, configured) };
  if (!create && requested === "auto" && !configured && !await exists(join(root, ".githooks"))) return { mode: "none" };
  return { mode: "native", directory: join(root, ".githooks") };
}
async function readOptional(path: string): Promise<string> { try { return await readFile(path, "utf8"); } catch { return ""; } }
async function exists(path: string): Promise<boolean> { try { await access(path); return true; } catch { return false; } }
function normalizeGitPath(path: string): string { return path.replaceAll("\\", "/"); }
function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
