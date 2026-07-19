import type { ChangedFile } from "../types/git.js";
export interface AnalyzerInsight { projectType: string; reasons: string[] }
export interface ProjectAnalyzer { projectType: string; analyze(files: ChangedFile[], diff: string): AnalyzerInsight | null }
