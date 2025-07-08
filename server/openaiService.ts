import OpenAI from 'openai';
import { AssessmentAnswer, CategoryScore } from '@shared/schema';
import { questions } from '../client/src/data/questions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_MODEL = 'gpt-4.1';

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

Format the response in a professional, executive-ready style. Be specific and reference actual scores and answers. Avoid generic advice.
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
  categoryAnswers: Array<{ question: any; answer: AssessmentAnswer }>
): Promise<string> {
  const prompt = `
Analyze this specific category from a Value Builder Assessment:

Category: ${category}
Score: ${score}/100

Detailed Answers:
${categoryAnswers
  .map(({ question, answer }) => {
    const selectedOption = question.options.find((opt: any) => opt.points === answer.points);
    return `- ${question.title}: "${selectedOption?.text}"`;
  })
  .join('\n')}

Provide:
1. A brief analysis of what this score means for the business
2. Specific risks or opportunities based on the answers
3. 2-3 actionable recommendations to improve this area

Keep response under 200 words and be specific to the actual answers given.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a business valuation expert. Provide concise, specific insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API error for category insight:', error);
    console.error('Model used:', AI_MODEL);
    return '';
  }
}
