import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';
import { AssessmentAnswer, CategoryScore } from '@shared/schema';
import {
  coreDriverDescriptions,
  supplementalDriverDescriptions
} from './reportTemplates';
import {
  generateAIInsights,
  generateCategoryInsight,
  generateFallbackAnalysis,
} from './openaiService';

// Driver categories used throughout the report
export const coreDrivers = [
  'Financial Performance',
  'Growth Potential',
  'Switzerland Structure',
  'Valuation Teeter-Totter',
  'Recurring Revenue',
  'Monopoly Control',
  'Customer Satisfaction',
  'Hub & Spoke'
];

export const supplementalDrivers = [
  'Financial Health & Analysis',
  'Market & Competitive Position',
  'Operational Excellence',
  'Human Capital & Organization',
  'Legal, Risk & Compliance',
  'Strategic Assets & Intangibles'
];

function getCategoryDetails(category: string) {
  return (
    (coreDriverDescriptions as Record<string, any>)[category] ||
    (supplementalDriverDescriptions as Record<string, any>)[category]
  );
}

class PDFPageManager {
  private hasContent = false;

  constructor(private doc: PDFKit.PDFDocument, private footerText: string) {}

  markContentAdded() {
    this.hasContent = true;
  }

  addFooter() {
    if (this.hasContent) {
      const pageBottom = this.doc.page.height - 40;
      this.doc.fontSize(8).fillColor('#6b7280');
      this.doc.text(this.footerText, 30, pageBottom, {
        width: this.doc.page.width - 60,
        align: 'center'
      });
    }
  }

  newPage() {
    if (this.hasContent) {
      this.addFooter();
      this.doc.addPage();
      this.hasContent = false;
    }
  }
}

class PDFFlowManager {
  private currentY: number;
  private readonly pageHeight: number;
  private readonly margins = { top: 50, bottom: 90, left: 30, right: 50 };
  private sectionHasContent = false;

  constructor(private doc: PDFKit.PDFDocument, private pageManager: PDFPageManager) {
    this.currentY = this.margins.top;
    this.pageHeight = doc.page.height;
  }

  async addSection(
    estimatedHeight: number,
    drawFn: (doc: PDFKit.PDFDocument, startY: number, flow: PDFFlowManager) => Promise<void>
  ): Promise<void> {
    if (this.currentY + estimatedHeight > this.pageHeight - this.margins.bottom) {
      this.newPage();
    }

    this.sectionHasContent = false;
    await drawFn(this.doc, this.currentY, this);
    if (this.sectionHasContent) {
      this.pageManager.markContentAdded();
    }
  }

  markContentAdded(): void {
    this.sectionHasContent = true;
  }

  addPage(): void {
    this.newPage();
  }

  setCurrentY(y: number): void {
    this.currentY = y;
  }

  private newPage(): void {
    this.pageManager.newPage();
    this.currentY = this.margins.top;
  }

  getCurrentY(): number {
    return this.currentY;
  }
}


