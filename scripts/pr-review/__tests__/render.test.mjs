import test from "node:test";
import assert from "node:assert/strict";
import { renderReviewComment } from "../review/render.mjs";

test("renderReviewComment includes marker and reviewed files", () => {
  const body = renderReviewComment({
    marker: "<!-- gokit-pr-review -->",
    repo: "o/r",
    pr: { number: 1, title: "T" },
    selection: {
      selected: [{ filename: "a.go" }],
      ignored: [{ file: { filename: "b.go" }, reason: "noPatch" }],
    },
    provider: "openai",
    model: "m",
    llmText: "## Summary\nok",
  });

  assert.match(body, /<!-- gokit-pr-review -->/);
  assert.match(body, /`a\.go`/);
  assert.match(body, /Ignored files: 1/);
});

