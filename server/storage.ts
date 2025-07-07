import { assessments, results, type Assessment, type InsertAssessment, type UpdateAssessment, type Result, type InsertResult } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined>;
  getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined>;
  
  // Results methods
  createResult(result: InsertResult): Promise<Result>;
  getResultsByEmail(email: string): Promise<Result[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private assessments: Map<number, Assessment>;
  private results: Map<number, Result>;
  private assessmentsBySessionId: Map<string, Assessment>;
  currentUserId: number;
  currentAssessmentId: number;
  currentResultId: number;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.results = new Map();
    this.assessmentsBySessionId = new Map();
    this.currentUserId = 1;
    this.currentAssessmentId = 1;
    this.currentResultId = 1;
  }

  async getUser(id: number): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const now = new Date();
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      createdAt: now,
      updatedAt: now,
      currentQuestion: insertAssessment.currentQuestion || 0,
      completed: insertAssessment.completed || 0,
      totalScore: insertAssessment.totalScore || null,
      categoryScores: insertAssessment.categoryScores || null,
    };
    this.assessments.set(id, assessment);
    this.assessmentsBySessionId.set(assessment.sessionId, assessment);
    return assessment;
  }

  async updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined> {
    const assessment = this.assessmentsBySessionId.get(sessionId);
    if (!assessment) return undefined;
    
    const updatedAssessment: Assessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.assessments.set(assessment.id, updatedAssessment);
    this.assessmentsBySessionId.set(sessionId, updatedAssessment);
    return updatedAssessment;
  }

  async getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined> {
    return this.assessmentsBySessionId.get(sessionId);
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this.currentResultId++;
    const result: Result = {
      ...insertResult,
      id,
      createdAt: new Date(),
      companyName: insertResult.companyName || null,
      industry: insertResult.industry || null,
    };
    this.results.set(id, result);
    return result;
  }

  async getResultsByEmail(email: string): Promise<Result[]> {
    return Array.from(this.results.values()).filter(
      (result) => result.userEmail === email,
    );
  }
}

export const storage = new MemStorage();
