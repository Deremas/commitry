import { describe, expect, it } from "vitest";
import { detectSecrets } from "../../src/security/secret-detector.js";
import { redactSecrets } from "../../src/security/secret-redactor.js";

describe("secret protection", () => {
  it("reports a finding without retaining its value", () => { const findings = detectSecrets('diff --git a/config.ts b/config.ts\n+++ b/config.ts\n@@ -0,0 +1 @@\n+const apiKey = "super-secret-value";'); expect(findings).toEqual([{ path: "config.ts", line: 1, kind: "secret assignment" }]); expect(JSON.stringify(findings)).not.toContain("super-secret-value"); }); // commitcraft: allow-secret
  it("redacts secret assignments", () => expect(redactSecrets('token = "super-secret-value"')).not.toContain("super-secret-value")); // commitcraft: allow-secret
  it("redacts private-key blocks", () => expect(redactSecrets("-----BEGIN RSA PRIVATE KEY-----\nprivate material\n-----END RSA PRIVATE KEY-----")).toBe("[REDACTED PRIVATE KEY]")); // commitcraft: allow-secret
  it("ignores removed credentials because they are not being committed", () => expect(detectSecrets('+++ b/config.ts\n@@ -1 +0,0 @@\n-token = "super-secret-value"')).toHaveLength(0)); // commitcraft: allow-secret
  it("supports an explicit inline suppression", () => expect(detectSecrets('+++ b/config.ts\n@@ -0,0 +1 @@\n+const apiKey = "documented-placeholder"; // commitcraft: allow-secret')).toHaveLength(0)); // commitcraft: allow-secret
});
