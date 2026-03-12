function stripComments(line) {
  const idx = line.indexOf("#");
  if (idx === -1) return line;
  // naive but sufficient for our simple config
  return line.slice(0, idx);
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return Number.parseInt(v, 10);
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function parseInlineArray(raw) {
  const inside = raw.trim().slice(1, -1).trim();
  if (!inside) return [];
  return inside
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseScalar);
}

/**
 * Very small YAML subset parser for `.github/pr-review.yml`.
 *
 * Supports:
 * - key: value
 * - key: [a, b]
 * - key:
 *     - item
 *     - item2
 */
export function parseSimpleYaml(input) {
  const lines = input.split(/\r?\n/);
  const out = {};
  let currentKey = null;
  for (const rawLine of lines) {
    const line = stripComments(rawLine).replace(/\t/g, "  ");
    if (!line.trim()) continue;

    const keyMatch = /^([A-Za-z0-9_]+)\s*:\s*(.*)$/.exec(line);
    if (keyMatch) {
      const [, key, rest] = keyMatch;
      currentKey = key;
      const rhs = rest.trim();
      if (!rhs) {
        out[key] = [];
        continue;
      }
      if (rhs.startsWith("[") && rhs.endsWith("]")) {
        out[key] = parseInlineArray(rhs);
        continue;
      }
      out[key] = parseScalar(rhs);
      continue;
    }

    const listItemMatch = /^\s*-\s*(.*)$/.exec(line);
    if (listItemMatch && currentKey) {
      const [, itemRaw] = listItemMatch;
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(parseScalar(itemRaw));
      continue;
    }
  }
  return out;
}

