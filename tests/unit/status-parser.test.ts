import { describe, expect, it } from "vitest";
import { parsePorcelainV2 } from "../../src/git/status-parser.js";

describe("parsePorcelainV2", () => {
  it("parses branch records and file states", () => {
    const input = "# branch.oid abc123\0# branch.head feature/CC-12-demo\0# branch.upstream origin/main\0# branch.ab +2 -1\0" +
      "1 M. N... 100644 100644 100644 a b src/app.ts\0? new file.ts\0";
    const result = parsePorcelainV2(input);
    expect(result).toMatchObject({ branch: "feature/CC-12-demo", headCommit: "abc123", upstream: "origin/main", ahead: 2, behind: 1 });
    expect(result.files).toEqual(expect.arrayContaining([expect.objectContaining({ path: "src/app.ts", staged: true }), expect.objectContaining({ path: "new file.ts", untracked: true })]));
  });

  it("parses rename records with their original path", () => {
    const result = parsePorcelainV2("2 R. N... 100644 100644 100644 a b R100 new name.ts\0old name.ts\0");
    expect(result.files[0]).toMatchObject({ path: "new name.ts", previousPath: "old name.ts", status: "renamed" });
  });
});
