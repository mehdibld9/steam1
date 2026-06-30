import { Router } from "express";
import { db, modsTable } from "@workspace/db";
import { eq, sum, count } from "drizzle-orm";
import {
  CreateModBody,
  UpdateModBody,
  GetModParams,
  UpdateModParams,
  DeleteModParams,
  TrackDownloadParams,
  VerifyAdminBody,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable must be set");
}

function checkAdmin(req: { headers: { [key: string]: string | string[] | undefined } }): boolean {
  const pw = req.headers["x-admin-password"];
  return pw === ADMIN_PASSWORD;
}

function formatMod(mod: typeof modsTable.$inferSelect) {
  return {
    ...mod,
    createdAt: mod.createdAt.toISOString(),
    updatedAt: mod.updatedAt.toISOString(),
  };
}

// GET /mods
router.get("/mods", async (req, res) => {
  const mods = await db.select().from(modsTable).orderBy(modsTable.createdAt);
  res.json(mods.map(formatMod));
});

// POST /mods
router.post("/mods", async (req, res) => {
  if (!checkAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateModBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const body = parsed.data;
  const [mod] = await db
    .insert(modsTable)
    .values({
      title: body.title,
      gameName: body.gameName,
      description: body.description ?? null,
      imageUrl: body.imageUrl ?? null,
      download1Label: body.download1Label ?? null,
      download1Url: body.download1Url ?? null,
      download2Label: body.download2Label ?? null,
      download2Url: body.download2Url ?? null,
    })
    .returning();
  res.status(201).json(formatMod(mod));
});

// GET /mods/:id
router.get("/mods/:id", async (req, res) => {
  const parsed = GetModParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db
    .select()
    .from(modsTable)
    .where(eq(modsTable.id, parsed.data.id));
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Increment view count
  await db
    .update(modsTable)
    .set({ viewCount: mod.viewCount + 1, updatedAt: new Date() })
    .where(eq(modsTable.id, mod.id));
  res.json(formatMod({ ...mod, viewCount: mod.viewCount + 1 }));
});

// PUT /mods/:id
router.put("/mods/:id", async (req, res) => {
  if (!checkAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const paramParsed = UpdateModParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateModBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const body = bodyParsed.data;
  const [mod] = await db
    .update(modsTable)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.gameName !== undefined && { gameName: body.gameName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.download1Label !== undefined && { download1Label: body.download1Label }),
      ...(body.download1Url !== undefined && { download1Url: body.download1Url }),
      ...(body.download2Label !== undefined && { download2Label: body.download2Label }),
      ...(body.download2Url !== undefined && { download2Url: body.download2Url }),
      updatedAt: new Date(),
    })
    .where(eq(modsTable.id, paramParsed.data.id))
    .returning();
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatMod(mod));
});

// DELETE /mods/:id
router.delete("/mods/:id", async (req, res) => {
  if (!checkAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = DeleteModParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db
    .delete(modsTable)
    .where(eq(modsTable.id, parsed.data.id))
    .returning();
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

// POST /mods/:id/download
router.post("/mods/:id/download", async (req, res) => {
  const parsed = TrackDownloadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [mod] = await db
    .select()
    .from(modsTable)
    .where(eq(modsTable.id, parsed.data.id));
  if (!mod) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(modsTable)
    .set({ downloadCount: mod.downloadCount + 1, updatedAt: new Date() })
    .where(eq(modsTable.id, mod.id))
    .returning();
  res.json(formatMod(updated));
});

// POST /admin/verify
router.post("/admin/verify", async (req, res) => {
  const parsed = VerifyAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  if (parsed.data.password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "Invalid password" });
  }
});

// GET /stats
router.get("/stats", async (req, res) => {
  const [stats] = await db
    .select({
      totalMods: count(modsTable.id),
      totalDownloads: sum(modsTable.downloadCount),
      totalViews: sum(modsTable.viewCount),
    })
    .from(modsTable);
  res.json({
    totalMods: Number(stats?.totalMods ?? 0),
    totalDownloads: Number(stats?.totalDownloads ?? 0),
    totalViews: Number(stats?.totalViews ?? 0),
  });
});

export default router;
