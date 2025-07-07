import puppeteer from 'puppeteer';
import { AssessmentAnswer, CategoryScore } from "@shared/schema";

export async function generatePDFReport(
  userName: string,
  userEmail: string,
  companyName: string,
  industry: string,
  overallScore: number,
  categoryScores: Record<string, CategoryScore>,
  answers: Record<string, AssessmentAnswer>
): Promise<Buffer> {
  // Identify areas needing improvement (scores below 60)
  const areasForImprovement = Object.entries(categoryScores)
    .filter(([_, score]) => score.score < 60)
    .sort((a, b) => a[1].score - b[1].score); // Sort by lowest score first

  // Get top performing areas (scores above 80)
  const topPerformingAreas = Object.entries(categoryScores)
    .filter(([_, score]) => score.score >= 80)
    .sort((a, b) => b[1].score - a[1].score);

  // Generate HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .header {
      background: #1e40af;
      color: white;
      padding: 30px;
      margin: -20px -20px 30px -20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .info-box {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
      text-transform: uppercase;
    }
    .info-box p {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
    .score-section {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      border-radius: 12px;
    }
    .score-section h2 {
      margin: 0;
      font-size: 24px;
    }
    .score-value {
      font-size: 72px;
      font-weight: bold;
      margin: 20px 0;
    }
    .score-grade {
      font-size: 48px;
      opacity: 0.9;
    }
    .category-section {
      margin: 40px 0;
    }
    .category-item {
      margin: 15px 0;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #e5e7eb;
    }
    .category-item.high-score {
      border-left-color: #10b981;
      background: #f0fdf4;
    }
    .category-item.medium-score {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .category-item.low-score {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .category-name {
      font-weight: bold;
      font-size: 16px;
    }
    .category-score {
      font-size: 24px;
      font-weight: bold;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s;
    }
    .improvement-section {
      margin: 40px 0;
      padding: 30px;
      background: #fef3c7;
      border-radius: 12px;
      border: 2px solid #fbbf24;
    }
    .improvement-section h2 {
      color: #92400e;
      margin-top: 0;
    }
    .improvement-item {
      margin: 15px 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
    }
    .improvement-item h4 {
      margin: 0 0 8px 0;
      color: #dc2626;
    }
    .recommendations {
      margin-top: 40px;
      padding: 30px;
      background: #dbeafe;
      border-radius: 12px;
    }
    .recommendations h2 {
      color: #1e3a8a;
      margin-top: 0;
    }
    .recommendation-item {
      margin: 15px 0;
      padding-left: 20px;
      position: relative;
    }
    .recommendation-item:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: bold;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @page {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Value Builder Assessment Report</h1>
    <p>Comprehensive Business Valuation Analysis</p>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Assessed By</h3>
      <p>${userName}</p>
    </div>
    <div class="info-box">
      <h3>Company</h3>
      <p>${companyName || 'Not Specified'}</p>
    </div>
    <div class="info-box">
      <h3>Industry</h3>
      <p>${industry || 'Not Specified'}</p>
    </div>
    <div class="info-box">
      <h3>Assessment Date</h3>
      <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>

  <div class="score-section">
    <h2>Overall Value Builder Score</h2>
    <div class="score-value">${overallScore}/100</div>
    <div class="score-grade">Grade: ${getGrade(overallScore)}</div>
  </div>

  <div class="category-section">
    <h2>Performance by Category</h2>
    ${Object.entries(categoryScores)
      .sort((a, b) => b[1].score - a[1].score)
      .map(([category, score]) => {
        const scoreClass = score.score >= 80 ? 'high-score' : score.score >= 60 ? 'medium-score' : 'low-score';
        return `
          <div class="category-item ${scoreClass}">
            <div class="category-header">
              <span class="category-name">${category}</span>
              <span class="category-score">${score.score}/100</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${score.score}%"></div>
            </div>
          </div>
        `;
      }).join('')}
  </div>

  ${areasForImprovement.length > 0 ? `
    <div class="improvement-section">
      <h2>🎯 Priority Areas for Improvement</h2>
      <p>Focus on these areas to significantly increase your business value:</p>
      ${areasForImprovement.map(([category, score]) => `
        <div class="improvement-item">
          <h4>${category} (Current Score: ${score.score}/100)</h4>
          <p>${getImprovementRecommendation(category, score.score)}</p>
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="recommendations">
    <h2>💡 Strategic Recommendations</h2>
    ${getStrategicRecommendations(overallScore, categoryScores)}
  </div>

  <div class="footer">
    <p>This report is confidential and proprietary to ${companyName || userName}</p>
    <p>Generated by Value Builder Assessment™ | ${new Date().toISOString()}</p>
    <p>For questions, contact: aoseni@duxvitaecapital.com</p>
  </div>
</body>
</html>
  `;

  // Launch puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  return pdfBuffer as Buffer;
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
    "Financial Performance": "Consider implementing stronger financial controls, improving profit margins, and establishing more predictable revenue streams.",
    "Growth Potential": "Focus on market expansion strategies, product innovation, and developing scalable business processes.",
    "Switzerland Structure": "Work on reducing dependencies on key customers, suppliers, or employees. Diversify your risk.",
    "Valuation Teeter-Totter": "Strengthen your competitive position and build sustainable advantages in your market.",
    "Recurring Revenue": "Develop subscription models, long-term contracts, or membership programs to increase predictable revenue.",
    "Monopoly Control": "Build stronger barriers to entry, protect intellectual property, and increase pricing power.",
    "Customer Satisfaction": "Implement customer feedback systems, improve service quality, and track NPS scores.",
    "Hub & Spoke": "Reduce owner dependence by building strong management teams and documenting all processes.",
  };

  return recommendations[category] || "Focus on systematic improvements in this area to increase business value.";
}

function getStrategicRecommendations(overallScore: number, categoryScores: Record<string, CategoryScore>): string {
  const items = [] as string[];

  if (overallScore < 60) {
    items.push("Your business has significant opportunities for value improvement. Focus on the lowest-scoring areas first.");
    items.push("Consider engaging a business advisor to help develop a comprehensive improvement plan.");
  } else if (overallScore < 80) {
    items.push("Your business shows good potential. Targeted improvements in key areas can significantly increase value.");
    items.push("Prioritize 2-3 improvement areas and develop 90-day action plans for each.");
  } else {
    items.push("Your business is performing well. Focus on maintaining strengths while addressing any remaining gaps.");
    items.push("Consider strategic initiatives to move from good to exceptional in your strongest areas.");
  }

  const recurringRevScore = categoryScores["Recurring Revenue"]?.score || 0;
  if (recurringRevScore < 60) {
    items.push("Urgently develop recurring revenue streams to improve business predictability and value.");
  }

  const hubSpokeScore = categoryScores["Hub & Spoke"]?.score || 0;
  if (hubSpokeScore < 60) {
    items.push("Reduce owner dependence by developing management systems and key employee capabilities.");
  }

  return items.map(item => `<div class="recommendation-item">${item}</div>`).join('');
}
