import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';
import { AssessmentAnswer, CategoryScore } from '@shared/schema';
import {
  coreDriverDescriptions,
  supplementalDriverDescriptions
} from './reportTemplates';
import { generateAIInsights, generateCategoryInsight } from './openaiService';
import { questions } from '../client/src/data/questions';

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

class PDFPageManager {
  private hasContentOnCurrentPage = false;
  private currentY = 50;

  constructor(private doc: PDFKit.PDFDocument, private footerText: string) {}

  addFooter() {
    if (this.hasContentOnCurrentPage) {
      const pageBottom = this.doc.page.height - 40;
      this.doc.fontSize(8).fillColor('#6b7280');
      this.doc.text(this.footerText, 30, pageBottom, {
        width: this.doc.page.width - 60,
        align: 'center'
      });
    }
  }

  newPage() {
    if (this.hasContentOnCurrentPage) {
      this.addFooter();
      this.doc.addPage();
      this.hasContentOnCurrentPage = false;
      this.currentY = 50;
    }
  }

  addContent(height: number) {
    this.hasContentOnCurrentPage = true;
    this.currentY += height;
  }

  getCurrentY() {
    return this.currentY;
  }

  resetY() {
    this.currentY = 50;
  }
}

class PDFFlowManager {
  private currentY = 50;
  private readonly margins = { top: 50, bottom: 90 };

  constructor(private doc: PDFKit.PDFDocument, private pageManager: PDFPageManager) {}

  getCurrentY() {
    return this.currentY;
  }

  canFit(requiredHeight: number): boolean {
    return this.currentY + requiredHeight < this.doc.page.height - this.margins.bottom;
  }

  async addSection(requiredHeight: number, draw: (y: number) => void | Promise<void>) {
    if (!this.canFit(requiredHeight)) {
      this.pageManager.newPage();
      this.currentY = this.margins.top;
    }

    await draw(this.currentY);
    this.pageManager.addContent(requiredHeight);
    this.currentY += requiredHeight;
  }
}

function calculateCategoryHeight(score: CategoryScore): number {
  let height = 230;
  if (score.score < 80) height += 40;
  if (score.score < 60) height += 80;
  return height;
}

function drawScoreGauge(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  score: number
) {
  const centerX = x + 150;
  const centerY = y + 100;
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

  const angle = 180 + (score / 100) * 180;
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
}

function generateSummaryPage(
  doc: PDFKit.PDFDocument,
  categoryScores: Record<string, CategoryScore>,
  startY: number
) {
  let yPos = startY;
  const ROW_HEIGHT = 22;
  const SECTION_GAP = 20;

  doc.fontSize(22).fillColor('#1e40af').text('Performance Summary', 30, yPos, {
    width: doc.page.width - 60,
    align: 'center'
  });
  yPos += 40;

  // Part I heading
  doc.fontSize(16).fillColor('#111827').text('Part I: Core Value Builder Drivers (70% weight)', 30, yPos);
  yPos += SECTION_GAP;

  // Core drivers - NO EMOJIS
  const coreDrivers = [
    'Financial Performance',
    'Growth Potential',
    'Switzerland Structure',
    'Valuation Teeter-Totter',
    'Recurring Revenue',
    'Monopoly Control',
    'Customer Satisfaction',
    'Hub & Spoke'
  ];

  coreDrivers.forEach((driverName) => {
    const score = categoryScores[driverName];
    if (!score) return;

    drawCategoryBar(doc, 30, yPos, driverName, score.score, score.weight, '');
    yPos += ROW_HEIGHT + 5; // Fixed increment
  });

  // Add gap before Part II
  yPos += SECTION_GAP;

  // Part II heading
  doc.fontSize(16).fillColor('#111827').text('Part II: Supplemental Deep-Dive Analysis (30% weight)', 30, yPos);
  yPos += SECTION_GAP;

  // Supplemental drivers
  const supplementalDrivers = [
    'Financial Health & Analysis',
    'Market & Competitive Position',
    'Operational Excellence',
    'Human Capital & Organization',
    'Legal, Risk & Compliance',
    'Strategic Assets & Intangibles'
  ];

  supplementalDrivers.forEach((driverName) => {
    const score = categoryScores[driverName];
    if (!score) return;

    drawCategoryBar(doc, 30, yPos, driverName, score.score, 0, '');
    yPos += ROW_HEIGHT + 5;
  });
}

