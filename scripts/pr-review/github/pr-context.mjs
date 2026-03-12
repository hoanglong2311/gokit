import { ghRequest } from "./api.mjs";

function parseRepo(repo) {
  const [owner, name] = (repo || "").split("/");
  if (!owner || !name) throw new Error(`Invalid GITHUB_REPOSITORY: ${repo}`);
  return { owner, repo: name };
}

function truncatePatch(patch, maxChars) {
  if (!patch) return "";
  if (patch.length <= maxChars) return patch;
  return patch.slice(0, maxChars) + "\n... (truncated)\n";
}

export async function getPullRequestContext({
  token,
  repo,
  pullNumber,
  maxFiles,
  maxPatchChars,
}) {
  const { owner, repo: repoName } = parseRepo(repo);

  const pr = await ghRequest({
    token,
    method: "GET",
    path: `/repos/${owner}/${repoName}/pulls/${pullNumber}`,
  });

  const files = [];
  let page = 1;
  const perPage = 100;
  while (files.length < maxFiles) {
    const batch = await ghRequest({
      token,
      method: "GET",
      path: `/repos/${owner}/${repoName}/pulls/${pullNumber}/files`,
      query: { per_page: perPage, page },
    });
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const f of batch) {
      if (files.length >= maxFiles) break;
      files.push({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: truncatePatch(f.patch, Math.max(0, maxPatchChars)),
      });
    }
    if (batch.length < perPage) break;
    page += 1;
  }

  return {
    pr: {
      number: pr.number,
      title: pr.title,
      body: pr.body || "",
      baseRef: pr.base?.ref,
      headRef: pr.head?.ref,
      htmlUrl: pr.html_url,
      userLogin: pr.user?.login,
    },
    files,
  };
}

