import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../src/config/defaults.js";
import { groupConcerns } from "../../src/analysis/concern-grouper.js";
import type { ChangedFile } from "../../src/types/git.js";
const file = (path: string): ChangedFile => ({ path, status: "modified", staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false });
describe("groupConcerns", () => { it("separates unrelated modules and dependencies", () => { const groups = groupConcerns([file("src/inventory/stock.ts"), file("src/auth/login.ts"), file("package.json")], "", defaultConfig); expect(groups.map((group) => group.name)).toEqual(["inventory", "auth", "deps"]); }); it("keeps one module together", () => expect(groupConcerns([file("src/inventory/stock.ts"), file("src/inventory/item.ts")], "", defaultConfig)).toHaveLength(1)); });
