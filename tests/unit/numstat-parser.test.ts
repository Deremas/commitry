import { describe, expect, it } from "vitest";
import { parseNumstat } from "../../src/git/numstat-parser.js";
describe("parseNumstat", () => {
  it("parses ordinary and binary records", () => { const result = parseNumstat("12\t3\tsrc/app.ts\0-\t-\tlogo.png\0"); expect(result.get("src/app.ts")).toMatchObject({ additions: 12, deletions: 3, binary: false }); expect(result.get("logo.png")?.binary).toBe(true); });
  it("uses the destination path for a NUL-delimited rename", () => { const result = parseNumstat("2\t1\t\0old name.ts\0new name.ts\0"); expect(result.get("new name.ts")).toMatchObject({ additions: 2, deletions: 1 }); expect(result.has("old name.ts")).toBe(false); });
});
