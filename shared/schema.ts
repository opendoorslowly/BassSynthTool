import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patterns = pgTable("patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  steps: jsonb("steps").notNull(),
  tempo: integer("tempo").notNull(),
});

export const insertPatternSchema = createInsertSchema(patterns).pick({
  name: true,
  steps: true,
  tempo: true,
});

export type InsertPattern = z.infer<typeof insertPatternSchema>;
export type Pattern = typeof patterns.$inferSelect;

export const StepSchema = z.object({
  note: z.string(),
  accent: z.boolean(),
  slide: z.boolean(),
  active: z.boolean(),
});

export type Step = z.infer<typeof StepSchema>;
