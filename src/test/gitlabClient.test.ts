import * as assert from "assert";
import { getLatestTerraformVersion } from "../gitlabClient";

function mockFetch(response: object | null, ok = true) {
  (global as any).fetch = async () => ({
    ok,
    status: ok ? 200 : 401,
    json: async () => response
  });
}

suite("gitlabClient", () => {

  test("returns version and projectUrl on success", async () => {
    mockFetch({
      version: "1.5.0",
      versions: ["1.5.0", "1.4.0"],
      source: "https://gitlab.com/mygroup/mymodule"
    });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/mygroup/mymodule/aws",
      "fake-token"
    );

    assert.ok(result);
    assert.strictEqual(result!.version, "1.5.0");
    assert.strictEqual(result!.projectUrl, "https://gitlab.com/mygroup/mymodule");
  });

  test("strips leading v from version", async () => {
    mockFetch({
      version: "v2.0.0",
      versions: ["v2.0.0"],
      source: "https://gitlab.com/mygroup/mymodule"
    });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/mygroup/mymodule/aws",
      "fake-token"
    );

    assert.strictEqual(result!.version, "2.0.0");
  });

  test("returns null on non-ok response", async () => {
    mockFetch(null, false);

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/mygroup/mymodule/aws",
      "fake-token"
    );

    assert.strictEqual(result, null);
  });

  test("returns null when response missing version", async () => {
    mockFetch({ source: "https://gitlab.com/mygroup/mymodule" });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/mygroup/mymodule/aws",
      "fake-token"
    );

    assert.strictEqual(result, null);
  });

  test("returns null when response missing source", async () => {
    mockFetch({ version: "1.0.0" });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/mygroup/mymodule/aws",
      "fake-token"
    );

    assert.strictEqual(result, null);
  });

  test("returns null for invalid source format", async () => {
    mockFetch({ version: "1.0.0", source: "https://gitlab.com/mygroup/mymodule" });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/onlytwoparts",
      "fake-token"
    );

    assert.strictEqual(result, null);
  });

  test("handles nested subgroup namespace", async () => {
    mockFetch({
      version: "3.1.0",
      versions: ["3.1.0"],
      source: "https://gitlab.com/org/subgroup/mymodule"
    });

    const result = await getLatestTerraformVersion(
      "https://gitlab.com",
      "gitlab.com/org/mymodule/aws",
      "fake-token"
    );

    assert.ok(result);
    assert.strictEqual(result!.version, "3.1.0");
  });
});
