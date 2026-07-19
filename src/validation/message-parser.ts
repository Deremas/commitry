import type { CommitType } from "../types/commit.js";

export interface ParsedMessage { type: CommitType | string; scope?: string; breaking: boolean; description: string; header: string }
export function parseMessage(message: string): ParsedMessage | null {
  const header = message.trim().split(/\r?\n/, 1)[0] ?? "";
  const match = /^([a-z]+)(?:\(([a-z0-9][a-z0-9._/-]*)\))?(!)?: (.+)$/.exec(header);
  return match ? { type: match[1]!, scope: match[2], breaking: Boolean(match[3]), description: match[4]!, header } : null;
}
