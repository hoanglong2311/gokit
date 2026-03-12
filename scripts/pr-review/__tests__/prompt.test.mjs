import test from "node:test";
import assert from "node:assert/strict";
import { buildPrompt } from "../review/prompt.mjs";

test("buildPrompt includes required headings instruction", () => {
  const prompt = buildPrompt({
    repo: "o/r",
    pr: { number: 1, title: "T", body: "" },
    files: [{ filename: "a.go", patch: "+x", additions: 1, deletions: 0 }],
    cfg: {},
  });

  assert.match(prompt.user, /## Summary/);
  assert.match(prompt.user, /## Findings/);
  assert.match(prompt.user, /FILE: a\.go/);
});

