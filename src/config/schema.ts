import { z } from "zod";
import { commitTypes } from "../types/commit.js";

export const configSchema = z.object({
  standard: z.literal("conventional-commits").default("conventional-commits"),
  language: z.string().default("en"),
  headerMaxLength: z.number().int().positive().default(72),
  descriptionCase: z.enum(["lower-case", "any"]).default("lower-case"),
  requireScope: z.boolean().default(false),
  includeBody: z.enum(["auto", "always", "never"]).default("auto"),
  includeIssueFromBranch: z.boolean().default(true),
  issueFooter: z.string().default("Refs"),
  allowedTypes: z.array(z.enum(commitTypes)).default([...commitTypes]),
  scopeMappings: z.record(z.string(), z.string()).default({}),
  ignoredPaths: z.array(z.string()).default(["node_modules/**", "dist/**", "build/**", ".next/**", "coverage/**", "*.min.js", "*.map"]),
  generatedPaths: z.array(z.string()).default(["generated/**", "**/*.generated.ts", "**/*.designer.cs"]),
  issuePatterns: z.array(z.string()).default(["(?:^|/)([A-Z][A-Z0-9]+-[0-9]+)(?:-|/|$)"]),
  reminders: z.object({
    enabled: z.boolean().default(true), pollIntervalSeconds: z.number().int().positive().default(30),
    dirtyAfterMinutes: z.number().nonnegative().default(45), stagedAfterMinutes: z.number().nonnegative().default(15),
    changedFileThreshold: z.number().int().positive().default(8), changedLineThreshold: z.number().int().positive().default(300),
    cooldownMinutes: z.number().nonnegative().default(30), notify: z.array(z.enum(["terminal", "silent"])).default(["terminal"]),
    playTerminalBell: z.boolean().default(false), showSuggestedMessage: z.boolean().default(true), detectMixedConcerns: z.boolean().default(true),
    prePushDirtyPolicy: z.enum(["off", "warn", "confirm", "block"]).default("warn"), disableInCI: z.boolean().default(true)
  }).prefault({}),
  hooks: z.object({
    enabled: z.boolean().default(true), mode: z.enum(["auto", "native", "husky", "none"]).default("auto"),
    commitMessageValidation: z.boolean().default(true), secretCheck: z.boolean().default(true),
    prePushReminder: z.boolean().default(true), resetReminderAfterCommit: z.boolean().default(true)
  }).prefault({}),
  provider: z.object({ type: z.literal("rule-based").default("rule-based") }).default({ type: "rule-based" })
});

export type CommitryConfig = z.infer<typeof configSchema>;
