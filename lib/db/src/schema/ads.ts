import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const adsTable = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url").notNull(),
  position: text("position").notNull().default("home"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
