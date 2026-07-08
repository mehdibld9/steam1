import { Router } from "express";
import { db, adminSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password.trim()).digest("hex");
}

async function checkAdmin(password: string): Promise<boolean> {
  const rows = await db.select().from(adminSettingsTable).limit(1);
  const storedHash = rows[0]?.passwordHash ?? null;
  if (!storedHash) return false;
  return hashPassword(password) === storedHash;
}

// GET /settings — public (header needs contact URL without auth)
router.get("/settings", async (_req, res) => {
  const rows = await db.select().from(adminSettingsTable).limit(1);
  const row = rows[0];
  res.json({ contactUrl: row?.contactUrl ?? null });
});

// PUT /settings — admin only
router.put("/settings", async (req, res) => {
  const authHeader = req.headers["x-admin-password"];
  const password = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!password || !(await checkAdmin(password))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const rows = await db.select().from(adminSettingsTable).limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Admin not set up yet" });
    return;
  }
  const [updated] = await db
    .update(adminSettingsTable)
    .set({ contactUrl: parsed.data.contactUrl ?? null, updatedAt: new Date() })
    .where(eq(adminSettingsTable.id, rows[0].id))
    .returning();
  res.json({ contactUrl: updated.contactUrl ?? null });
});

export default router;
