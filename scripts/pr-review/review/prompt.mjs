function normalizeWhitespace(s) {
  return String(s || "").replace(/\r\n/g, "\n").trim();
}

function formatFiles(files, maxPerFile = 12000) {
  const parts = [];
  for (const f of files) {
    const patch = normalizeWhitespace(f.patch);
    const clipped = patch.length > maxPerFile ? patch.slice(0, maxPerFile) + "\n... (file patch truncated)\n" : patch;
    parts.push(
      [
        `FILE: ${f.filename}`,
        `STATUS: ${f.status ?? "unknown"}`,
        `CHANGES: +${f.additions ?? "?"} -${f.deletions ?? "?"} (total ${f.changes ?? "?"})`,
        "PATCH:",
        clipped,
      ].join("\n")
    );
  }
  return parts.join("\n\n---\n\n");
}

export function buildPrompt({ repo, pr, files, cfg = {} }) {
  const focus = cfg.focusAreas
    ? String(cfg.focusAreas)
    : "correctness, security, performance, error-handling, missing tests";

  const system = [
    "You are a senior backend code reviewer.",
    "Review only the provided diff context.",
    "Be concise and actionable. Avoid style-only nitpicks unless they cause bugs.",
    "If you are uncertain, say so explicitly.",
  ].join("\n");

  const user = [
    `Repository: ${repo}`,
    `PR: #${pr.number} ${pr.title}`,
    pr.body ? `PR description:\n${normalizeWhitespace(pr.body)}` : "",
    "",
    `Focus areas: ${focus}`,
    "",
    "Return a markdown review with the following sections (use exactly these headings):",
    "## Summary",
    "## Findings",
    "## Missing_tests",
    "## Risks",
    "## Suggested_followups",
    "## Confidence_and_limits",
    "",
    "Rules:",
    "- Findings must be specific and reference file paths and functions/symbols when possible.",
    "- Missing_tests: list concrete test cases to add. If none, say 'None'.",
    "- Risks: highlight potential regressions, security implications, and operational risks.",
    "- Confidence_and_limits must mention the review is diff-based and code was not executed.",
    "",
    "Changed files and patches:",
    formatFiles(files, cfg.maxPatchPerFileChars ?? 12000),
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

