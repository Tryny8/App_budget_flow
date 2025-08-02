import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncomeSchema, insertDeductionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Income routes
  app.get("/api/incomes", async (req, res) => {
    try {
      const incomes = await storage.getIncomes();
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des revenus" });
    }
  });

  app.post("/api/incomes", async (req, res) => {
    try {
      const validatedData = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création du revenu" });
      }
    }
  });

  app.put("/api/incomes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertIncomeSchema.partial().parse(req.body);
      const income = await storage.updateIncome(id, validatedData);
      
      if (!income) {
        return res.status(404).json({ message: "Revenu non trouvé" });
      }
      
      res.json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la mise à jour du revenu" });
      }
    }
  });

  app.delete("/api/incomes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIncome(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Revenu non trouvé" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du revenu" });
    }
  });

  // Deduction routes
  app.get("/api/deductions", async (req, res) => {
    try {
      const deductions = await storage.getDeductions();
      res.json(deductions);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des prélèvements" });
    }
  });

  app.post("/api/deductions", async (req, res) => {
    try {
      const validatedData = insertDeductionSchema.parse(req.body);
      const deduction = await storage.createDeduction(validatedData);
      res.status(201).json(deduction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création du prélèvement" });
      }
    }
  });

  app.put("/api/deductions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDeductionSchema.partial().parse(req.body);
      const deduction = await storage.updateDeduction(id, validatedData);
      
      if (!deduction) {
        return res.status(404).json({ message: "Prélèvement non trouvé" });
      }
      
      res.json(deduction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la mise à jour du prélèvement" });
      }
    }
  });

  app.delete("/api/deductions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDeduction(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Prélèvement non trouvé" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du prélèvement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
