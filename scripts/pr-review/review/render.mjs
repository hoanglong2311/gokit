function sanitizeSectionHeadings(md) {
  // Keep user output but avoid heading explosions. We rely on prompt headings.
  return String(md || "").trim();
}

export function renderReviewComment({
  marker,
  repo,
  pr,
  selection,
  provider,
  model,
  llmText,
}) {
  const selectedFiles = selection.selected.map((f) => `- \`${f.filename}\``).join("\n");
  const ignoredCount = selection.ignored.length;

  const header = [
    marker,
    `**AI PR Review** (diff-based, no code execution)`,
    "",
    `- Repo: \`${repo}\``,
    `- PR: #${pr.number} — ${pr.title}`,
    `- Provider: \`${provider}\`  Model: \`${model}\``,
    "",
    "**Reviewed files**",
    selectedFiles || "_None_",
    ignoredCount ? `\n_Ignored files: ${ignoredCount}_` : "",
    "",
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const body = sanitizeSectionHeadings(llmText);
  const footer = [
    "",
    "---",
    "_If this comment is noisy or wrong, adjust `.github/pr-review.yml` or the provider/model vars._",
  ].join("\n");

  return header + body + footer;
}

