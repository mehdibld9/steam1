#!/usr/bin/env node
// Vercel build script — runs the Vite frontend build then copies output to /public at repo root.
// Using a Node.js script (not shell &&) so the copy is guaranteed to run after the build.
import { execSync } from "child_process";
import { cpSync, rmSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// 1. Run Vite build (outputs to artifacts/arabic-mods/dist/public)
execSync("pnpm --filter @workspace/arabic-mods run build", {
  stdio: "inherit",
  cwd: root,
});

// 2. Copy to /public at repo root (where Vercel looks)
const src = resolve(root, "artifacts/arabic-mods/dist/public");
const dest = resolve(root, "public");

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });

console.log(`✓ Copied build output: ${src} → ${dest}`);
