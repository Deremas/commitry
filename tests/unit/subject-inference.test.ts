import { describe, expect, it } from "vitest";
import { inferSubject } from "../../src/analysis/subject-inference.js";
import type { ChangedFile } from "../../src/types/git.js";

const file = (path: string, status: ChangedFile["status"] = "modified"): ChangedFile => ({ path, status, staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false });

describe("inferSubject", () => {
  it("describes a project rename and added interactive capability", () => {
    const diff = '-  "name": "commitcraft",\n+  "name": "commitry",\n+const prompt = "Select files to stage";';
    expect(inferSubject("feat", [file("package.json"), file("src/git/staging.ts", "added")], undefined, [], diff)).toBe("rename project to commitry and add interactive staging");
  });

  it("prioritizes a user-facing interactive capability over internal support files", () => {
    const diff = '-  "name": "commitcraft",\n+  "name": "commitry",\n+const prompt = "Stage all changes";';
    const files = [file("package.json"), file("src/git/staging.ts", "added"), file("src/analysis/change-intent.ts", "added")];
    expect(inferSubject("feat", files, undefined, [], diff)).toBe("rename project to commitry and add interactive staging");
  });

  it("avoids repeating fix for broad validation changes", () => {
    expect(inferSubject("fix", [file("src/a.ts"), file("src/b.ts")], undefined, [], "+prevent invalid input")).toBe("prevent invalid behavior");
  });

  it("summarizes broad application work by its affected modules", () => {
    const files = [file("app/credit/invoices/page.tsx"), file("components/sales/pos-interface.tsx"), file("app/finance/expenses/page.tsx"), file("app/inventory/low-stock/page.tsx")];
    expect(inferSubject("feat", files, undefined, [], "+<Button>Settle</Button>")).toBe("improve credit, finance, inventory, and sales workflows");
  });
});
