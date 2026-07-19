import type { CommitryConfig } from "../config/schema.js";
import { parseMessage } from "./message-parser.js";

export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[] }
const vague = /^(changes|updates?|fix(es|ed)?|stuff|work|wip)$/i;

export function validateMessage(message: string, config: CommitryConfig): ValidationResult {
  const parsed = parseMessage(message);
  const errors: string[] = [], warnings: string[] = [];
  if (!parsed) return { valid: false, errors: ["Message must match <type>[optional scope][!]: <description>"], warnings };
  if (!config.allowedTypes.includes(parsed.type as never)) errors.push(`Type must be one of: ${config.allowedTypes.join(", ")}`);
  if (config.requireScope && !parsed.scope) errors.push("A scope is required");
  if (parsed.header.length > config.headerMaxLength) errors.push(`Header exceeds ${config.headerMaxLength} characters`);
  if (parsed.description.endsWith(".")) errors.push("Description must not end with a period");
  if (config.descriptionCase === "lower-case" && /^[A-Z]/.test(parsed.description)) errors.push("Description must start with a lowercase letter");
  if (vague.test(parsed.description)) errors.push("Description is too vague");
  if (/^(added|fixed|updated|removed|changed)\b/.test(parsed.description)) warnings.push("Prefer imperative mood (for example, add instead of added)");
  return { valid: errors.length === 0, errors, warnings };
}