function drawScoreGauge(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  score: number
): number {
  const gaugeWidth = 200;
  const gaugeHeight = 200;
  const actualX = Math.min(x, doc.page.width - 50 - gaugeWidth);

  const centerX = actualX + gaugeWidth / 2;
  const centerY = y + gaugeHeight / 2;
  const radius = 80;

  const segments = [
    { start: 180, end: 225, color: '#ef4444' },
    { start: 225, end: 315, color: '#f59e0b' },
    { start: 315, end: 360, color: '#10b981' }
  ];

  segments.forEach((segment) => {
    doc.save();
    doc.path(
      `M ${centerX} ${centerY}
       A ${radius} ${radius} 0 0 1 ${centerX +
      radius * Math.cos((segment.start * Math.PI) / 180)} ${centerY +
      radius * Math.sin((segment.start * Math.PI) / 180)}
       A ${radius} ${radius} 0 0 1 ${centerX +
      radius * Math.cos((segment.end * Math.PI) / 180)} ${centerY +
      radius * Math.sin((segment.end * Math.PI) / 180)}
       L ${centerX} ${centerY} Z`
    );
    doc.fillColor(segment.color).fill();
    doc.restore();
  });

  doc.circle(centerX, centerY, radius - 20).fillColor('white').fill();

  let angle;
  if (score < 45) {
    angle = 180 + (score / 45) * 45;
  } else if (score < 80) {
    angle = 225 + ((score - 45) / 35) * 90;
  } else {
    angle = 315 + ((score - 80) / 20) * 45;
  }
  const needleLength = radius - 25;
  const needleX = centerX + needleLength * Math.cos((angle * Math.PI) / 180);
  const needleY = centerY + needleLength * Math.sin((angle * Math.PI) / 180);

  doc.save();
  doc.lineWidth(3).strokeColor('#374151');
  doc.moveTo(centerX, centerY).lineTo(needleX, needleY).stroke();
  doc.circle(centerX, centerY, 5).fillColor('#374151').fill();
  doc.restore();

  doc
    .fontSize(36)
    .fillColor(getScoreColor(score))
    .text(score.toString(), centerX - 30, centerY + 20, { width: 60, align: 'center' });

  // Removed branding text inside gauge for a cleaner look
  return gaugeHeight;
}

async function drawAIInsights(
  doc: PDFKit.PDFDocument,
  startY: number,
  insights: string,
  flow: PDFFlowManager
): Promise<void> {
  const pageWidth = doc.page.width;
  const margins = { left: 30, right: 50 };
  const contentWidth = pageWidth - margins.left - margins.right;
  let currentY = startY;

  doc
    .fontSize(24)
    .fillColor('#1e40af')
    .text('Executive Analysis & Strategic Insights', margins.left, currentY);
  currentY += 30;

  doc.fontSize(10).fillColor('#6b7280').text('Powered by AI Analysis', margins.left, currentY);
  currentY += 40;

  const lines = insights.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/\*\*/g, '').trim();
    if (!cleanLine) {
      currentY += 10;
      continue;
    }

    const textHeight = doc.heightOfString(cleanLine, { width: contentWidth, align: 'justify' });
    const pageBottom = doc.page.height - 90;

    if (currentY + textHeight > pageBottom) {
      flow.addPage();
      currentY = flow.getCurrentY();
    }

    if (line.includes('**') && line.startsWith('**')) {
      doc.fontSize(14).fillColor('#1e40af');
      doc.text(cleanLine, margins.left, currentY);
    } else if (cleanLine.startsWith('-') || /^\d+\./.test(cleanLine)) {
      doc.fontSize(10).fillColor('#374151');
      const bullet = cleanLine.startsWith('-') ? '•' : cleanLine.match(/^\d+\./)?.[0] || '•';
      const content = cleanLine.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
      doc.text(bullet, margins.left + 10, currentY);
      doc.text(content, margins.left + 25, currentY, {
        width: contentWidth - 25,
        align: 'left'
      });
    } else {
      doc.fontSize(10).fillColor('#111827');
      doc.text(cleanLine, margins.left, currentY, {
        width: contentWidth,
        align: 'justify'
      });
    }

    flow.markContentAdded();
    currentY = doc.y + 12;
  }
  flow.setCurrentY(currentY);
}

async function drawPriorityAreas(
  doc: PDFKit.PDFDocument,
  startY: number,
  areas: Array<[string, CategoryScore]>,
  flow: PDFFlowManager
): Promise<void> {
  const pageWidth = doc.page.width;
  const margins = { left: 30, right: 50 };
  const maxWidth = pageWidth - margins.left - margins.right;

  let currentY = startY;
  doc.fillColor('#1e40af').fontSize(20).text('Priority Areas for Improvement', margins.left, currentY);
  currentY += 30;

  for (let i = 0; i < areas.length; i++) {
    const [category, score] = areas[i];
    doc.fillColor('#ef4444').fontSize(14).text(`${category} (Current Score: ${score.score}/100)`, margins.left, currentY);
    flow.markContentAdded();
    currentY += 18;
    const recommendation = getImprovementRecommendation(category, score.score);
    const recHeight = doc.heightOfString(recommendation, { width: maxWidth, lineGap: 3 });
    if (currentY + recHeight > doc.page.height - 90) {
      flow.addPage();
      currentY = flow.getCurrentY();
    }
    doc.fillColor('black').fontSize(10).text(recommendation, margins.left, currentY, {
      width: maxWidth,
      lineGap: 3
    });
    flow.markContentAdded();
    currentY = doc.y + 20;
  }
  flow.setCurrentY(currentY);
}

