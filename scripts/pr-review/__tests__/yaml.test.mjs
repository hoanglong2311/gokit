import test from "node:test";
import assert from "node:assert/strict";
import { parseSimpleYaml } from "../yaml.mjs";

test("parseSimpleYaml supports scalars and lists", () => {
  const cfg = parseSimpleYaml(`
provider: openai
maxFiles: 25
enabled: true
includeSuffixes:
  - .go
  - .md
excludeSuffixes: [.png, .jpg]
`);

  assert.equal(cfg.provider, "openai");
  assert.equal(cfg.maxFiles, 25);
  assert.equal(cfg.enabled, true);
  assert.deepEqual(cfg.includeSuffixes, [".go", ".md"]);
  assert.deepEqual(cfg.excludeSuffixes, [".png", ".jpg"]);
});

