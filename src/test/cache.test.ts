import * as assert from "assert";
import { getCached, setCache } from "../cache";

suite("cache", () => {

  test("returns null for unknown key", () => {
    assert.strictEqual(getCached("unknown-key"), null);
  });

  test("returns cached version after set", () => {
    setCache("gitlab.com/group/mod/aws", "1.0.0");
    assert.strictEqual(getCached("gitlab.com/group/mod/aws"), "1.0.0");
  });

  test("returns null after TTL expires", async () => {
    // Monkey-patch Date.now to simulate expiry
    const original = Date.now;
    setCache("gitlab.com/group/expired/aws", "2.0.0");
    Date.now = () => original() + 6 * 60 * 1000; // 6 minutes ahead
    assert.strictEqual(getCached("gitlab.com/group/expired/aws"), null);
    Date.now = original;
  });

  test("overwrites existing cache entry", () => {
    setCache("gitlab.com/group/mod2/aws", "1.0.0");
    setCache("gitlab.com/group/mod2/aws", "2.0.0");
    assert.strictEqual(getCached("gitlab.com/group/mod2/aws"), "2.0.0");
  });
});
