import puppeteer from "puppeteer";
import { AssessmentAnswer, CategoryScore } from "@shared/schema";

interface DriverInfo { name: string; weight: number; }

const CORE_DRIVERS: DriverInfo[] = [
  { name: "Financial Performance", weight: 15 },
  { name: "Growth Potential", weight: 15 },
  { name: "Switzerland Structure", weight: 12 },
  { name: "Valuation Teeter-Totter", weight: 12 },
  { name: "Recurring Revenue", weight: 13 },
  { name: "Monopoly Control", weight: 12 },
  { name: "Customer Satisfaction", weight: 11 },
  { name: "Hub & Spoke", weight: 10 },
];

const SUPPLEMENTAL_DRIVERS: DriverInfo[] = [
  { name: "Financial Health & Analysis", weight: 5 },
  { name: "Market & Competitive Position", weight: 5 },
  { name: "Operational Excellence", weight: 5 },
  { name: "Human Capital & Organization", weight: 5 },
  { name: "Legal, Risk & Compliance", weight: 5 },
  { name: "Strategic Assets & Intangibles", weight: 5 },
];

function performanceLevel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Critical";
}

function insightForScore(score: number): string {
  if (score >= 80) return "Excellent performance to be maintained and leveraged.";
  if (score >= 60) return "Good performance with optimization opportunities.";
  if (score >= 40) return "Below average performance with specific improvement needs.";
  return "Critical issues requiring immediate attention.";
}

function scoreColor(score: number): string {
  if (score >= 60) return "#16a34a"; // green
  if (score >= 40) return "#facc15"; // yellow
  return "#dc2626"; // red
}

function progressBar(score: number): string {
  const color = scoreColor(score);
  return `<div style="background:#e5e7eb;height:16px;border-radius:8px;overflow:hidden;">
            <div style="background:${color};width:${score}%;height:100%;"></div>
          </div>`;
}

function generateDriverPages(drivers: DriverInfo[], categoryScores: Record<string, CategoryScore>): string {
  return drivers.map(d => {
    const score = categoryScores[d.name]?.score ?? 0;
    const level = performanceLevel(score);
    const insight = insightForScore(score);
    const recommendation = getImprovementRecommendation(d.name, score);
    return `
      <section>
        <h2>${d.name}</h2>
        <p>Weight: ${d.weight}%</p>
        <p>Score: <strong>${score}/100</strong> - ${level}</p>
        ${progressBar(score)}
        <p style="margin-top:10px;">${insight}</p>
        <h3>Recommendations</h3>
        <ul><li>${recommendation}</li></ul>
      </section>
      <div class="page-break"></div>`;
  }).join('');
}

export async function generatePDFReport(
  userName: string,
  _userEmail: string,
  companyName: string,
  industry: string,
  overallScore: number,
  categoryScores: Record<string, CategoryScore>,
  _answers: Record<string, AssessmentAnswer>
): Promise<Buffer> {
  const dateStr = new Date().toLocaleDateString();
  const htmlContent = await generateCompleteHTML({
    userName,
    companyName,
    industry,
    overallScore,
    categoryScores,
    date: dateStr,
  });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfUint8 = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return Buffer.from(pdfUint8);
  } catch (err) {
    console.error("PDF generation error", err);
    throw new Error("Failed to generate PDF report");
  }
}

interface HTMLParams {
  userName: string;
  companyName: string;
  industry: string;
  overallScore: number;
  categoryScores: Record<string, CategoryScore>;
  date: string;
}

async function generateCompleteHTML(params: HTMLParams): Promise<string> {
  const { userName, companyName, industry, overallScore, categoryScores, date } = params;

  const allDrivers = [...CORE_DRIVERS, ...SUPPLEMENTAL_DRIVERS];

  const summaryRows = allDrivers
    .map(d => `<tr><td>${d.name}</td><td style="text-align:right;">${categoryScores[d.name]?.score ?? 0}</td></tr>`) 
    .join("");

  const sorted = allDrivers
    .map(d => ({ name: d.name, score: categoryScores[d.name]?.score ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const priorityList = sorted
    .map(s => `<li>${s.name} - ${s.score}/100</li>`)
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; margin:40px; }
      .page-break { page-break-after: always; }
      .cover { background: linear-gradient(135deg,#1E40AF,#3B82F6); color:white; text-align:center; padding:200px 40px; }
      h1,h2,h3 { margin:0 0 20px; }
      section { margin-bottom:40px; }
      table { width:100%; border-collapse:collapse; }
      td, th { padding:8px; border-bottom:1px solid #ddd; }
    </style>
  </head>
  <body>
    <div class="cover">
      <h1>Value Builder Assessment Report</h1>
      <h2>Comprehensive Business Valuation Analysis</h2>
      <p>PREPARED FOR: ${userName}</p>
      <p>${companyName || ''}</p>
      <p>${date}</p>
      <p>Dux Vitae Capital</p>
      <p>14 comprehensive drivers of business value</p>
    </div>
    <div class="page-break"></div>
    <section>
      <h2>Executive Summary</h2>
      <p>Industry: ${industry || 'Not specified'}</p>
      <p><strong>Overall Score: ${overallScore}/100</strong> (${getGrade(overallScore)})</p>
      <table>${summaryRows}</table>
    </section>
    <div class="page-break"></div>
    ${generateDriverPages(allDrivers, categoryScores)}
    <section>
      <h2>Priority Areas</h2>
      <ul>${priorityList}</ul>
    </section>
    <section>
      <h2>Next Steps</h2>
      <p>Use this report to focus on your weakest areas first and monitor progress regularly.</p>
    </section>
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

function getImprovementRecommendation(category: string, _score: number): string {
  const recommendations: Record<string, string> = {
    "Financial Performance": "Strengthen financial controls and improve margins.",
    "Growth Potential": "Explore market expansion and scalable processes.",
    "Switzerland Structure": "Reduce dependencies on key customers or suppliers.",
    "Valuation Teeter-Totter": "Build sustainable competitive advantages.",
    "Recurring Revenue": "Develop predictable recurring revenue streams.",
    "Monopoly Control": "Protect intellectual property and increase pricing power.",
    "Customer Satisfaction": "Enhance customer feedback and service quality.",
    "Hub & Spoke": "Document processes and build management depth.",
    "Financial Health & Analysis": "Maintain clean financial statements and KPIs.",
    "Market & Competitive Position": "Differentiate clearly from competitors.",
    "Operational Excellence": "Streamline operations for efficiency.",
    "Human Capital & Organization": "Invest in talent development and retention.",
    "Legal, Risk & Compliance": "Address legal exposures and compliance gaps.",
    "Strategic Assets & Intangibles": "Leverage unique assets and brand value.",
  };
  return recommendations[category] || "Focus on systematic improvements in this area.";
}
