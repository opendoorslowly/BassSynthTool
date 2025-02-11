import { patterns, type Pattern, type InsertPattern } from "@shared/schema";

export interface IStorage {
  getPattern(id: number): Promise<Pattern | undefined>;
  getAllPatterns(): Promise<Pattern[]>;
  createPattern(pattern: InsertPattern): Promise<Pattern>;
  updatePattern(id: number, pattern: Partial<InsertPattern>): Promise<Pattern | undefined>;
  deletePattern(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private patterns: Map<number, Pattern>;
  private currentId: number;

  constructor() {
    this.patterns = new Map();
    this.currentId = 1;
  }

  async getPattern(id: number): Promise<Pattern | undefined> {
    return this.patterns.get(id);
  }

  async getAllPatterns(): Promise<Pattern[]> {
    return Array.from(this.patterns.values());
  }

  async createPattern(insertPattern: InsertPattern): Promise<Pattern> {
    const id = this.currentId++;
    const pattern = { ...insertPattern, id };
    this.patterns.set(id, pattern);
    return pattern;
  }

  async updatePattern(id: number, update: Partial<InsertPattern>): Promise<Pattern | undefined> {
    const existing = await this.getPattern(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.patterns.set(id, updated);
    return updated;
  }

  async deletePattern(id: number): Promise<boolean> {
    return this.patterns.delete(id);
  }
}

export const storage = new MemStorage();
