// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  incomes;
  deductions;
  accountBalances;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.incomes = /* @__PURE__ */ new Map();
    this.deductions = /* @__PURE__ */ new Map();
    this.accountBalances = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Income operations
  async getIncomes(userId) {
    const allIncomes = Array.from(this.incomes.values());
    if (userId) {
      return allIncomes.filter((income) => income.userId === userId);
    }
    return allIncomes;
  }
  async createIncome(insertIncome) {
    const id = randomUUID();
    const income = { ...insertIncome, id, userId: null };
    this.incomes.set(id, income);
    return income;
  }
  async updateIncome(id, updateData) {
    const existingIncome = this.incomes.get(id);
    if (!existingIncome) {
      return void 0;
    }
    const updatedIncome = { ...existingIncome, ...updateData };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }
  async deleteIncome(id) {
    return this.incomes.delete(id);
  }
  // Deduction operations
  async getDeductions(userId) {
    const allDeductions = Array.from(this.deductions.values());
    if (userId) {
      return allDeductions.filter((deduction) => deduction.userId === userId);
    }
    return allDeductions;
  }
  async createDeduction(insertDeduction) {
    const id = randomUUID();
    const deduction = { ...insertDeduction, id, userId: null };
    this.deductions.set(id, deduction);
    return deduction;
  }
  async updateDeduction(id, updateData) {
    const existingDeduction = this.deductions.get(id);
    if (!existingDeduction) {
      return void 0;
    }
    const updatedDeduction = { ...existingDeduction, ...updateData };
    this.deductions.set(id, updatedDeduction);
    return updatedDeduction;
  }
  async deleteDeduction(id) {
    return this.deductions.delete(id);
  }
  // Account balance operations
  async getAccountBalances(userId) {
    const allBalances = Array.from(this.accountBalances.values());
    if (userId) {
      return allBalances.filter((balance) => balance.userId === userId);
    }
    return allBalances.sort((a, b) => a.balanceDate - b.balanceDate);
  }
  async createAccountBalance(insertBalance) {
    const id = randomUUID();
    const balance = {
      ...insertBalance,
      id,
      userId: null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.accountBalances.set(id, balance);
    return balance;
  }
  async updateAccountBalance(id, updateData) {
    const existingBalance = this.accountBalances.get(id);
    if (!existingBalance) {
      return void 0;
    }
    const updatedBalance = { ...existingBalance, ...updateData };
    this.accountBalances.set(id, updatedBalance);
    return updatedBalance;
  }
  async deleteAccountBalance(id) {
    return this.accountBalances.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var incomes = pgTable("incomes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default("monthly"),
  // monthly, weekly, yearly
  incomeDate: integer("income_date").notNull(),
  // day of month (1-31)
  userId: varchar("user_id").references(() => users.id)
});
var deductions = pgTable("deductions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  // housing, transport, insurance, utilities, subscription, other
  deductionDate: integer("deduction_date").notNull(),
  // day of month (1-31)
  userId: varchar("user_id").references(() => users.id)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertIncomeSchema = createInsertSchema(incomes).omit({
  id: true,
  userId: true
});
var insertDeductionSchema = createInsertSchema(deductions).omit({
  id: true,
  userId: true
});
var accountBalances = pgTable("account_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceDate: integer("balance_date").notNull(),
  // day of month (1-31)
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id)
});
var insertAccountBalanceSchema = createInsertSchema(accountBalances).omit({
  id: true,
  userId: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/incomes", async (req, res) => {
    try {
      const incomes2 = await storage.getIncomes();
      res.json(incomes2);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des revenus" });
    }
  });
  app2.post("/api/incomes", async (req, res) => {
    try {
      const validatedData = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la cr\xE9ation du revenu" });
      }
    }
  });
  app2.put("/api/incomes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertIncomeSchema.partial().parse(req.body);
      const income = await storage.updateIncome(id, validatedData);
      if (!income) {
        return res.status(404).json({ message: "Revenu non trouv\xE9" });
      }
      res.json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la mise \xE0 jour du revenu" });
      }
    }
  });
  app2.delete("/api/incomes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIncome(id);
      if (!deleted) {
        return res.status(404).json({ message: "Revenu non trouv\xE9" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du revenu" });
    }
  });
  app2.get("/api/deductions", async (req, res) => {
    try {
      const deductions2 = await storage.getDeductions();
      res.json(deductions2);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des pr\xE9l\xE8vements" });
    }
  });
  app2.post("/api/deductions", async (req, res) => {
    try {
      const validatedData = insertDeductionSchema.parse(req.body);
      const deduction = await storage.createDeduction(validatedData);
      res.status(201).json(deduction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la cr\xE9ation du pr\xE9l\xE8vement" });
      }
    }
  });
  app2.put("/api/deductions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDeductionSchema.partial().parse(req.body);
      const deduction = await storage.updateDeduction(id, validatedData);
      if (!deduction) {
        return res.status(404).json({ message: "Pr\xE9l\xE8vement non trouv\xE9" });
      }
      res.json(deduction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Donn\xE9es invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la mise \xE0 jour du pr\xE9l\xE8vement" });
      }
    }
  });
  app2.delete("/api/deductions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDeduction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Pr\xE9l\xE8vement non trouv\xE9" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du pr\xE9l\xE8vement" });
    }
  });
  app2.get("/api/account-balances", async (req, res) => {
    try {
      const balances = await storage.getAccountBalances();
      res.json(balances);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch account balances" });
    }
  });
  app2.post("/api/account-balances", async (req, res) => {
    try {
      const validatedData = insertAccountBalanceSchema.parse(req.body);
      const balance = await storage.createAccountBalance(validatedData);
      res.status(201).json(balance);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Invalid account balance data" });
    }
  });
  app2.put("/api/account-balances/:id", async (req, res) => {
    try {
      const validatedData = insertAccountBalanceSchema.partial().parse(req.body);
      const balance = await storage.updateAccountBalance(req.params.id, validatedData);
      if (!balance) {
        return res.status(404).json({ error: "Account balance not found" });
      }
      res.json(balance);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Invalid account balance data" });
    }
  });
  app2.delete("/api/account-balances/:id", async (req, res) => {
    try {
      const success = await storage.deleteAccountBalance(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Account balance not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete account balance" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
