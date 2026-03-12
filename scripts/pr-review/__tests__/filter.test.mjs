import test from "node:test";
import assert from "node:assert/strict";
import { selectReviewFiles } from "../review/filter.mjs";

test("selectReviewFiles filters by suffix and patch presence", () => {
  const files = [
    { filename: "a.go", patch: "diff", status: "modified" },
    { filename: "b.md", patch: "diff", status: "modified" },
    { filename: "c.png", patch: "", status: "modified" },
    { filename: "vendor/x.go", patch: "diff", status: "modified" },
  ];

  const cfg = {
    includeSuffixes: [".go"],
    excludePathsContains: ["/vendor/"],
  };

  const res = selectReviewFiles(files, cfg);
  assert.equal(res.selected.length, 1);
  assert.equal(res.selected[0].filename, "a.go");
});

