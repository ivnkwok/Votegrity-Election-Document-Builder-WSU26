import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, "../dist/assets");

const DEFAULT_LIMIT_BYTES = 500_000;
const SPECIAL_LIMITS = [
  {
    label: "pdf worker",
    match: /pdf\.worker/i,
    limitBytes: 1_200_000,
  },
];

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function resolveLimit(name) {
  return SPECIAL_LIMITS.find((entry) => entry.match.test(name)) ?? {
    label: "app chunk",
    limitBytes: DEFAULT_LIMIT_BYTES,
  };
}

const assetNames = await readdir(assetsDir);
const bundleAssets = assetNames.filter((name) => /\.(css|js|mjs)$/i.test(name));
const violations = [];

for (const name of bundleAssets) {
  const assetPath = path.join(assetsDir, name);
  const { size } = await stat(assetPath);
  const limit = resolveLimit(name);

  if (size > limit.limitBytes) {
    violations.push({
      name,
      size,
      label: limit.label,
      limitBytes: limit.limitBytes,
    });
  }
}

if (violations.length > 0) {
  console.error("Bundle size budget exceeded:");
  for (const violation of violations) {
    console.error(
      `- ${violation.name} (${violation.label}) is ${formatBytes(violation.size)} `
      + `but the limit is ${formatBytes(violation.limitBytes)}`
    );
  }
  process.exit(1);
}

console.log(`Bundle size check passed for ${bundleAssets.length} emitted assets.`);
