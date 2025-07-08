import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const assessments = sqliteTable('assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().unique(),
  answers: blob('answers', { mode: 'json' }).$type<Record<string, AssessmentAnswer>>().notNull(),
  currentQuestion: integer('current_question').default(0),
  completed: integer('completed').default(0),
  totalScore: integer('total_score'),
  categoryScores: blob('category_scores', { mode: 'json' }).$type<Record<string, CategoryScore>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now'))`),
});

export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assessmentId: integer('assessment_id').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  companyName: text('company_name'),
  industry: text('industry'),
  overallScore: integer('overall_score').notNull(),
  categoryBreakdown: blob('category_breakdown', { mode: 'json' }).$type<Record<string, CategoryScore>>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s','now'))`),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  createdAt: true,
});

export const updateAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type UpdateAssessment = z.infer<typeof updateAssessmentSchema>;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export interface QuestionOption {
  text: string;
  points: number;
}

export interface Question {
  id: string;
  section: string;
  title: string;
  question: string;
  options: QuestionOption[];
  weight?: number;
}

export interface AssessmentAnswer {
  questionId: string;
  value: string;
  points: number;
}

export interface CategoryScore {
  name: string;
  score: number;
  weight: number;
  maxScore: number;
}
