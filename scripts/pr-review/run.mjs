import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseSimpleYaml } from "./yaml.mjs";
import { getPullRequestContext } from "./github/pr-context.mjs";
import { selectReviewFiles } from "./review/filter.mjs";
import { buildPrompt } from "./review/prompt.mjs";
import { callProvider } from "./review/provider.mjs";
import { renderReviewComment } from "./review/render.mjs";
import { upsertPrComment } from "./github/pr-comment.mjs";

const MARKER = "<!-- gokit-pr-review -->";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function envInt(name, fallback) {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function loadConfig() {
  const configPath = join(process.cwd(), ".github", "pr-review.yml");
  try {
    const raw = await readFile(configPath, "utf8");
    return parseSimpleYaml(raw);
  } catch {
    return {};
  }
}

async function main() {
  const token = requiredEnv("GITHUB_TOKEN");
  const apiKey = process.env.AI_REVIEW_API_KEY;

  if (!apiKey) {
    console.log("AI_REVIEW_API_KEY is not set; skipping AI review.");
    return;
  }

  const repo = process.env.GITHUB_REPOSITORY;
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  const event = JSON.parse(await readFile(eventPath, "utf8"));
  const pr = event.pull_request;
  if (!pr?.number) throw new Error("Not a pull_request event payload.");

  // V1 safety: skip fork PRs (secrets unavailable anyway).
  if (pr.head?.repo?.fork) {
    console.log("Fork PR detected; skipping AI review (v1).");
    return;
  }

  const cfg = await loadConfig();
  const maxFiles = envInt("AI_REVIEW_MAX_FILES", cfg.maxFiles ?? 25);
  const maxPatchChars = envInt("AI_REVIEW_MAX_PATCH_CHARS", cfg.maxPatchChars ?? 120000);

  const prCtx = await getPullRequestContext({
    token,
    repo,
    pullNumber: pr.number,
    maxFiles,
    maxPatchChars,
  });

  const selection = selectReviewFiles(prCtx.files, cfg);
  if (selection.selected.length === 0) {
    console.log("No files selected for review; skipping comment.");
    return;
  }

  const provider = process.env.AI_REVIEW_PROVIDER ?? cfg.provider ?? "openai";
  const model = process.env.AI_REVIEW_MODEL ?? cfg.model ?? "gpt-4.1-mini";
  const baseUrl = process.env.AI_REVIEW_BASE_URL ?? cfg.baseUrl;

  const prompt = buildPrompt({
    repo,
    pr: prCtx.pr,
    files: selection.selected,
    cfg,
  });

  const llmText = await callProvider({
    provider,
    model,
    baseUrl,
    apiKey,
    prompt,
  });

  const body = renderReviewComment({
    marker: MARKER,
    repo,
    pr: prCtx.pr,
    selection,
    provider,
    model,
    llmText,
  });

  await upsertPrComment({
    token,
    repo,
    issueNumber: pr.number,
    marker: MARKER,
    body,
  });
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  // V1: don't block merge on review failures.
  process.exitCode = 0;
});

