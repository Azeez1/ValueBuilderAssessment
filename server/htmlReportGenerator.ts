export interface HtmlReportOptions {
  userName: string;
  companyName?: string;
  industry?: string;
  overallScore: number;
  categoryScores: Record<string, { score: number }>;
  aiInsights?: string;
}

export async function generateHTMLReport(options: HtmlReportOptions): Promise<string> {
  const { userName, companyName, industry, overallScore, categoryScores, aiInsights } = options;

  const rows = Object.entries(categoryScores)
    .map(([name, s]) => `<tr><td>${name}</td><td class="score">${s.score}</td></tr>`) 
    .join("\n");

  const insightsSection = aiInsights
    ? `<h2>Executive Analysis</h2><p>${aiInsights.replace(/\n/g, '<br/>')}</p>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Value Builder Assessment Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1, h2 { color: #1e40af; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f3f4f6; text-align: left; }
    .score { text-align: right; }
  </style>
</head>
<body>
  <h1>Value Builder Assessment Report</h1>
  <p><strong>User:</strong> ${userName}</p>
  ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
  ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : ''}
  <h2>Overall Score: ${overallScore}/100</h2>
  <table>
    <tr><th>Category</th><th>Score</th></tr>
    ${rows}
  </table>
  ${insightsSection}
</body>
</html>`;
}