function drawCategoryBar(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  name: string,
  score: number,
  weight: number,
  icon: string
) {
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

async function generateCategoryDetailSection(
  doc: PDFKit.PDFDocument,
  category: string,
  score: CategoryScore,
  isCore: boolean,
  answers: Record<string, AssessmentAnswer>,
  startY: number
) {
  const descriptions = isCore ? coreDriverDescriptions : supplementalDriverDescriptions;
  const details = (descriptions as Record<string, any>)[category];

  if (!details) return;

  const pageWidth = doc.page.width;
  const leftMargin = 30;
  const maxX = doc.page.width - 50 - 200;
  const gaugeX = Math.min(350, maxX);
  const textWidth = gaugeX - 70;
  drawScoreGauge(doc, gaugeX, startY, score.score);

  let yPos = startY;

  doc.fontSize(20).fillColor('#1e40af').text(details.title, leftMargin, yPos, {
    width: textWidth
  });
  yPos = doc.y + 5;

  doc.fontSize(12).fillColor('#6b7280').text(details.subtitle, leftMargin, yPos, {
    width: textWidth,
    lineGap: 2
  });
  yPos = doc.y + 10;

  doc.fontSize(40).fillColor(getScoreColor(score.score)).text(`${score.score}`, leftMargin, yPos, {
    width: 80,
    align: 'center'
  });
  doc.fontSize(14).fillColor('#6b7280').text('/100', leftMargin + 90, yPos + 12);
  yPos += 50;

  doc
    .fontSize(11)
    .fillColor('#111827')
    .text(details.description, leftMargin, yPos, {
      width: textWidth,
      align: 'justify',
      lineGap: 3
    });

  let currentY = doc.y + 15;

  doc.fontSize(14).fillColor('#1e40af').text('Key Assessment Areas:', leftMargin, currentY);
  currentY += 18;
  details.insights.forEach((insight: string) => {
    doc.fontSize(10).fillColor('#374151').text(`• ${insight}`, leftMargin + 20, currentY, {
      width: textWidth - 20,
      lineGap: 2
    });
    currentY = doc.y + 6;
  });

  if (score.score < 60) {
    currentY += 12;
    doc.fontSize(14).fillColor('#dc2626').text('Improvement Opportunities:', leftMargin, currentY);

    currentY += 12;
    const recommendations = getImprovementRecommendation(category, score.score);
    doc.fontSize(10).fillColor('#374151').text(recommendations, leftMargin, currentY, {
      width: textWidth,
      align: 'justify',
      lineGap: 3
    });
  }

  if (score.score < 80) {
    const categoryAnswers = Object.entries(answers)
      .filter(([questionId]) => {
        const question = questions.find(q => q.id === questionId);
        return question?.section === category;
      })
      .map(([questionId, answer]) => ({
        question: questions.find(q => q.id === questionId)!,
        answer
      }));

    const categoryInsight = await generateCategoryInsight(
      category,
      score.score,
      categoryAnswers
    );

    if (categoryInsight && currentY < doc.page.height - 150) {
      currentY += 15;
      doc.fontSize(12).fillColor('#1e40af').text('Analysis:', leftMargin, currentY);
      currentY += 15;
      doc.fontSize(9).fillColor('#374151').text(categoryInsight, leftMargin, currentY, {
        width: textWidth,
        align: 'justify',
        lineGap: 3
      });
    }
  }
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
        margin: 30,
        bufferPages: true
      });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const footerText = `This report is confidential and proprietary to ${companyName || userName}`;
      const pageManager = new PDFPageManager(doc, footerText);
      const flowManager = new PDFFlowManager(doc, pageManager);

      await flowManager.addSection(300, (y) => {
        doc
          .fillColor('#1e40af')
          .fontSize(28)
          .text('Value Builder Assessment Report', 30, y + 20, {
            width: doc.page.width - 60,
            align: 'center'
          });

        let base = y + 120;
        doc.fillColor('black').fontSize(16);
        doc.text(`Assessed By: ${userName}`, 30, base);
        doc.text(`Email: ${userEmail}`, 30, base + 20);
        doc.text(`Company: ${companyName || 'Not Specified'}`, 30, base + 40);
        doc.text(`Industry: ${industry || 'Not Specified'}`, 30, base + 60);
        doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, 30, base + 80);
      });

      await flowManager.addSection(400, (y) => {
        doc.fontSize(24).fillColor('#1e40af').text('Overall Value Builder Score', 30, y, {
          width: doc.page.width - 60,
          align: 'center'
        });

        drawScoreGauge(doc, Math.min(doc.page.width / 2 - 150, doc.page.width - 250), y + 40, overallScore);

        doc.fontSize(24).fillColor('#111827').text(`Grade: ${getGrade(overallScore)}`, 30, y + 240, {
          width: doc.page.width - 60,
          align: 'center'
        });
      });

      const aiInsights = await generateAIInsights(
        answers,
        categoryScores,
        overallScore,
        companyName,
        industry
      );

      if (aiInsights && aiInsights.trim()) {
        const lines = aiInsights.split('\n');
        const estimatedHeight = 120 + lines.length * 12;
        await flowManager.addSection(estimatedHeight, async (y) => {
          doc.fontSize(24).fillColor('#1e40af').text('Executive Analysis & Strategic Insights', 30, y);
          doc.fontSize(10).fillColor('#6b7280').text('Powered by AI Analysis', 30, y + 30);

          let aiY = y + 60;
          for (const line of lines) {
            if (aiY > doc.page.height - 60) {
              pageManager.newPage();
              aiY = pageManager.getCurrentY();
            }

            const cleanLine = line.replace(/\*\*/g, '').trim();

            if (line.includes('**') && line.startsWith('**')) {
              doc.fontSize(14).fillColor('#1e40af').text(cleanLine, 30, aiY);
              aiY += 20;
            } else if (cleanLine.startsWith('-') || /^\d+\./.test(cleanLine)) {
              const content = cleanLine.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
              doc.fontSize(10).fillColor('#374151').text(`• ${content}`, 40, aiY, {
                width: doc.page.width - 80,
                lineGap: 2
              });
              aiY = doc.y + 8;
            } else if (cleanLine) {
              doc.fontSize(10).fillColor('#111827').text(cleanLine, 30, aiY, {
                width: doc.page.width - 60,
                align: 'justify',
                lineGap: 3
              });
              aiY = doc.y + 10;
            }
          }
        });
      }

      if (Object.keys(categoryScores).length > 0) {
        await flowManager.addSection(300, (y) => {
          generateSummaryPage(doc, categoryScores, y);
        });
      }

      const areasForImprovement = Object.entries(categoryScores)
        .filter(([_, s]) => s.score < 60)
        .sort((a, b) => a[1].score - b[1].score);

      if (areasForImprovement.length > 0) {
        const estHeight = 80 + areasForImprovement.length * 70;
        await flowManager.addSection(estHeight, (y) => {
          let yPos = y;
          doc.fillColor('#1e40af').fontSize(20).text('Priority Areas for Improvement', 30, yPos);
          yPos += 30;

          for (const [category, score] of areasForImprovement) {
            if (yPos > doc.page.height - 100) {
              pageManager.newPage();
              yPos = pageManager.getCurrentY();
            }

            doc
              .fillColor('#ef4444')
              .fontSize(14)
              .text(`${category} (Current Score: ${score.score}/100)`, 30, yPos);
            yPos += 18;

            const recommendation = getImprovementRecommendation(category, score.score);
            doc.fillColor('black').fontSize(10).text(recommendation, 30, yPos, {
              width: doc.page.width - 60,
              lineGap: 2
            });
            yPos = doc.y + 15;
          }
        });
      }

      const allCategories = [...coreDrivers, ...supplementalDrivers];
      for (const category of allCategories) {
        const score = categoryScores[category];
        if (!score) continue;
        const height = calculateCategoryHeight(score);
        await flowManager.addSection(height, async (y) => {
          await generateCategoryDetailSection(
            doc,
            category,
            score,
            coreDrivers.includes(category),
            answers,
            y
          );
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
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreBarColor(score: number): string {
  return getScoreColor(score);
}

