import { db, initializeDatabase } from './db';
import { assessments, results, type Assessment, type InsertAssessment, type UpdateAssessment, type Result, type InsertResult, type CategoryScore } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined>;
  getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  getResultsByEmail(email: string): Promise<Result[]>;
  cacheInsights(sessionId: string, insights: InsightCache): Promise<void>;
  getCachedInsights(sessionId: string): Promise<InsightCache | null>;
}

export interface InsightCache {
  sessionId: string;
  insights: string;
  categoryScores: Record<string, CategoryScore>;
  overallScore: number;
}

export class SQLiteStorage implements IStorage {
  constructor() {
    initializeDatabase();
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    console.log(`Creating assessment with sessionId: ${insertAssessment.sessionId}`);
    try {
      const result = db.insert(assessments).values({
        ...insertAssessment,
        answers: insertAssessment.answers as any,
        categoryScores: insertAssessment.categoryScores as any,
      }).returning().get();

      console.log(`Assessment created successfully with ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }

  async updateAssessment(sessionId: string, updates: UpdateAssessment): Promise<Assessment | undefined> {
    console.log(`Updating assessment with sessionId: ${sessionId}`);
    try {
      const existing = await this.getAssessmentBySessionId(sessionId);
      if (!existing) {
        console.log(`No assessment found with sessionId: ${sessionId}`);
        return undefined;
      }

      const result = db.update(assessments)
        .set({
          ...updates,
          answers: updates.answers as any,
          categoryScores: updates.categoryScores as any,
          updatedAt: new Date(),
        })
        .where(eq(assessments.sessionId, sessionId))
        .returning()
        .get();

      console.log('Assessment updated successfully');
      return result;
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }

  async getAssessmentBySessionId(sessionId: string): Promise<Assessment | undefined> {
    console.log(`Looking for assessment with sessionId: ${sessionId}`);
    try {
      const result = db.select().from(assessments).where(eq(assessments.sessionId, sessionId)).get();
      if (result) {
        console.log(`Assessment found with ID: ${result.id}`);
        if (typeof result.answers === 'string') result.answers = JSON.parse(result.answers);
        if (typeof result.categoryScores === 'string' && result.categoryScores) result.categoryScores = JSON.parse(result.categoryScores);
      } else {
        console.log(`No assessment found with sessionId: ${sessionId}`);
      }
      return result;
    } catch (error) {
      console.error('Error retrieving assessment:', error);
      throw error;
    }
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    console.log(`Creating result for user: ${insertResult.userName}`);
    try {
      const result = db.insert(results).values({
        ...insertResult,
        categoryBreakdown: insertResult.categoryBreakdown as any,
      }).returning().get();
      console.log(`Result created successfully with ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error('Error creating result:', error);
      throw error;
    }
  }

  async getResultsByEmail(email: string): Promise<Result[]> {
    console.log(`Retrieving results for email: ${email}`);
    try {
      const resultsList = db.select().from(results).where(eq(results.userEmail, email)).all();
      resultsList.forEach(r => {
        if (typeof r.categoryBreakdown === 'string') r.categoryBreakdown = JSON.parse(r.categoryBreakdown);
      });
      console.log(`Found ${resultsList.length} results for email: ${email}`);
      return resultsList;
    } catch (error) {
      console.error('Error retrieving results:', error);
      throw error;
    }
  }

  async cacheInsights(sessionId: string, insights: InsightCache): Promise<void> {
    const existing = await this.getAssessmentBySessionId(sessionId);
    if (existing) {
      await this.updateAssessment(sessionId, {
        categoryScores: existing.categoryScores,
        totalScore: existing.totalScore,
      });

      this.insightCache.set(sessionId, {
        ...insights,
        createdAt: new Date(),
      });
      console.log(`Cached insights for session ${sessionId}`);
    }
  }

  async getCachedInsights(sessionId: string): Promise<InsightCache | null> {
    const cached = this.insightCache.get(sessionId);
    if (cached) {
      const ageInMinutes = (Date.now() - cached.createdAt.getTime()) / 1000 / 60;
      if (ageInMinutes < 30) {
        console.log(`Using cached insights for session ${sessionId}`);
        const { createdAt, ...rest } = cached;
        return rest;
      }
    }
    return null;
  }

  private insightCache = new Map<string, InsightCache & { createdAt: Date }>();
}

export const storage = new SQLiteStorage();
