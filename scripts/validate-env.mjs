/**
 * Build-time environment validation.
 *
 * Runs as `prebuild` (see package.json) so a deployment missing its
 * server credentials fails fast with an actionable message instead of
 * shipping a form that can never deliver leads to GoHighLevel.
 *
 * - GOHIGHLEVEL_API_KEY / GOHIGHLEVEL_LOCATION_ID are REQUIRED:
 *   /api/lead returns 503 without them, so no lead ever reaches the CRM.
 * - Meta CAPI / GTM IDs are optional (tracking degrades gracefully) and
 *   only produce warnings.
 *
 * Values are resolved the same way Next.js does: real environment first,
 * then .env.local, then .env. No dependencies.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in env)) env[key] = value;
  }
  return env;
}

const fileEnv = {
  ...parseEnvFile(join(root, ".env")),
  ...parseEnvFile(join(root, ".env.local")),
};

function get(name) {
  const value = process.env[name] ?? fileEnv[name] ?? "";
  return value.trim();
}

const REQUIRED = ["GOHIGHLEVEL_API_KEY", "GOHIGHLEVEL_LOCATION_ID"];
const OPTIONAL = [
  "FACEBOOK_PIXEL_ID",
  "NEXT_PUBLIC_FACEBOOK_PIXEL_ID",
  "FACEBOOK_ACCESS_TOKEN",
  "NEXT_PUBLIC_GTM_ID",
];

let failed = false;

for (const name of REQUIRED) {
  if (!get(name)) {
    console.error(
      `[env] Missing required ${name}. Leads cannot reach GoHighLevel without it.\n` +
        `      Set it in .env.local for local builds and in the Netlify site settings\n` +
        `      (Site settings → Environment variables) for deployments.`,
    );
    failed = true;
  }
}

for (const name of OPTIONAL) {
  if (!get(name)) {
    console.warn(`[env] Warning: ${name} is not set — related tracking is skipped.`);
  }
}

if (get("FACEBOOK_PIXEL_ID") || get("NEXT_PUBLIC_FACEBOOK_PIXEL_ID")) {
  if (!get("FACEBOOK_ACCESS_TOKEN")) {
    console.warn(
      "[env] Warning: a Facebook Pixel ID is set but FACEBOOK_ACCESS_TOKEN is not — Meta CAPI Lead events are skipped.",
    );
  }
}

if (failed) {
  console.error("[env] Build aborted: required environment variables are missing.");
  process.exit(1);
}

console.log("[env] Required environment variables are set.");
