import { minimatch } from "minimatch";
import type { ChangedFile } from "../types/git.js";

const generic = new Set(["src", "app", "lib", "packages", "apps", "test", "tests", "docs"]);

export function inferScope(files: ChangedFile[], mappings: Record<string, string>): { scope?: string; confidence: number; reason?: string } {
  for (const [pattern, scope] of Object.entries(mappings)) if (files.some((file) => minimatch(file.path, pattern))) return { scope, confidence: .98, reason: `scope mapping ${pattern}` };
  const paths = files.map((file) => file.path.replaceAll("\\", "/"));
  if (paths.length && paths.every((path) => /^(prisma|migrations|database)\//i.test(path))) return { scope: "database", confidence: .95, reason: "database paths" };
  if (paths.length && paths.every((path) => /^(package(-lock)?\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(path))) return { scope: "deps", confidence: .95, reason: "dependency manifests" };
  const candidates = paths.map((path) => path.split("/").filter((part) => part && !generic.has(part.toLowerCase()))[0]).filter(Boolean) as string[];
  const scope = candidates[0];
  if (scope && candidates.every((candidate) => candidate === scope)) return { scope: sanitize(scope), confidence: .65, reason: "common top-level module" };
  return { confidence: 0 };
}

function sanitize(value: string): string { return value.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-|-$/g, "").toLowerCase(); }
