import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  answers: jsonb("answers").notNull(),
  currentQuestion: integer("current_question").default(0),
  completed: integer("completed").default(0), // 0 = in progress, 1 = completed
  totalScore: integer("total_score"),
  categoryScores: jsonb("category_scores"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  companyName: text("company_name"),
  industry: text("industry"),
  overallScore: integer("overall_score").notNull(),
  categoryBreakdown: jsonb("category_breakdown").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
