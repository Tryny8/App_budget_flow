import { type User, type InsertUser, type Income, type InsertIncome, type Deduction, type InsertDeduction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Income operations
  getIncomes(userId?: string): Promise<Income[]>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: string, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: string): Promise<boolean>;
  
  // Deduction operations
  getDeductions(userId?: string): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: string, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private incomes: Map<string, Income>;
  private deductions: Map<string, Deduction>;

  constructor() {
    this.users = new Map();
    this.incomes = new Map();
    this.deductions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Income operations
  async getIncomes(userId?: string): Promise<Income[]> {
    const allIncomes = Array.from(this.incomes.values());
    if (userId) {
      return allIncomes.filter(income => income.userId === userId);
    }
    return allIncomes;
  }

  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const id = randomUUID();
    const income: Income = { ...insertIncome, id, userId: null };
    this.incomes.set(id, income);
    return income;
  }

  async updateIncome(id: string, updateData: Partial<InsertIncome>): Promise<Income | undefined> {
    const existingIncome = this.incomes.get(id);
    if (!existingIncome) {
      return undefined;
    }
    const updatedIncome = { ...existingIncome, ...updateData };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }

  async deleteIncome(id: string): Promise<boolean> {
    return this.incomes.delete(id);
  }

  // Deduction operations
  async getDeductions(userId?: string): Promise<Deduction[]> {
    const allDeductions = Array.from(this.deductions.values());
    if (userId) {
      return allDeductions.filter(deduction => deduction.userId === userId);
    }
    return allDeductions;
  }

  async createDeduction(insertDeduction: InsertDeduction): Promise<Deduction> {
    const id = randomUUID();
    const deduction: Deduction = { ...insertDeduction, id, userId: null };
    this.deductions.set(id, deduction);
    return deduction;
  }

  async updateDeduction(id: string, updateData: Partial<InsertDeduction>): Promise<Deduction | undefined> {
    const existingDeduction = this.deductions.get(id);
    if (!existingDeduction) {
      return undefined;
    }
    const updatedDeduction = { ...existingDeduction, ...updateData };
    this.deductions.set(id, updatedDeduction);
    return updatedDeduction;
  }

  async deleteDeduction(id: string): Promise<boolean> {
    return this.deductions.delete(id);
  }
}

export const storage = new MemStorage();
