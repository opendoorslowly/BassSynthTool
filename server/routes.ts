import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPatternSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/patterns", async (_req, res) => {
    const patterns = await storage.getAllPatterns();
    res.json(patterns);
  });

  app.get("/api/patterns/:id", async (req, res) => {
    const pattern = await storage.getPattern(Number(req.params.id));
    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }
    res.json(pattern);
  });

  app.post("/api/patterns", async (req, res) => {
    const result = insertPatternSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid pattern data" });
    }
    const pattern = await storage.createPattern(result.data);
    res.status(201).json(pattern);
  });

  app.patch("/api/patterns/:id", async (req, res) => {
    const result = insertPatternSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid pattern data" });
    }
    
    const updated = await storage.updatePattern(Number(req.params.id), result.data);
    if (!updated) {
      return res.status(404).json({ message: "Pattern not found" });
    }
    res.json(updated);
  });

  app.delete("/api/patterns/:id", async (req, res) => {
    const success = await storage.deletePattern(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Pattern not found" });
    }
    res.status(204).send();
  });

  return createServer(app);
}
