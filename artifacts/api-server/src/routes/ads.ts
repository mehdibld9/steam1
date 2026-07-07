import { Router } from "express";
import { db, adsTable, adminSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { CreateAdBody, UpdateAdBody, UpdateAdParams, DeleteAdParams } from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password.trim()).digest("hex");
}

async function checkAdmin(password: string): Promise<boolean> {
  const rows = await db.select().from(adminSettingsTable).limit(1);
  const row = rows[0];
  if (!row) return false;
  return hashPassword(password) === row.passwordHash;
}

// GET /ads — public
router.get("/ads", async (_req, res) => {
  const ads = await db.select().from(adsTable).orderBy(adsTable.createdAt);
  res.json(ads);
});

// POST /ads — admin only
router.post("/ads", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  const password = Array.isArray(pw) ? pw[0] : pw;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [ad] = await db.insert(adsTable).values(parsed.data).returning();
  res.status(201).json(ad);
});

// PUT /ads/:id — admin only
router.put("/ads/:id", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  const password = Array.isArray(pw) ? pw[0] : pw;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateAdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [ad] = await db
    .update(adsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(adsTable.id, params.data.id))
    .returning();
  if (!ad) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(ad);
});

// DELETE /ads/:id — admin only
router.delete("/ads/:id", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  const password = Array.isArray(pw) ? pw[0] : pw;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = DeleteAdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [existing] = await db.select().from(adsTable).where(eq(adsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(adsTable).where(eq(adsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
