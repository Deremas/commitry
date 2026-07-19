import { describe, expect, it } from "vitest";
import { inferScope } from "../../src/analysis/scope-inference.js";
import type { ChangedFile } from "../../src/types/git.js";

const file = (path: string): ChangedFile => ({ path, status: "modified", staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false });
describe("inferScope", () => {
  it("uses explicit mappings first", () => expect(inferScope([file("src/modules/inventory/stock.ts")], { "src/modules/inventory/**": "inventory" }).scope).toBe("inventory"));
  it("recognizes database changes", () => expect(inferScope([file("prisma/schema.prisma")], {}).scope).toBe("database"));
});
