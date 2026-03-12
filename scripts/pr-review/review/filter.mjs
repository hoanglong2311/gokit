function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function defaultIgnore() {
  return [
    "**/go.sum",
    "**/go.mod",
    "**/package-lock.json",
    "**/pnpm-lock.yaml",
    "**/yarn.lock",
    "**/*.lock",
    "**/*.snap",
    "**/*.min.*",
    "**/*.map",
    "**/dist/**",
    "**/vendor/**",
    "**/node_modules/**",
    "**/.git/**",
  ];
}

function looksLikeBinaryOrPatchless(file) {
  return !file.patch || typeof file.patch !== "string" || file.patch.trim() === "";
}

function hasAnySuffix(path, suffixes) {
  return suffixes.some((s) => path.toLowerCase().endsWith(s));
}

export function selectReviewFiles(files, cfg = {}) {
  const includeSuffixes = asArray(cfg.includeSuffixes).map((s) => String(s));
  const excludeSuffixes = asArray(cfg.excludeSuffixes).map((s) => String(s));
  const excludePathsContains = asArray(cfg.excludePathsContains).map((s) => {
    const needle = String(s);
    const normalized = needle.startsWith("/") ? needle.slice(1) : needle;
    return { needle, normalized };
  });

  const ignored = [];
  const selected = [];

  for (const f of files || []) {
    const filename = f.filename || "";
    if (!filename) continue;

    if (
      excludePathsContains.some(
        ({ needle, normalized }) =>
          filename.includes(needle) || (normalized && filename.includes(normalized))
      )
    ) {
      ignored.push({ file: f, reason: "excludedByPathContains" });
      continue;
    }

    if (excludeSuffixes.length > 0 && hasAnySuffix(filename, excludeSuffixes)) {
      ignored.push({ file: f, reason: "excludedBySuffix" });
      continue;
    }

    if (includeSuffixes.length > 0 && !hasAnySuffix(filename, includeSuffixes)) {
      ignored.push({ file: f, reason: "notIncludedBySuffix" });
      continue;
    }

    if (looksLikeBinaryOrPatchless(f)) {
      ignored.push({ file: f, reason: "noPatch" });
      continue;
    }

    selected.push(f);
  }

  // Cheap default: if user didn't specify includes, still avoid obvious noise.
  if (includeSuffixes.length === 0) {
    const ignoreSuffix = [".md", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const kept = [];
    for (const f of selected) {
      if (hasAnySuffix(f.filename, ignoreSuffix)) {
        ignored.push({ file: f, reason: "defaultNoise" });
      } else {
        kept.push(f);
      }
    }
    return { selected: kept, ignored, meta: { ignore: defaultIgnore() } };
  }

  return { selected, ignored, meta: { ignore: defaultIgnore() } };
}

