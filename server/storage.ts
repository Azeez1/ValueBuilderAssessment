import { assessments, results, type Assessment, type InsertAssessment, type UpdateAssessment, type Result, type InsertResult } from "@shared/schema";

export interface IStorage {
  // Assessment methods
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined>;
  getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined>;
  
  // Results methods
  createResult(result: InsertResult): Promise<Result>;
  getResultsByEmail(email: string): Promise<Result[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<number, Assessment>;
  private results: Map<number, Result>;
  private assessmentsBySessionId: Map<string, Assessment>;
  currentAssessmentId: number;
  currentResultId: number;

  constructor() {
    this.assessments = new Map();
    this.results = new Map();
    this.assessmentsBySessionId = new Map();
    this.currentAssessmentId = 1;
    this.currentResultId = 1;
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

    console.log(`Created assessment with sessionId: ${assessment.sessionId}`);
    console.log(`Total assessments in memory: ${this.assessments.size}`);

    return assessment;
  }

  async updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined> {
    const assessment = this.assessmentsBySessionId.get(sessionId);
    console.log(`Updating sessionId: ${sessionId}, Found: ${assessment ? 'Yes' : 'No'}`);
    if (!assessment) return undefined;
    
    const updatedAssessment: Assessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.assessments.set(assessment.id, updatedAssessment);
    this.assessmentsBySessionId.set(sessionId, updatedAssessment);

    console.log(`Updated assessment with sessionId: ${sessionId}`);
    return updatedAssessment;
  }

  async getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined> {
    const assessment = this.assessmentsBySessionId.get(sessionId);
    console.log(`Looking for sessionId: ${sessionId}`);
    console.log(`Found: ${assessment ? 'Yes' : 'No'}`);
    console.log(`Total sessions in memory: ${this.assessmentsBySessionId.size}`);
    return assessment;
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
