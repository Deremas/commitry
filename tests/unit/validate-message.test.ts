import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../src/config/defaults.js";
import { validateMessage } from "../../src/validation/validate-message.js";

describe("validateMessage", () => {
  it("accepts a useful Conventional Commit", () => expect(validateMessage("fix(inventory): prevent negative stock balances", defaultConfig).valid).toBe(true));
  it.each(["fixed stock", "fix: changes", "feat(auth): Added login page."])("rejects %s", (message) => expect(validateMessage(message, defaultConfig).valid).toBe(false));
});
