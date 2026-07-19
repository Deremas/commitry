import { minimatch } from "minimatch";
import type { CommitCraftConfig } from "../config/schema.js";
import type { ConcernGroup } from "../types/commit.js";
import type { ChangedFile } from "../types/git.js";
import { classifyChanges } from "./change-classifier.js";
import { inferScope } from "./scope-inference.js";
import { inferSubject } from "./subject-inference.js";

const knownModules = new Set(["auth", "authentication", "inventory", "sales", "booking", "billing", "payments", "orders", "users"]);

export function groupConcerns(files: ChangedFile[], diff: string, config: CommitCraftConfig): ConcernGroup[] {
  const primary = new Map<string, ChangedFile[]>(); const supporting: ChangedFile[] = [];
  for (const file of files) { const key = primaryConcern(file.path, config.scopeMappings); if (key) add(primary, key, file); else supporting.push(file); }
  if (primary.size <= 1) { const combined = [...primary.values()].flat().concat(supporting); return combined.length ? [buildGroup(primary.keys().next().value ?? "project", combined, diff, config)] : []; }
  const result = [...primary].map(([name, group]) => buildGroup(name, group, diff, config));
  const supportGroups = new Map<string, ChangedFile[]>(); for (const file of supporting) add(supportGroups, supportConcern(file.path), file);
  return result.concat([...supportGroups].map(([name, group]) => buildGroup(name, group, diff, config)));
}

function primaryConcern(path: string, mappings: Record<string, string>): string | undefined {
  const normalized = path.replaceAll("\\", "/");
  for (const [pattern, scope] of Object.entries(mappings)) if (minimatch(normalized, pattern, { dot: true, matchBase: true })) return scope;
  const structured = /^(?:src\/)?(?:modules|features)\/([^/]+)\//i.exec(normalized) ?? /^(?:apps|packages)\/([^/]+)\//i.exec(normalized);
  if (structured) return structured[1]!.toLowerCase();
  const simple = /^src\/([^/]+)\//i.exec(normalized)?.[1]?.toLowerCase(); return simple && knownModules.has(simple) ? simple : undefined;
}
function supportConcern(path: string): string { const normalized = path.toLowerCase().replaceAll("\\", "/"); if (/^(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(normalized)) return "deps"; if (/^(readme|docs\/|changelog|license|security|contributing)/.test(normalized) || normalized.endsWith(".md")) return "documentation"; if (/^(tests?|__tests__)\//.test(normalized)) return "tests"; if (/^\.github\//.test(normalized)) return "ci"; return "project"; }
function buildGroup(name: string, files: ChangedFile[], diff: string, config: CommitCraftConfig): ConcernGroup { const classification = classifyChanges(files, diff); const scope = name === "project" ? undefined : inferScope(files, config.scopeMappings).scope; const subject = inferSubject(classification.type, files, scope); return { name, scope, type: classification.type, files: files.map((file) => file.path), suggestion: `${classification.type}${scope ? `(${scope})` : ""}: ${subject}` }; }
function add(map: Map<string, ChangedFile[]>, key: string, file: ChangedFile): void { const group = map.get(key) ?? []; group.push(file); map.set(key, group); }
