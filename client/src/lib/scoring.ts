import { questions, sectionWeights, coreDriverWeight, supplementalWeight } from "@/data/questions";
import { AssessmentAnswer, CategoryScore } from "@shared/schema";

export function calculateCategoryScores(answers: Record<string, AssessmentAnswer>): Record<string, CategoryScore> {
  const categoryScores: Record<string, CategoryScore> = {};
  
  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, typeof questions>);

  // Calculate score for each section
  Object.entries(questionsBySection).forEach(([section, sectionQuestions]) => {
    let totalScore = 0;
    let maxScore = 0;
    let answeredQuestions = 0;

    sectionQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        totalScore += answer.points * (question.weight || 1);
        answeredQuestions++;
      }
      maxScore += 100 * (question.weight || 1);
    });

    // Normalize score to 0-100 range
    const normalizedScore = answeredQuestions > 0 ? (totalScore / maxScore) * 100 : 0;

    categoryScores[section] = {
      name: section,
      score: Math.round(normalizedScore),
      weight: (sectionWeights as Record<string, number>)[section] || 0,
      maxScore: 100,
    };
  });

  return categoryScores;
}

export function calculateOverallScore(categoryScores: Record<string, CategoryScore>): number {
  const coreDrivers = [
    "Financial Performance",
    "Growth Potential", 
    "Switzerland Structure",
    "Valuation Teeter-Totter",
    "Recurring Revenue",
    "Monopoly Control",
    "Customer Satisfaction",
    "Hub & Spoke"
  ];

  const supplementalDrivers = [
    "Financial Health & Analysis",
    "Market & Competitive Position",
    "Operational Excellence",
    "Human Capital & Organization",
    "Legal, Risk & Compliance",
    "Strategic Assets & Intangibles"
  ];

  // Calculate core drivers weighted score
  let coreScore = 0;
  let coreWeightSum = 0;
  coreDrivers.forEach(driver => {
    if (categoryScores[driver]) {
      coreScore += categoryScores[driver].score * categoryScores[driver].weight;
      coreWeightSum += categoryScores[driver].weight;
    }
  });

  // Calculate supplemental drivers weighted score
  let supplementalScore = 0;
  let supplementalWeightSum = 0;
  supplementalDrivers.forEach(driver => {
    if (categoryScores[driver]) {
      supplementalScore += categoryScores[driver].score * categoryScores[driver].weight;
      supplementalWeightSum += categoryScores[driver].weight;
    }
  });

  // Normalize and combine scores
  const normalizedCoreScore = coreWeightSum > 0 ? (coreScore / coreWeightSum) : 0;
  const normalizedSupplementalScore = supplementalWeightSum > 0 ? (supplementalScore / supplementalWeightSum) : 0;

  const overallScore = (normalizedCoreScore * coreDriverWeight) + (normalizedSupplementalScore * supplementalWeight);

  return Math.round(overallScore);
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 50) return "C-";
  if (score >= 45) return "D+";
  if (score >= 40) return "D";
  return "F";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}
