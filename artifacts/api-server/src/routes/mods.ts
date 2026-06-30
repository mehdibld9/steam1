import { Router } from "express";
import { db, modsTable, adminSettingsTable } from "@workspace/db";
import { eq, sum, count } from "drizzle-orm";
import { createHash } from "crypto";
import {
  CreateModBody,
  UpdateModBody,
  GetModParams,
  UpdateModParams,
  DeleteModParams,
  TrackDownloadParams,
  SetupAdminBody,
  VerifyAdminBody,
} from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password.trim()).digest("hex");
}

function parseExtraImages(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function serializeExtraImages(images: string[] | undefined): string | undefined {
  if (!images || images.length === 0) return undefined;
  return JSON.stringify(images);
}

async function getStoredHash(): Promise<string | null> {
  const rows = await db.select().from(adminSettingsTable).limit(1);
  return rows[0]?.passwordHash ?? null;
}

async function checkAdmin(password: string): Promise<boolean> {
  const storedHash = await getStoredHash();
  if (!storedHash) return false;
  return hashPassword(password) === storedHash;
}

// GET /admin/status
router.get("/admin/status", async (_req, res) => {
  const storedHash = await getStoredHash();
  res.json({ isSetup: storedHash !== null });
});

// POST /admin/setup — only works if no password is set yet
router.post("/admin/setup", async (req, res) => {
  const parsed = SetupAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const storedHash = await getStoredHash();
  if (storedHash !== null) {
    res.status(409).json({ error: "Admin already set up" });
    return;
  }
  const hash = hashPassword(parsed.data.password);
  await db.insert(adminSettingsTable).values({
    username: parsed.data.username.trim(),
    passwordHash: hash,
  });
  res.json({ success: true });
});

// POST /admin/verify
router.post("/admin/verify", async (req, res) => {
  const parsed = VerifyAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const rows = await db.select().from(adminSettingsTable).limit(1);
  const row = rows[0];
  if (!row) {
    res.status(401).json({ success: false, error: "بيانات الدخول غير صحيحة" });
    return;
  }
  const usernameMatch = parsed.data.username.trim() === row.username;
  const passwordMatch = hashPassword(parsed.data.password) === row.passwordHash;
  if (usernameMatch && passwordMatch) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "بيانات الدخول غير صحيحة" });
  }
});

// GET /mods
router.get("/mods", async (_req, res) => {
  const mods = await db.select().from(modsTable).orderBy(modsTable.createdAt);
  res.json(
    mods.map((m) => ({ ...m, extraImages: parseExtraImages(m.extraImages as string | null) }))
  );
});

// GET /mods/:id
router.get("/mods/:id", async (req, res) => {
  const parsed = GetModParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db.select().from(modsTable).where(eq(modsTable.id, parsed.data.id));
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db
    .update(modsTable)
    .set({ viewCount: mod.viewCount + 1 })
    .where(eq(modsTable.id, mod.id));
  res.json({ ...mod, viewCount: mod.viewCount + 1, extraImages: parseExtraImages(mod.extraImages as string | null) });
});

// POST /mods
router.post("/mods", async (req, res) => {
  const authHeader = req.headers["x-admin-password"];
  const password = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateModBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { extraImages, ...rest } = parsed.data;
  const [mod] = await db
    .insert(modsTable)
    .values({ ...rest, extraImages: serializeExtraImages(extraImages) ?? null })
    .returning();
  res.status(201).json({ ...mod, extraImages: parseExtraImages(mod.extraImages as string | null) });
});

// PUT /mods/:id
router.put("/mods/:id", async (req, res) => {
  const authHeader = req.headers["x-admin-password"];
  const password = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateModParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateModBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { extraImages, ...rest } = parsed.data;
  const [mod] = await db
    .update(modsTable)
    .set({
      ...rest,
      ...(extraImages !== undefined ? { extraImages: serializeExtraImages(extraImages) ?? null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(modsTable.id, params.data.id))
    .returning();
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...mod, extraImages: parseExtraImages(mod.extraImages as string | null) });
});

// DELETE /mods/:id
router.delete("/mods/:id", async (req, res) => {
  const authHeader = req.headers["x-admin-password"];
  const password = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = DeleteModParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db.select().from(modsTable).where(eq(modsTable.id, parsed.data.id));
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(modsTable).where(eq(modsTable.id, parsed.data.id));
  res.status(204).send();
});

// POST /mods/:id/download
router.post("/mods/:id/download", async (req, res) => {
  const parsed = TrackDownloadParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db.select().from(modsTable).where(eq(modsTable.id, parsed.data.id));
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db
    .update(modsTable)
    .set({ downloadCount: mod.downloadCount + 1 })
    .where(eq(modsTable.id, mod.id));
  res.json({ ...mod, downloadCount: mod.downloadCount + 1, extraImages: parseExtraImages(mod.extraImages as string | null) });
});

// GET /stats
router.get("/stats", async (_req, res) => {
  const [stats] = await db
    .select({
      totalMods: count(modsTable.id),
      totalDownloads: sum(modsTable.downloadCount),
      totalViews: sum(modsTable.viewCount),
    })
    .from(modsTable);
  res.json({
    totalMods: stats?.totalMods ?? 0,
    totalDownloads: Number(stats?.totalDownloads ?? 0),
    totalViews: Number(stats?.totalViews ?? 0),
  });
});

export default router;