async function drawSummaryPage(
  doc: PDFKit.PDFDocument,
  startY: number,
  categoryScores: Record<string, CategoryScore>,
  flow: PDFFlowManager
): Promise<void> {
  let currentY = startY;
  const pageWidth = doc.page.width;
  const margins = { left: 30, right: 50 };
  const maxWidth = pageWidth - margins.left - margins.right;
  const ROW_HEIGHT = 22;

  doc.fontSize(22).fillColor('#1e40af').text('Performance Summary', margins.left, currentY, {
    width: maxWidth,
    align: 'center'
  });
  flow.markContentAdded();
  currentY = doc.y + 20;

  doc.fontSize(16).fillColor('#111827').text('Part I: Core Value Builder Drivers (70% weight)', margins.left, currentY);
  flow.markContentAdded();
  currentY = doc.y + 10;

  for (const driverName of coreDrivers) {
    const score = categoryScores[driverName];
    if (!score) continue;
    currentY += drawCategoryBar(doc, margins.left, currentY, driverName, score.score, score.weight, '');
    flow.markContentAdded();
  }

  currentY += 20;

  doc.fontSize(16).fillColor('#111827').text('Part II: Supplemental Deep-Dive Analysis (30% weight)', margins.left, currentY);
  flow.markContentAdded();
  currentY = doc.y + 10;

  for (const driverName of supplementalDrivers) {
    const score = categoryScores[driverName];
    if (!score) continue;
    currentY += drawCategoryBar(doc, margins.left, currentY, driverName, score.score, 0, '');
    flow.markContentAdded();
  }

  flow.setCurrentY(currentY);
}

function drawCategoryBar(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  name: string,
  score: number,
  weight: number,
  icon: string
): number {
  // FIXED: Use fixed height for each row
  const ROW_HEIGHT = 25;

  // Draw solid color circle instead of emoji
  const circleColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  doc.circle(x + 15, y + ROW_HEIGHT / 2, 10).fillColor(circleColor).fill();

  // Category name with fixed position
  doc.fontSize(11).fillColor('#111827').text(name, x + 40, y + 2, {
    width: 200,
    height: ROW_HEIGHT,
    align: 'left'
  });

  // Weight text if applicable
  if (weight > 0) {
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text(`(${Math.round(weight * 100)}% weight)`, x + 245, y + 3, {
        width: 80,
        height: ROW_HEIGHT
      });
  }

  // Progress bar with fixed dimensions
  const barX = x + 340;
  const barY = y + 8;
  const barWidth = 120;
  const barHeight = 8;

  doc.rect(barX, barY, barWidth, barHeight).fillColor('#e5e7eb').fill();

  const progressWidth = (score / 100) * barWidth;
  doc.rect(barX, barY, progressWidth, barHeight).fillColor(circleColor).fill();

  // Score number with fixed position
  doc.fontSize(12).fillColor('#111827').text(score.toString(), barX + barWidth + 10, y + 3, {
    width: 30,
    align: 'center'
  });

  // CRITICAL: Don't modify currentY here
  return ROW_HEIGHT + 5;
}

