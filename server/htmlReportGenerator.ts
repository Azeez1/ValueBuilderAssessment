import { CategoryScore } from '@shared/schema';
import { coreDrivers, supplementalDrivers } from './pdfGenerator';
import {
  coreDriverDescriptions,
  supplementalDriverDescriptions
} from './reportTemplates';

export interface HtmlReportOptions {
  userName: string;
  companyName?: string;
  industry?: string;
  overallScore: number;
  categoryScores: Record<string, CategoryScore>;
  aiInsights?: string;
}

export async function generateHTMLReport(options: HtmlReportOptions): Promise<string> {
  const { userName, companyName, industry, overallScore, categoryScores, aiInsights } = options;

  const grade = getGrade(overallScore);

  const coreRows = coreDrivers
    .map((d) => {
      const s = categoryScores[d];
      if (!s) return '';
      return `<tr><td>${d}</td><td class="score">${s.score}</td></tr>`;
    })
    .join('\n');

  const supplementalRows = supplementalDrivers
    .map((d) => {
      const s = categoryScores[d];
      if (!s) return '';
      return `<tr><td>${d}</td><td class="score">${s.score}</td></tr>`;
    })
    .join('\n');

  const insightsSection = aiInsights
    ? `<h2>Executive Analysis &amp; Strategic Insights</h2><p>${aiInsights.replace(/\n/g, '<br/>')}</p>`
    : '';

  const improvementList = Object.entries(categoryScores)
    .filter(([_, s]) => s.score < 60)
    .sort((a, b) => a[1].score - b[1].score)
    .map(([cat, s]) => {
      const rec = getImprovementRecommendation(cat, s.score);
      return `<li><strong>${cat} (${s.score}/100)</strong> - ${rec}</li>`;
    })
    .join('\n');

  const detailSections = [
    ...coreDrivers,
    ...supplementalDrivers
  ]
    .filter((cat) => categoryScores[cat])
    .map((cat) => {
      const s = categoryScores[cat];
      const details =
        (coreDriverDescriptions as Record<string, any>)[cat] ||
        (supplementalDriverDescriptions as Record<string, any>)[cat];
      if (!details) return '';
      const analysis = s.analysis ? `<p><em>${s.analysis.replace(/\n/g, '<br/>')}</em></p>` : '';
      return `
        <section>
          <h3>${details.title} - ${s.score}/100</h3>
          <p><strong>${details.subtitle}</strong></p>
          <p>${details.description}</p>
          <h4>Key Assessment Areas:</h4>
          <ul>${details.insights.map((i: string) => `<li>${i}</li>`).join('')}</ul>
          <h4>Improvement Opportunities:</h4>
          <p>${getImprovementRecommendation(cat, s.score)}</p>
          ${analysis}
        </section>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Value Builder Assessment Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1, h2, h3, h4 { color: #1e40af; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f3f4f6; text-align: left; }
    .score { text-align: right; }
    section { margin-top: 40px; }
  </style>
</head>
<body>
  <h1>Value Builder Assessment Report</h1>
  <p><strong>User:</strong> ${userName}</p>
  ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
  ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : ''}
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  <h2>Overall Score: ${overallScore}/100 (Grade: ${grade})</h2>
  ${insightsSection}

  <h2>Performance Summary</h2>
  <h3>Part I: Core Value Builder Drivers</h3>
  <table>
    <tr><th>Category</th><th>Score</th></tr>
    ${coreRows}
  </table>
  <h3>Part II: Supplemental Deep-Dive Analysis</h3>
  <table>
    <tr><th>Category</th><th>Score</th></tr>
    ${supplementalRows}
  </table>

  ${improvementList ? `<h2>Priority Areas for Improvement</h2><ul>${improvementList}</ul>` : ''}

  ${detailSections}
</body>
</html>`;
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getImprovementRecommendation(category: string, score: number): string {
  const recommendations: Record<string, string> = {
    'Financial Performance':
      'Consider implementing stronger financial controls, improving profit margins, and establishing more predictable revenue streams.',
    'Growth Potential':
      'Focus on market expansion strategies, product innovation, and developing scalable business processes.',
    'Switzerland Structure':
      'Work on reducing dependencies on key customers, suppliers, or employees. Diversify your risk.',
    'Valuation Teeter-Totter':
      'Strengthen your competitive position and build sustainable advantages in your market.',
    'Recurring Revenue':
      'Develop subscription models, long-term contracts, or membership programs to increase predictable revenue.',
    'Monopoly Control':
      'Build stronger barriers to entry, protect intellectual property, and increase pricing power.',
    'Customer Satisfaction': 'Implement customer feedback systems, improve service quality, and track NPS scores.',
    'Hub & Spoke':
      'Reduce owner dependence by building strong management teams and documenting all processes.',
    'Financial Health & Analysis':
      'Strengthen balance sheet, improve cash flow management, and enhance financial reporting.',
    'Market & Competitive Position':
      'Analyze competitive landscape, identify market opportunities, and strengthen positioning.',
    'Operational Excellence':
      'Optimize processes, implement quality systems, and improve operational efficiency.',
    'Human Capital & Organization':
      'Invest in employee development, improve retention, and build strong organizational culture.',
    'Legal, Risk & Compliance': 'Review legal structures, enhance compliance systems, and mitigate business risks.',
    'Strategic Assets & Intangibles': 'Protect and leverage intellectual property, brand value, and strategic relationships.'
  };

  return recommendations[category] || 'Focus on systematic improvements in this area to increase business value.';
}
