import { CategoryScore } from '@shared/schema';
import { coreDrivers, supplementalDrivers } from './pdfGenerator';
import {
  coreDriverDescriptions,
  supplementalDriverDescriptions
} from './reportTemplates';

export interface HtmlReportOptions {
  userName: string;
  userEmail?: string;
  companyName?: string;
  industry?: string;
  overallScore: number;
  categoryScores: Record<string, CategoryScore>;
  aiInsights?: string;
}

export async function generateHTMLReport(options: HtmlReportOptions): Promise<string> {
  const { userName, companyName, industry, overallScore, categoryScores, aiInsights } = options;

  const grade = getGrade(overallScore);

  // Calculate statistics for the summary
  const strongAreas = Object.values(categoryScores).filter(s => s.score >= 80).length;
  const priorityAreas = Object.values(categoryScores).filter(s => s.score < 60).length;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Value Builder Assessment Report</title>
  <style>
    /* Screen styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #111827;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    h1, h2, h3, h4 {
      color: #1e40af;
      margin-top: 2em;
      margin-bottom: 0.5em;
    }

    .cover-page {
      text-align: center;
      padding: 60px 0;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 40px;
    }

    .metadata {
      text-align: left;
      margin: 40px 0;
    }

    .metadata p {
      margin: 8px 0;
      font-size: 16px;
    }

    .score-display {
      margin: 40px 0;
      text-align: center;
    }

    .score-number {
      font-size: 72px;
      font-weight: bold;
      color: ${getScoreColor(overallScore)};
      margin: 0;
    }

    .score-label {
      font-size: 24px;
      color: #6b7280;
    }

    .grade {
      font-size: 36px;
      font-weight: bold;
      color: #111827;
      margin: 20px 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 40px 0;
    }

    .summary-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #1e40af;
    }

    .summary-card .label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 5px;
    }

    .category-scores {
      margin: 40px 0;
    }

    .category-score {
      display: flex;
      align-items: center;
      margin: 15px 0;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .category-name {
      flex: 1;
      font-weight: 500;
    }

    .score-bar {
      width: 150px;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin: 0 20px;
      position: relative;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .score-value {
      font-weight: bold;
      width: 50px;
      text-align: right;
    }

    .ai-insights {
      background: #f0f9ff;
      border-left: 4px solid #1e40af;
      padding: 20px;
      margin: 40px 0;
    }

    .priority-areas {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 20px;
      margin: 40px 0;
    }

    .priority-item {
      margin: 15px 0;
    }

    .priority-item strong {
      color: #ef4444;
    }

    /* Print-specific styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .cover-page {
        page-break-after: always;
      }

      .category-detail {
        page-break-inside: avoid;
      }

      .new-page {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Cover Page -->
    <div class="cover-page">
      <h1>Value Builder Assessment Report</h1>

      <div class="metadata">
        <p><strong>Assessed By:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${options.userEmail || 'Not provided'}</p>
        ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
        ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : ''}
        <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="score-display" data-overall-score="${overallScore}">
        <div class="score-number">${overallScore}</div>
        <div class="score-label">Overall Value Builder Score</div>
        <div class="grade">Grade: ${grade}</div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="value">${strongAreas}</div>
          <div class="label">Strong Areas</div>
        </div>
        <div class="summary-card">
          <div class="value">${priorityAreas}</div>
          <div class="label">Priority Areas</div>
        </div>
        <div class="summary-card">
          <div class="value">14</div>
          <div class="label">Categories Assessed</div>
        </div>
      </div>
    </div>

    <!-- AI Insights Section -->
    ${aiInsights ? `
    <section id="executive-summary" class="ai-insights new-page">
      <h2>Executive Analysis & Strategic Insights</h2>
      <p class="subtitle">Powered by AI Analysis</p>
      ${formatAIInsights(aiInsights)}
    </section>
    ` : ''}

    <!-- Performance Summary -->
    <section class="category-scores">
      <h2>Performance Summary</h2>

      <h3>Part I: Core Value Builder Drivers (70% weight)</h3>
      ${renderCategoryScores(categoryScores, coreDrivers)}

      <h3>Part II: Supplemental Deep-Dive Analysis (30% weight)</h3>
      ${renderCategoryScores(categoryScores, supplementalDrivers)}
    </section>

    <!-- Priority Areas -->
    ${renderPriorityAreas(categoryScores)}

    <!-- Detailed Category Analysis -->
    <section class="detailed-analysis new-page">
      <h2>Detailed Category Analysis</h2>
      ${renderDetailedCategories(categoryScores)}
    </section>
  </div>
</body>
</html>`;
}

// Helper function to render category scores
function renderCategoryScores(scores: Record<string, CategoryScore>, categories: string[]): string {
  return categories
    .filter(cat => scores[cat])
    .map(cat => {
      const score = scores[cat];
      const color = getScoreColor(score.score);
      return `
        <div class="category-score" data-category="${cat}" data-score="${score.score}">
          <span class="category-name">${cat}</span>
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${score.score}%; background-color: ${color};"></div>
          </div>
          <span class="score-value" style="color: ${color};">${score.score}</span>
        </div>
      `;
    })
    .join('');
}

// Helper function to format AI insights
function formatAIInsights(insights: string): string {
  // Convert markdown-style formatting to HTML
  return insights
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return `<h3>${line.replace(/\*\*/g, '')}</h3>`;
      } else if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
        return `<li>${line.replace(/^[-\d+\.]\s*/, '')}</li>`;
      } else if (line.trim()) {
        return `<p>${line}</p>`;
      }
      return '';
    })
    .join('\n');
}

// Helper function to render priority areas
function renderPriorityAreas(scores: Record<string, CategoryScore>): string {
  const priorities = Object.entries(scores)
    .filter(([_, s]) => s.score < 60)
    .sort((a, b) => a[1].score - b[1].score);

  if (priorities.length === 0) return '';

  return `
    <section class="priority-areas">
      <h2>Priority Areas for Improvement</h2>
      ${priorities.map(([cat, score]) => `
        <div class="priority-item">
          <strong>${cat} (Current Score: ${score.score}/100)</strong>
          <p>${getImprovementRecommendation(cat, score.score)}</p>
        </div>
      `).join('')}
    </section>
  `;
}

// Helper function to render detailed categories
function renderDetailedCategories(scores: Record<string, CategoryScore>): string {
  return Object.entries(scores)
    .map(([category, score]) => {
      const details = getCategoryDetails(category);
      if (!details) return '';

      return `
        <div class="category-detail" data-category="${category}">
          <h3>${details.title}</h3>
          <div class="score-display">
            <span class="score-number" style="font-size: 48px; color: ${getScoreColor(score.score)};">
              ${score.score}/100
            </span>
          </div>
          <p><strong>${details.subtitle}</strong></p>
          <p>${details.description}</p>

          <h4>Key Assessment Areas:</h4>
          <ul>
            ${details.insights.map((insight: string) => `<li>${insight}</li>`).join('')}
          </ul>

          <h4>Improvement Opportunities:</h4>
          <p>${getImprovementRecommendation(category, score.score)}</p>

          ${score.analysis ? `
            <h4>Analysis:</h4>
            <p>${score.analysis}</p>
          ` : ''}
        </div>
      `;
    })
    .join('');
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

function getCategoryDetails(category: string) {
  return (
    (coreDriverDescriptions as Record<string, any>)[category] ||
    (supplementalDriverDescriptions as Record<string, any>)[category]
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}
