import { ghRequest } from "./api.mjs";

function parseRepo(repo) {
  const [owner, name] = (repo || "").split("/");
  if (!owner || !name) throw new Error(`Invalid repo: ${repo}`);
  return { owner, repo: name };
}

export async function upsertPrComment({
  token,
  repo,
  issueNumber,
  marker,
  body,
}) {
  const { owner, repo: repoName } = parseRepo(repo);

  const comments = await ghRequest({
    token,
    method: "GET",
    path: `/repos/${owner}/${repoName}/issues/${issueNumber}/comments`,
    query: { per_page: 100 },
  });

  const existing = Array.isArray(comments)
    ? comments.find((c) => typeof c.body === "string" && c.body.includes(marker))
    : null;

  if (existing?.id) {
    await ghRequest({
      token,
      method: "PATCH",
      path: `/repos/${owner}/${repoName}/issues/comments/${existing.id}`,
      body: { body },
    });
    return { action: "updated", commentId: existing.id };
  }

  const created = await ghRequest({
    token,
    method: "POST",
    path: `/repos/${owner}/${repoName}/issues/${issueNumber}/comments`,
    body: { body },
  });
  return { action: "created", commentId: created?.id };
}

