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

FORMATTING REQUIREMENTS:
- Use clear section headers without markdown (no ###)
- For bullet points, use a simple dash (-) at the start of the line
- Keep paragraphs concise and well-spaced
- Ensure each section is complete - do not cut off mid-sentence
- Use bold text sparingly by wrapping important terms in **double asterisks**
- Maintain consistent formatting throughout

Generate the following sections:

1. Executive Summary
Write 2-3 complete paragraphs that:
- Summarize overall business health and valuation readiness
- Highlight 2-3 key strengths that enhance value
- Identify 2-3 critical areas requiring immediate attention

2. Strategic Insights
Provide exactly 4 strategic insights as bullet points:
- Each insight should be 1-2 complete sentences
- Focus on patterns and relationships between scores
- Include specific score references where relevant
- Identify hidden opportunities based on the assessment

3. Priority Action Items
List exactly 5 specific, actionable recommendations:
- Order by priority (most critical first)
- Each item should be a complete, actionable statement
- Include quick wins and long-term initiatives
- Reference specific low-scoring categories

4. Value Enhancement Potential
Write 2 complete paragraphs covering:
- Estimated value improvement potential (use percentages)
- Realistic timeline for implementing changes (3-6 months, 6-12 months, etc.)
- Expected ROI on suggested improvements
- Key success metrics to track

Remember: Complete all sections fully. Do not use placeholder text or incomplete sentences.`;

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

    const prompt = `Analyze the ${category} category with a score of ${score}/100.

Detailed Answers:
${categoryAnswers}

FORMATTING REQUIREMENTS:
- Write 2-3 complete paragraphs (no headers)
- Start with the current state based on the score
- Include specific risks or opportunities
- End with 2-3 actionable recommendations
- Use complete sentences - no bullet points
- Keep total response under 250 words
- Do not use markdown formatting or special characters

Focus on being specific to this business based on their answers, not generic advice.`;

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
