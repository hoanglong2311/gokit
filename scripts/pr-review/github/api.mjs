const GH_API = "https://api.github.com";

function required(value, name) {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function ghRequest({ token, method, path, query, body }) {
  required(token, "token");
  required(method, "method");
  required(path, "path");

  const url = new URL(`${GH_API}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : null),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `GitHub API ${method} ${path} failed (${res.status}): ${text.slice(0, 800)}`
    );
  }

  if (!text) return null;
  return JSON.parse(text);
}

