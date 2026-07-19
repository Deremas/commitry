import { describe, expect, it } from "vitest";
import { classifyChanges } from "../../src/analysis/change-classifier.js";
import type { ChangedFile } from "../../src/types/git.js";

const file = (path: string, status: ChangedFile["status"] = "modified"): ChangedFile => ({ path, status, staged: true, unstaged: false, untracked: false, conflicted: false, binary: false, generated: false });
describe("classifyChanges", () => {
  it("classifies docs-only changes", () => expect(classifyChanges([file("README.md")], "").type).toBe("docs"));
  it("classifies newly added source as a feature", () => expect(classifyChanges([file("src/cart.ts", "added")], "+export function cart() {}").type).toBe("feat"));
  it("prioritizes fixes for validation changes", () => expect(classifyChanges([file("src/cart.ts")], "+validate total to prevent invalid values").type).toBe("fix"));
  it("recognizes a rename combined with a new capability", () => {
    const diff = '-  "name": "old-name",\n+  "name": "new-name",\n+const prompt = "Select files";';
    expect(classifyChanges([file("package.json"), file("src/git/staging.ts", "added")], diff)).toMatchObject({ type: "feat", confidence: .92 });
  });
  it("does not classify a broad UI workflow change as performance from a stray optimization word", () => {
    const files = [file("app/credit/invoices/page.tsx"), file("components/sales/pos-interface.tsx"), file("lib/access.ts")];
    const diff = '+<Button onClick={settle}>Settle</Button>\n+// optimize the user flow\n+const hasAccess = hasPermission(access, "credit.statement.view");';
    expect(classifyChanges(files, diff)).toMatchObject({ type: "feat" });
  });
  it("requires concrete performance evidence", () => {
    expect(classifyChanges([file("components/list.tsx")], "+const rows = useMemo(() => filterRows(items), [items]);").type).toBe("perf");
  });
  it("does not let one optimization dominate a broad workflow change", () => {
    const files = Array.from({ length: 20 }, (_, index) => file(index === 0 ? "components/sales/pos-interface.tsx" : `app/credit/view-${index}/page.tsx`));
    const diff = "+const rows = useMemo(() => filterRows(items), [items]);\n+<Button onClick={settle}>Settle</Button>";
    expect(classifyChanges(files, diff).type).toBe("feat");
  });
});
