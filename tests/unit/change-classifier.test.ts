import { describe, expect, it } from "vitest";
import { classifyChanges } from "../../src/analysis/change-classifier.js";
import type { ChangedFile } from "../../src/types/git.js";

const file = (path: string, status: ChangedFile["status"] = "modified"): ChangedFile => ({ path, status, staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false });
describe("classifyChanges", () => {
  it("classifies docs-only changes", () => expect(classifyChanges([file("README.md")], "").type).toBe("docs"));
  it("classifies newly added source as a feature", () => expect(classifyChanges([file("src/cart.ts", "added")], "+export function cart() {}").type).toBe("feat"));
  it("prioritizes fixes for validation changes", () => expect(classifyChanges([file("src/cart.ts")], "+validate total to prevent invalid values").type).toBe("fix"));
});
