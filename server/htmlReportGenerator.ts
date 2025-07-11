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
      padding: 20px;
      color: #111827;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 10px;
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
      justify-content: space-between;
      margin: 10px 0;
      padding: 12px 15px;
      background: #f9fafb;
      border-radius: 6px;
      white-space: nowrap;
    }

    .category-name {
      flex: 0 0 180px;
      font-weight: 500;
      font-size: 13px;
      color: #374151;
      text-align: left;
    }

    .score-bar {
      flex: 1;
      max-width: 120px;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      margin: 0 15px;
      position: relative;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .score-value {
      flex: 0 0 30px;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      color: #374151;
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

    .category-detail {
      margin: 40px 0;
      padding: 30px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      page-break-inside: avoid;
    }

    .category-header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .category-meta {
      margin-top: 8px;
      color: #6b7280;
      font-size: 14px;
    }

    .score-section {
      display: flex;
      align-items: center;
      gap: 40px;
      margin: 30px 0;
    }

    .large-score {
      font-size: 48px;
      font-weight: bold;
    }

    .score-value {
      font-size: 64px;
    }

    .score-total {
      font-size: 32px;
      color: #6b7280;
    }

    .score-visualization {
      flex: 1;
    }

    .score-bar.large {
      height: 20px;
      margin: 10px 0;
    }

    .score-label {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .category-content {
      margin-top: 30px;
    }

    .description {
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
      margin-bottom: 30px;
    }

    .insights-section,
    .recommendations-section,
    .ai-analysis-section {
      margin: 25px 0;
    }

    .insights-section h4,
    .recommendations-section h4,
    .ai-analysis-section h4 {
      color: #1e40af;
      font-size: 16px;
      margin-bottom: 12px;
    }

    .insights-list {
      list-style: none;
      padding: 0;
    }

    .insights-list li {
      position: relative;
      padding-left: 24px;
      margin: 8px 0;
      color: #374151;
    }

    .insights-list li:before {
      content: "•";
      position: absolute;
      left: 8px;
      color: #1e40af;
      font-weight: bold;
    }

    .ai-analysis-section {
      background: #f0f9ff;
      border-left: 4px solid #1e40af;
      padding: 20px;
      margin-top: 30px;
      border-radius: 0 8px 8px 0;
    }

    .ai-content {
      color: #1e293b;
      line-height: 1.7;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .ai-content p {
      margin: 10px 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .ai-content h4 {
      color: #1e40af;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0 10px 0;
    }

    .ai-content h5 {
      color: #1e40af;
      font-size: 14px;
      font-weight: 600;
      margin: 15px 0 8px 0;
    }

    .ai-content strong {
      color: #1e40af;
      font-weight: 600;
    }

    .ai-content li {
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .ai-content li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #1e40af;
      font-weight: bold;
    }

    /* Ensure consistent text rendering */
    .ai-content, .description, p {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      text-align: justify;
      line-height: 1.7;
    }

    /* Ensure lists don't get cut off */
    ul {
      page-break-inside: avoid;
      margin: 12px 0;
    }

    li {
      page-break-inside: avoid;
      margin: 8px 0;
    }

    /* Prevent headers from being orphaned */
    h4, h5 {
      page-break-after: avoid;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* Ensure sections stay together */
    .category-detail, .ai-insights, .priority-areas {
      page-break-inside: avoid;
      overflow: hidden;
    }

    /* Fix bullet point alignment */
    .insights-list li {
      display: flex;
      align-items: flex-start;
    }

    .insights-list li:before {
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Print-specific styles */
    @media print {
      body {
        margin: 0;
        padding: 15mm;
        font-size: 12px;
        line-height: 1.4;
      }

      .container {
        max-width: none;
        padding: 0;
      }

      .cover-page {
        page-break-after: always;
      }

      .category-detail {
        page-break-inside: avoid;
        margin: 20px 0;
      }

      .new-page {
        page-break-before: always;
      }

      .score-number {
        font-size: 48px;
      }

      .grade {
        font-size: 24px;
      }

      .summary-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }

      .ai-insights,
      .priority-areas {
        page-break-inside: avoid;
      }

      .ai-content h4 {
        font-size: 14px;
      }

      .ai-content p {
        font-size: 11px;
        line-height: 1.5;
      }

      .large-score .score-value {
        font-size: 36px;
      }

      .large-score .score-total {
        font-size: 24px;
      }

      .category-score {
        padding: 10px 12px;
        margin: 6px 0;
      }

      .category-name {
        flex: 0 0 150px;
        font-size: 11px;
      }

      .score-bar {
        max-width: 100px;
        margin: 0 10px;
        height: 5px;
      }

      .score-value {
        flex: 0 0 25px;
        font-size: 12px;
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
  // First, clean up any markdown artifacts
  let cleaned = insights
    .replace(/###\s*/g, '') // Remove ### headers
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Convert bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Convert italic

  // Split into lines and process each one
  const lines = cleaned.split('\n').map(line => line.trim());
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      // Empty line - close list if open and add spacing
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // Check if this is a header (ends with colon and is relatively short)
    if (line.endsWith(':') && line.length < 80 && !line.startsWith('-')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h4 style="margin-top: 20px; margin-bottom: 12px; color: #1e40af;">${line}</h4>`;
    }
    // Check if this is a list item
    else if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
      if (!inList) {
        html += '<ul style="list-style: none; padding-left: 0; margin: 12px 0;">';
        inList = true;
      }
      const content = line.replace(/^[-\d]+\.\s*/, '');
      html += `<li style="padding-left: 24px; margin: 8px 0; position: relative;">
        <span style="position: absolute; left: 8px; color: #1e40af; font-weight: bold;">•</span>
        ${content}
      </li>`;
    }
    // Regular paragraph
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p style="margin: 12px 0; line-height: 1.7;">${line}</p>`;
    }
  }

  // Close any open list
  if (inList) {
    html += '</ul>';
  }

  return html;
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
  const coreCategories = coreDrivers.filter(cat => scores[cat]);
  const supplementalCategories = supplementalDrivers.filter(cat => scores[cat]);

  let html = '';

  if (coreCategories.length > 0) {
    html += '<h3>Part I: Core Value Builder Drivers - Detailed Analysis</h3>';
    html += coreCategories.map(cat => renderSingleCategory(cat, scores[cat])).join('');
  }

  if (supplementalCategories.length > 0) {
    html += '<h3 class="new-page">Part II: Supplemental Deep-Dive - Detailed Analysis</h3>';
    html += supplementalCategories.map(cat => renderSingleCategory(cat, scores[cat])).join('');
  }

  return html;
}

function renderSingleCategory(category: string, score: CategoryScore): string {
  const details = getCategoryDetails(category);
  if (!details) return '';

  const hasAI = score.analysis && score.score < 80;
  const color = getScoreColor(score.score);

  return `
    <div class="category-detail" data-category="${category}">
      <div class="category-header">
        <h3>${details.title}</h3>
        <div class="category-meta">
          <span class="category-subtitle">${details.subtitle}</span>
        </div>
      </div>

      <div class="score-section">
        <div class="large-score">
          <span class="score-value" style="color: ${color};">${score.score}</span>
          <span class="score-total">/100</span>
        </div>

        <div class="score-visualization">
          <div class="score-bar large">
            <div class="score-bar-fill" style="width: ${score.score}%; background-color: ${color};"></div>
          </div>
          <span class="score-label">${getScoreLabel(score.score)}</span>
        </div>
      </div>

      <div class="category-content">
        <p class="description">${details.description}</p>

        <div class="insights-section">
          <h4>Key Assessment Areas:</h4>
          <ul class="insights-list">
            ${details.insights.map((ins: string) => `<li>${ins}</li>`).join('')}
          </ul>
        </div>

        <div class="recommendations-section">
          <h4>Improvement Opportunities:</h4>
          <p>${getImprovementRecommendation(category, score.score)}</p>
        </div>

        ${hasAI ? `
          <div class="ai-analysis-section">
            <h4>Analysis:</h4>
            <div class="ai-content">
              ${formatAnalysisContent(score.analysis!)}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function formatAnalysisContent(analysis: string): string {
  // Clean up markdown formatting
  const cleaned = analysis
    .replace(/###\s*/g, '') // Remove ### headers
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic text
    .replace(/\.-\s*/g, '') // Remove .- marks
    .replace(/^-+\s*/gm, ''); // Remove leading dashes

  const lines = cleaned.split('\n').filter(line => line.trim());
  let html = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headers (short lines ending with colon)
    if (trimmed.endsWith(':') && trimmed.length < 60) {
      html += `<h5 style="margin: 16px 0 8px 0; color: #1e40af; font-weight: 600;">${trimmed}</h5>`;
    }
    // List items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      const content = trimmed.replace(/^[-*\d]+\.\s*/, '');
      html += `<ul style="list-style: none; padding: 0; margin: 8px 0;">
        <li style="padding-left: 20px; position: relative; margin: 6px 0;">
          <span style="position: absolute; left: 0; color: #1e40af; font-weight: bold;">•</span>
          ${content}
        </li>
      </ul>`;
    }
    // Regular paragraphs
    else {
      html += `<p style="margin: 10px 0; line-height: 1.6; word-wrap: break-word;">${trimmed}</p>`;
    }
  }

  return html;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical';
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
