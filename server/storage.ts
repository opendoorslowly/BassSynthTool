import { patterns, type Pattern, type InsertPattern } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPattern(id: number): Promise<Pattern | undefined>;
  getAllPatterns(): Promise<Pattern[]>;
  createPattern(pattern: InsertPattern): Promise<Pattern>;
  updatePattern(id: number, pattern: Partial<InsertPattern>): Promise<Pattern | undefined>;
  deletePattern(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getPattern(id: number): Promise<Pattern | undefined> {
    const [pattern] = await db.select().from(patterns).where(eq(patterns.id, id));
    return pattern;
  }

  async getAllPatterns(): Promise<Pattern[]> {
    return await db.select().from(patterns);
  }

  async createPattern(pattern: InsertPattern): Promise<Pattern> {
    const [created] = await db.insert(patterns).values(pattern).returning();
    return created;
  }

  async updatePattern(id: number, update: Partial<InsertPattern>): Promise<Pattern | undefined> {
    const [updated] = await db
      .update(patterns)
      .set(update)
      .where(eq(patterns.id, id))
      .returning();
    return updated;
  }

  async deletePattern(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(patterns)
      .where(eq(patterns.id, id))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();