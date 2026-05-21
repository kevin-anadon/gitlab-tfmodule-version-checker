import * as assert from "assert";
import { extractModules } from "../terraformParser";

suite("terraformParser", () => {

  test("extracts a single module", () => {
    const text = `
module "my_module" {
  source  = "gitlab.com/mygroup/mymodule/aws"
  version = "1.2.3"
}`;
    const modules = extractModules(text);
    assert.strictEqual(modules.length, 1);
    assert.strictEqual(modules[0].name, "my_module");
    assert.strictEqual(modules[0].source, "gitlab.com/mygroup/mymodule/aws");
    assert.strictEqual(modules[0].version, "1.2.3");
  });

  test("extracts multiple modules", () => {
    const text = `
module "mod_a" {
  source  = "gitlab.com/group/mod_a/aws"
  version = "1.0.0"
}
module "mod_b" {
  source  = "gitlab.com/group/mod_b/aws"
  version = "2.0.0"
}`;
    const modules = extractModules(text);
    assert.strictEqual(modules.length, 2);
    assert.strictEqual(modules[0].name, "mod_a");
    assert.strictEqual(modules[1].name, "mod_b");
  });

  test("returns empty array when no modules found", () => {
    const modules = extractModules("resource \"aws_s3_bucket\" \"b\" {}");
    assert.strictEqual(modules.length, 0);
  });

  test("ignores module blocks without version", () => {
    const text = `
module "no_version" {
  source = "gitlab.com/group/mod/aws"
}`;
    const modules = extractModules(text);
    assert.strictEqual(modules.length, 0);
  });

  test("tracks correct version position", () => {
    const text = `module "m" {\n  source  = "gitlab.com/g/m/aws"\n  version = "1.0.0"\n}`;
    const modules = extractModules(text);
    assert.strictEqual(modules.length, 1);
    const extracted = text.slice(modules[0].versionStart, modules[0].versionEnd);
    assert.strictEqual(extracted, "1.0.0");
  });
});
