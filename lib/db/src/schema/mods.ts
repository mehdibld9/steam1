import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const modsTable = pgTable("mods", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  gameName: text("game_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  extraImages: text("extra_images"), // JSON-encoded string[]
  downloadCount: integer("download_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  download1Label: text("download1_label"),
  download1Url: text("download1_url"),
  download2Label: text("download2_label"),
  download2Url: text("download2_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertModSchema = createInsertSchema(modsTable).omit({
  id: true,
  downloadCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updateModSchema = insertModSchema.partial();

export type InsertMod = z.infer<typeof insertModSchema>;
export type UpdateMod = z.infer<typeof updateModSchema>;
export type Mod = typeof modsTable.$inferSelect;
