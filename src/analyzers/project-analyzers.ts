import type { ChangedFile } from "../types/git.js";
import type { AnalyzerInsight, ProjectAnalyzer } from "./analyzer.js";
const has = (files: ChangedFile[], pattern: RegExp) => files.some((file) => pattern.test(file.path.replaceAll("\\", "/")));
export const projectAnalyzers: ProjectAnalyzer[] = [
  analyzer("Next.js", (files) => has(files, /^(app|pages)\/(api\/)?|next\.config/), "Next.js route or application-layer changes detected"),
  analyzer("Prisma", (files) => has(files, /^prisma\/(schema\.prisma|migrations\/)/), "Prisma schema or migration changes detected"),
  analyzer("ASP.NET", (files) => has(files, /(^|\/)(Controllers|Services|Migrations)\/|\.(csproj|sln)$/i), "ASP.NET application or project changes detected"),
  analyzer("Laravel", (files) => has(files, /^(app\/Http\/Controllers|database\/migrations)\//), "Laravel controller or migration changes detected"),
  analyzer("Python", (files) => has(files, /\.py$|^(pyproject\.toml|requirements\.txt)$/), "Python source or dependency changes detected"),
  analyzer("Docker", (files) => has(files, /(^|\/)(Dockerfile|compose\.ya?ml|docker-compose\.ya?ml)$/i), "container configuration changes detected")
];
export function collectAnalyzerInsights(projectTypes: string[], files: ChangedFile[], diff: string): AnalyzerInsight[] { return projectAnalyzers.filter((item) => projectTypes.includes(item.projectType)).map((item) => item.analyze(files, diff)).filter((value): value is AnalyzerInsight => Boolean(value)); }
function analyzer(projectType: string, supports: (files: ChangedFile[], diff: string) => boolean, reason: string): ProjectAnalyzer { return { projectType, analyze(files, diff) { return supports(files, diff) ? { projectType, reasons: [reason] } : null; } }; }
