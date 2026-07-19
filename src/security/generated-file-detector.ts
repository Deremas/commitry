import { minimatch } from "minimatch";
export function matchesAnyPath(path: string, patterns: string[]): boolean { return patterns.some((pattern) => minimatch(path.replaceAll("\\", "/"), pattern, { dot: true, matchBase: true, nocase: process.platform === "win32" })); }
export function isGeneratedFile(path: string, patterns: string[]): boolean { return matchesAnyPath(path, patterns); }
