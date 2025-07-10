import OpenAI from 'openai';
import { AssessmentAnswer, CategoryScore } from '@shared/schema';
import { questions } from '../client/src/data/questions';
import {
  coreDriverDescriptions,
  supplementalDriverDescriptions,
} from './reportTemplates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_MODEL = 'gpt-4.1';

function getCategoryDetails(category: string) {
  return (
    (coreDriverDescriptions as Record<string, any>)[category] ||
    (supplementalDriverDescriptions as Record<string, any>)[category]
  );
}

export async function generateAIInsights(
  answers: Record<string, AssessmentAnswer>,
  categoryScores: Record<string, CategoryScore>,
  overallScore: number,
  companyName?: string,
  industry?: string
): Promise<string> {
  try {
    const answerContext = buildAnswerContext(answers);
    const prompt = `
You are a senior business valuation expert analyzing a Value Builder Assessment. Generate a comprehensive, personalized executive summary based on the following assessment results:

Company: ${companyName || 'Not specified'}
Industry: ${industry || 'Not specified'}
Overall Score: ${overallScore}/100

CATEGORY SCORES:
${Object.entries(categoryScores)
  .map(([name, score]) => `- ${name}: ${score.score}/100`)
  .join('\n')}

DETAILED ANSWER ANALYSIS:
${answerContext}

Based on this assessment, provide:

1. **Executive Summary** (2-3 paragraphs)
   - Overall business health and valuation readiness
   - Key strengths that enhance value
   - Critical areas requiring immediate attention

2. **Strategic Insights** (3-4 key insights)
   - Patterns and relationships between different scores
   - Hidden opportunities based on the specific answers
   - Risk factors that could impact valuation

3. **Priority Action Items** (Top 5 recommendations)
   - Specific, actionable steps based on lowest scores
   - Quick wins that could improve valuation
   - Long-term strategic initiatives

4. **Value Enhancement Potential**
   - Estimated value improvement if key issues addressed
   - Timeline for implementing changes
   - Expected ROI on improvements

Format the response in a professional, executive-ready style. Use simple bullet points with • instead of markdown. Avoid excessive headers with ### or ---. Be specific and reference actual scores and answers. Avoid generic advice.
`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a senior business valuation expert with 20+ years of experience in M&A advisory. Provide detailed, actionable insights based on assessment data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content || 'Unable to generate insights';
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.error('Model used:', AI_MODEL);
    return 'AI insights generation failed. Please contact support.';
  }
}

function buildAnswerContext(answers: Record<string, AssessmentAnswer>): string {
  const context: string[] = [];
  const answersByCategory: Record<string, Array<{ question: any; answer: AssessmentAnswer }>> = {};

  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      if (!answersByCategory[question.section]) {
        answersByCategory[question.section] = [];
      }
      answersByCategory[question.section].push({ question, answer });
    }
  });

  Object.entries(answersByCategory).forEach(([category, items]) => {
    context.push(`\n${category.toUpperCase()}:`);
    items.forEach(({ question, answer }) => {
      const selectedOption = question.options.find((opt: any) => opt.points === answer.points);
      context.push(`- ${question.title}: "${selectedOption?.text}" (${answer.points} points)`);
    });
  });

  return context.join('\n');
}

export async function generateCategoryInsight(
  category: string,
  score: number,
  answers: Record<string, AssessmentAnswer>
): Promise<string> {
  try {
    const categoryAnswers = Object.entries(answers)
      .filter(([id]) => {
        const q = questions.find((ques) => ques.id === id);
        return q?.section === category;
      })
      .map(([id, ans]) => {
        const question = questions.find((q) => q.id === id)!;
        const selected = question.options.find((o: any) => o.points === ans.points);
        return `- ${question.title}: "${selected?.text}"`;
      })
      .join('\n');

    const prompt = `Generate a brief, actionable analysis for the ${category} category with a score of ${score}/100.\n\nDetailed Answers:\n${categoryAnswers}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a business valuation expert. Provide concise, specific insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const analysis = completion.choices[0].message.content || '';
    return analysis.replace(/\*\*/g, '').replace(/\n\n+/g, '\n').trim();
  } catch (error) {
    console.error('AI generation failed:', error);
    return generateFallbackAnalysis(category, score);
  }
}

export function generateFallbackAnalysis(category: string, score: number): string {
  const categoryName = getCategoryDetails(category).title;

  if (score < 40) {
    return `A ${categoryName} score of ${score}/100 indicates significant challenges in this area. This low score suggests fundamental issues that need immediate attention. The business should prioritize improvements here as this weakness could be limiting overall value and growth potential.\n\nKey risks include operational inefficiencies, competitive disadvantages, and potential barriers to scaling. However, addressing these issues systematically can lead to substantial improvements in business value.`;
  } else if (score < 60) {
    return `With a ${categoryName} score of ${score}/100, there are clear opportunities for improvement. While some foundational elements may be in place, significant gaps remain that could impact business value and attractiveness to buyers.\n\nThe current performance suggests inconsistent processes or partial implementation of best practices. Focusing on systematic improvements in this area could yield meaningful value enhancement within 12-18 months.`;
  } else {
    return `A ${categoryName} score of ${score}/100 shows moderate performance with room for optimization. The business has established basic competencies but hasn't fully capitalized on opportunities in this area.\n\nBy refining existing processes and implementing industry best practices, the business can strengthen this driver and enhance overall value. Quick wins may be available through targeted improvements.`;
  }
}
