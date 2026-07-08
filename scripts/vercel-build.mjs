#!/usr/bin/env node
/**
 * Vercel Build Output API script.
 *
 * Produces:
 *   .vercel/output/static/          ← Vite frontend build
 *   .vercel/output/functions/api/index.func/  ← bundled Express API
 *   .vercel/output/config.json      ← routing rules
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import {
  cpSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// esbuild-plugin-pino uses require() to locate pino's worker files —
// resolve from api-server so it finds pino in that package's node_modules.
globalThis.require = createRequire(resolve(root, "artifacts/api-server/package.json"));
const outputDir = resolve(root, ".vercel/output");

// ── 0. Clean previous Vercel output ─────────────────────────────────────────
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });

// ── 1. Vite frontend build ───────────────────────────────────────────────────
execSync("pnpm --filter @workspace/arabic-mods run build", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, BASE_PATH: "/" },
});

// ── 2. Copy static files to .vercel/output/static/ ──────────────────────────
const staticSrc = resolve(root, "artifacts/arabic-mods/dist/public");
const staticDest = resolve(outputDir, "static");
cpSync(staticSrc, staticDest, { recursive: true });
console.log(`✓ Static:   ${staticSrc} → ${staticDest}`);

// ── 3. Bundle Express API → .vercel/output/functions/api/index.func/ ─────────
const funcDir = resolve(outputDir, "functions/api/index.func");
mkdirSync(funcDir, { recursive: true });

await esbuild({
  entryPoints: [resolve(root, "api/index.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outdir: funcDir,
  outExtension: { ".js": ".mjs" },
  // Resolve workspace package aliases
  alias: {
    "@workspace/db": resolve(root, "lib/db/src/index.ts"),
    "@workspace/api-zod": resolve(root, "lib/api-zod/src/index.ts"),
  },
  // Externalize native / unbundleable packages
  external: [
    "*.node",
    "pg-native",
    "fsevents",
    "bufferutil",
    "utf-8-validate",
  ],
  sourcemap: false,
  logLevel: "info",
  // CJS-in-ESM compat banner (same as api-server/build.mjs)
  banner: {
    js: `import { createRequire as __cr } from 'node:module';
import __path from 'node:path';
import __url from 'node:url';
globalThis.require = __cr(import.meta.url);
globalThis.__filename = __url.fileURLToPath(import.meta.url);
globalThis.__dirname = __path.dirname(globalThis.__filename);
`,
  },
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
});

// Vercel function metadata
writeFileSync(
  resolve(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
    },
    null,
    2
  )
);
console.log(`✓ API func: ${funcDir}`);

// ── 4. Routing config ────────────────────────────────────────────────────────
writeFileSync(
  resolve(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // API → serverless function
        { src: "/api/(.*)", dest: "/api/index" },
        // Static file passthrough
        { handle: "filesystem" },
        // SPA fallback
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2
  )
);
console.log("✓ Vercel output config written");
console.log("\nBuild complete → .vercel/output/");