function generateCategoryDetailPage(
  doc: PDFKit.PDFDocument,
  category: string,
  score: CategoryScore,
  isCore: boolean
) {
  doc.addPage();
  const descriptions = isCore ? coreDriverDescriptions : supplementalDriverDescriptions;
  const details = (descriptions as Record<string, any>)[category];

  if (!details) return;

  drawScoreGauge(doc, 350, 50, score.score);

  doc.fontSize(24).fillColor('#1e40af').text(details.title, 50, 50, { width: 280 });

  doc.fontSize(12).fillColor('#6b7280').text(details.subtitle, 50, 80, { width: 280, lineGap: 3 });

  doc.fontSize(48).fillColor(getScoreColor(score.score)).text(`${score.score}`, 50, 120, {
    width: 100,
    align: 'center'
  });
  doc.fontSize(16).fillColor('#6b7280').text('/100', 150, 135);

  doc
    .fontSize(11)
    .fillColor('#111827')
    .text(details.description, 50, 200, {
      width: 500,
      align: 'justify',
      lineGap: 4
    });

  let currentY = doc.y + 20;
  doc.fontSize(14).fillColor('#1e40af').text('Key Assessment Areas:', 50, currentY);

  currentY += 20;
  details.insights.forEach((insight: string) => {
    doc.fontSize(10).fillColor('#374151').text(`• ${insight}`, 70, currentY, {
      width: 480,
      lineGap: 3
    });
    currentY = doc.y + 8;
  });

  if (score.score < 60) {
    currentY += 15;
    doc.fontSize(14).fillColor('#dc2626').text('Improvement Opportunities:', 50, currentY);

    currentY += 15;
    const recommendations = getImprovementRecommendation(category, score.score);
    doc.fontSize(10).fillColor('#374151').text(recommendations, 50, currentY, {
      width: 500,
      align: 'justify',
      lineGap: 4
    });
  }
}

async function drawCategoryDetail(
  doc: PDFKit.PDFDocument,
  startY: number,
  category: string,
  score: CategoryScore,
  answers: Record<string, AssessmentAnswer>,
  flow: PDFFlowManager
): Promise<void> {
  const pageWidth = doc.page.width;
  const margins = { left: 30, right: 50 };
  const gaugeWidth = 200;
  const gaugeX = Math.min(350, pageWidth - margins.right - gaugeWidth);
  const textWidth = gaugeX - margins.left - 20;

  let currentY = startY;

  // Draw gauge
  drawScoreGauge(doc, gaugeX, currentY, score.score);

  // Draw title and content
  const details = getCategoryDetails(category);

  doc.fontSize(20).fillColor('#1e40af')
    .text(details.title, margins.left, currentY, { width: textWidth });
  flow.markContentAdded();
  currentY = doc.y + 5;

  doc.fontSize(12).fillColor('#6b7280')
    .text(details.subtitle, margins.left, currentY, { width: textWidth });
  flow.markContentAdded();
  currentY = doc.y + 10;

  // Score display
  doc.fontSize(40).fillColor(getScoreColor(score.score))
    .text(score.score.toString(), margins.left, currentY, { width: 80, align: 'center' });
  doc.fontSize(14).fillColor('#6b7280')
    .text('/100', margins.left + 90, currentY + 12);
  flow.markContentAdded();
  currentY += 60;

  // Description
  const descHeight = doc.heightOfString(details.description, { width: textWidth, align: 'justify' });
  if (currentY + descHeight > doc.page.height - 90) {
    flow.addPage();
    currentY = flow.getCurrentY();
  }
  doc.fontSize(11).fillColor('#111827')
    .text(details.description, margins.left, currentY, {
      width: textWidth,
      align: 'justify'
    });
  flow.markContentAdded();
  currentY = doc.y + 20;

  // Key Assessment Areas
  doc.fontSize(14).fillColor('#1e40af')
    .text('Key Assessment Areas:', margins.left, currentY);
  flow.markContentAdded();
  currentY += 20;

  for (let i = 0; i < details.insights.length; i++) {
    const insight = details.insights[i];
    const insHeight = doc.heightOfString(`• ${insight}`, { width: textWidth - 20 });
    if (currentY + insHeight > doc.page.height - 90) {
      flow.addPage();
      currentY = flow.getCurrentY();
    }
    doc.fontSize(10).fillColor('#374151')
      .text(`• ${insight}`, margins.left + 20, currentY, {
        width: textWidth - 20
      });
    flow.markContentAdded();
    currentY = doc.y + 8;
  }

  // Improvement Opportunities
  currentY += 10;
  doc.fontSize(14).fillColor('#1e40af')
    .text('Improvement Opportunities:', margins.left, currentY);
  flow.markContentAdded();
  currentY += 15;

  const recommendations = getImprovementRecommendation(category, score.score);
  const recHeight = doc.heightOfString(recommendations, { width: textWidth, align: 'justify' });
  if (currentY + recHeight > doc.page.height - 90) {
    flow.addPage();
    currentY = flow.getCurrentY();
  }
  doc.fontSize(10).fillColor('#374151')
    .text(recommendations, margins.left, currentY, {
      width: textWidth,
      align: 'justify'
    });
  flow.markContentAdded();
  currentY = doc.y + 20;

  // CRITICAL FIX: AI Analysis Section
  if (score.score < 80) {
    // Add Analysis header
    doc.fontSize(12).fillColor('#1e40af')
      .text('Analysis:', margins.left, currentY);
    flow.markContentAdded();
    currentY += 15;

    // Generate or retrieve AI analysis
    const aiAnalysis = score.analysis || await generateCategoryInsight(category, score.score, answers);

    if (aiAnalysis && aiAnalysis.trim()) {
      // Split analysis into paragraphs for better formatting
      const paragraphs = aiAnalysis.split('\n').filter(p => p.trim());

      for (const paragraph of paragraphs) {
        // Check if we need a new page
        const paragraphHeight = doc.heightOfString(paragraph, {
          width: textWidth,
          align: 'justify'
        });

        if (currentY + paragraphHeight > doc.page.height - 90) {
          flow.addPage();
          currentY = flow.getCurrentY();
        }

        // Render the paragraph
        doc.fontSize(9).fillColor('#374151')
          .text(paragraph, margins.left, currentY, {
            width: textWidth,
            align: 'justify'
          });
        flow.markContentAdded();
        currentY = doc.y + 10;
      }
    } else {
      // Fallback if no analysis available
      doc.fontSize(9).fillColor('#6b7280')
        .text('Analysis is being generated...', margins.left, currentY, {
          width: textWidth,
          align: 'left'
        });
      flow.markContentAdded();
      currentY += 20;
    }
  }

  flow.setCurrentY(currentY + 20);
}

