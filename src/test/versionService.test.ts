import * as assert from "assert";
import { isOutdated } from "../versionService";

suite("versionService", () => {

  test("returns true when current is older than latest", () => {
    assert.strictEqual(isOutdated("1.0.0", "1.2.0"), true);
  });

  test("returns false when current equals latest", () => {
    assert.strictEqual(isOutdated("1.2.0", "1.2.0"), false);
  });

  test("returns false when current is newer than latest", () => {
    assert.strictEqual(isOutdated("2.0.0", "1.9.9"), false);
  });

  test("returns false for invalid current version", () => {
    assert.strictEqual(isOutdated("not-a-version", "1.0.0"), false);
  });

  test("returns false for invalid latest version", () => {
    assert.strictEqual(isOutdated("1.0.0", "not-a-version"), false);
  });

  test("handles patch version difference", () => {
    assert.strictEqual(isOutdated("1.0.0", "1.0.1"), true);
  });

  test("handles major version difference", () => {
    assert.strictEqual(isOutdated("1.9.9", "2.0.0"), true);
  });
});
