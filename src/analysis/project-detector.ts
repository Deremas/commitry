import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

export async function detectProjectTypes(root: string): Promise<string[]> {
  const names = new Set(await readdir(root).catch(() => []));
  const types: string[] = [];
  if (["next.config.js", "next.config.mjs", "next.config.ts"].some((name) => names.has(name)) || names.has("app") || names.has("pages")) types.push("Next.js");
  if (names.has("tsconfig.json") || await containsExtension(root, [".ts", ".tsx"])) types.push("TypeScript");
  if (await exists(join(root, "prisma", "schema.prisma"))) types.push("Prisma");
  if (names.has("artisan") && names.has("composer.json")) types.push("Laravel");
  if (["pyproject.toml", "requirements.txt", "manage.py"].some((name) => names.has(name))) types.push("Python");
  if (names.has("pubspec.yaml")) types.push("Flutter");
  if (names.has("go.mod")) types.push("Go");
  if (names.has("Cargo.toml")) types.push("Rust");
  if (["Dockerfile", "docker-compose.yml", "compose.yaml"].some((name) => names.has(name))) types.push("Docker");
  if ([...names].some((name) => name.endsWith(".sln") || name.endsWith(".csproj"))) types.push("ASP.NET");
  return types;
}
async function exists(path: string): Promise<boolean> { try { await access(path); return true; } catch { return false; } }
async function containsExtension(root: string, extensions: string[]): Promise<boolean> { return (await readdir(root).catch(() => [])).some((name) => extensions.some((extension) => name.endsWith(extension))); }