export async function generatePDFReport(
  userName: string,
  userEmail: string,
  companyName: string,
  industry: string,
  overallScore: number,
  categoryScores: Record<string, CategoryScore>,
  answers: Record<string, AssessmentAnswer>
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        bufferPages: true
      });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const footerText = `This report is confidential and proprietary to ${companyName || userName}`;
      const pageManager = new PDFPageManager(doc, footerText);
      const flowManager = new PDFFlowManager(doc, pageManager);

      await flowManager.addSection(300, async (doc, y, flow) => {
        const pageWidth = doc.page.width;
        const margins = { left: 30, right: 50 };
        const maxWidth = pageWidth - margins.left - margins.right;
        doc
          .fillColor('#1e40af')
          .fontSize(28)
          .text('Value Builder Assessment Report', margins.left, y + 20, {
            width: maxWidth,
            align: 'center'
          });
        flow.markContentAdded();

        let base = y + 120;
        doc.fillColor('black').fontSize(16);
        doc.text(`Assessed By: ${userName}`, margins.left, base);
        flow.markContentAdded();
        doc.text(`Email: ${userEmail}`, margins.left, base + 20);
        flow.markContentAdded();
        doc.text(`Company: ${companyName || 'Not Specified'}`, margins.left, base + 40);
        flow.markContentAdded();
        doc.text(`Industry: ${industry || 'Not Specified'}`, margins.left, base + 60);
        flow.markContentAdded();
        doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, margins.left, base + 80);
        flow.markContentAdded();
        flow.setCurrentY(base + 100);
      });

      await flowManager.addSection(400, async (doc, y, flow) => {
        const pageWidth = doc.page.width;
        const margins = { left: 30, right: 50 };
        const maxWidth = pageWidth - margins.left - margins.right;
        doc.fontSize(24).fillColor('#1e40af').text('Overall Value Builder Score', margins.left, y, {
          width: maxWidth,
          align: 'center'
        });
        flow.markContentAdded();

        drawScoreGauge(doc, Math.min(doc.page.width / 2 - 150, doc.page.width - 250), y + 40, overallScore);
        flow.markContentAdded();

        doc.fontSize(24).fillColor('#111827').text(`Grade: ${getGrade(overallScore)}`, margins.left, y + 240, {
          width: maxWidth,
          align: 'center'
        });
        flow.markContentAdded();
        flow.setCurrentY(y + 280);
      });

      const aiInsights = await generateAIInsights(
        answers,
        categoryScores,
        overallScore,
        companyName,
        industry
      );

      if (aiInsights && aiInsights.trim()) {
        const estimatedHeight = Math.min(800, 120 + aiInsights.split('\n').length * 15);
        await flowManager.addSection(estimatedHeight, async (doc, y, flow) => {
          await drawAIInsights(doc, y, aiInsights, flow);
        });
      }

      if (Object.keys(categoryScores).length > 0) {
        await flowManager.addSection(300, async (doc, y, flow) => {
          await drawSummaryPage(doc, y, categoryScores, flow);
        });
      }

      const areasForImprovement = Object.entries(categoryScores)
        .filter(([_, s]) => s.score < 60)
        .sort((a, b) => a[1].score - b[1].score);

      if (areasForImprovement.length > 0) {
        const estHeight = 100 + areasForImprovement.length * 80;
        await flowManager.addSection(estHeight, async (doc, y, flow) => {
          await drawPriorityAreas(doc, y, areasForImprovement, flow);
        });
      }

      const allCategories = [...coreDrivers, ...supplementalDrivers];
      for (const category of allCategories) {
        const score = categoryScores[category];
        if (!score) continue;
        // Ensure AI analysis is available
        if (score.score < 80 && !score.analysis) {
          try {
            score.analysis = await generateCategoryInsight(category, score.score, answers);
          } catch (error) {
            console.error(`Failed to generate analysis for ${category}:`, error);
            score.analysis = generateFallbackAnalysis(category, score.score);
          }
        }
        const baseHeight = 400;
        const extraHeight = score.score < 60 ? 200 : 0;
        const aiHeight = score.score < 80 ? 150 : 0;
        await flowManager.addSection(baseHeight + extraHeight + aiHeight, async (doc, y, flow) => {
          await drawCategoryDetail(doc, y, category, score, answers, flow);
        });
      }

      pageManager.addFooter();
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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

function getStrategicRecommendations(
  overallScore: number,
  categoryScores: Record<string, CategoryScore>
): string[] {
  const items: string[] = [];

  if (overallScore < 60) {
    items.push('Your business has significant opportunities for value improvement. Focus on the lowest-scoring areas first.');
    items.push('Consider engaging a business advisor to help develop a comprehensive improvement plan.');
  } else if (overallScore < 80) {
    items.push('Your business shows good potential. Targeted improvements in key areas can significantly increase value.');
    items.push('Prioritize 2-3 improvement areas and develop 90-day action plans for each.');
  } else {
    items.push('Your business is performing well. Focus on maintaining strengths while addressing any remaining gaps.');
    items.push('Consider strategic initiatives to move from good to exceptional in your strongest areas.');
  }

  const recurringRevScore = categoryScores['Recurring Revenue']?.score || 0;
  if (recurringRevScore < 60) {
    items.push('Urgently develop recurring revenue streams to improve business predictability and value.');
  }

  const hubSpokeScore = categoryScores['Hub & Spoke']?.score || 0;
  if (hubSpokeScore < 60) {
    items.push('Reduce owner dependence by developing management systems and key employee capabilities.');
  }

  return items;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

function getScoreBarColor(score: number): string {
  return getScoreColor(score);
}


