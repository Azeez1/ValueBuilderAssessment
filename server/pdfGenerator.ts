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

function generateSummaryPage(doc: PDFKit.PDFDocument, categoryScores: Record<string, CategoryScore>) {
  doc.addPage();

  // Start with fixed Y position
  let yPos = 50;
  const ROW_HEIGHT = 25;
  const SECTION_GAP = 30;

  doc.fontSize(24).fillColor('#1e40af').text('Performance Summary', 50, yPos, {
    width: doc.page.width - 100,
    align: 'center'
  });
  yPos += 50;

  // Part I heading
  doc.fontSize(16).fillColor('#111827').text('Part I: Core Value Builder Drivers (70% weight)', 50, yPos);
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

    drawCategoryBar(doc, 50, yPos, driverName, score.score, score.weight, '');
    yPos += ROW_HEIGHT + 5; // Fixed increment
  });

  // Add gap before Part II
  yPos += SECTION_GAP;

  // Part II heading
  doc.fontSize(16).fillColor('#111827').text('Part II: Supplemental Deep-Dive Analysis (30% weight)', 50, yPos);
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

    // Check if we need a new page
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 50;
    }

    drawCategoryBar(doc, 50, yPos, driverName, score.score, 0, '');
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

async function generateCategoryDetailPageWithAI(
  doc: PDFKit.PDFDocument,
  category: string,
  score: CategoryScore,
  isCore: boolean,
  answers: Record<string, AssessmentAnswer>
) {
  const descriptions = isCore ? coreDriverDescriptions : supplementalDriverDescriptions;
  const details = (descriptions as Record<string, any>)[category];

  if (!details) return;

  // Position gauge on the far right
  const pageWidth = doc.page.width;
  const gaugeX = pageWidth - 280;
  drawScoreGauge(doc, gaugeX, 50, score.score);

  // Constrain text width to avoid gauge overlap
  const textMaxWidth = gaugeX - 100;

  // Title
  doc.fontSize(24).fillColor('#1e40af').text(details.title, 50, 50, {
    width: textMaxWidth
  });

  // Subtitle
  doc.fontSize(12).fillColor('#6b7280').text(details.subtitle, 50, 80, {
    width: textMaxWidth,
    lineGap: 3
  });

  // Score display
  doc.fontSize(48).fillColor(getScoreColor(score.score)).text(`${score.score}`, 50, 120, {
    width: 100,
    align: 'center'
  });
  doc.fontSize(16).fillColor('#6b7280').text('/100', 150, 135);

  // Main description
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text(details.description, 50, 200, {
      width: textMaxWidth,
      align: 'justify',
      lineGap: 4
    });

  let currentY = doc.y + 20;

  // Key Assessment Areas
  doc.fontSize(14).fillColor('#1e40af').text('Key Assessment Areas:', 50, currentY);
  currentY += 20;
  details.insights.forEach((insight: string) => {
    doc.fontSize(10).fillColor('#374151').text(`• ${insight}`, 70, currentY, {
      width: textMaxWidth - 20,
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
      width: textMaxWidth,
      align: 'justify',
      lineGap: 4
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
      doc.fontSize(12).fillColor('#1e40af').text('Analysis:', 50, currentY);
      currentY += 15;
      doc.fontSize(9).fillColor('#374151').text(categoryInsight, 50, currentY, {
        width: textMaxWidth,
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
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Helper to add footer to current page only
      const addFooterToCurrentPage = () => {
        const pageBottom = doc.page.height - 40;
        doc.fontSize(8).fillColor('#6b7280');
        doc.text(
          `This report is confidential and proprietary to ${companyName || userName}`,
          50,
          pageBottom,
          { width: doc.page.width - 100, align: 'center' }
        );
        doc.text(
          `Generated by Value Builder Assessment™ | ${new Date().toISOString().split('T')[0]}`,
          50,
          pageBottom + 10,
          { width: doc.page.width - 100, align: 'center' }
        );
        doc.text(
          'For questions, contact: aoseni@duxvitaecapital.com',
          50,
          pageBottom + 20,
          { width: doc.page.width - 100, align: 'center' }
        );
      };

      // Title Page
      doc.fillColor('#1e40af').fontSize(28).text('Value Builder Assessment Report', 50, 100, {
        width: doc.page.width - 100,
        align: 'center'
      });

      let yPos = 200;
      doc.fillColor('black').fontSize(16);
      doc.text(`Assessed By: ${userName}`, 50, yPos);
      doc.text(`Email: ${userEmail}`, 50, yPos + 25);
      doc.text(`Company: ${companyName || 'Not Specified'}`, 50, yPos + 50);
      doc.text(`Industry: ${industry || 'Not Specified'}`, 50, yPos + 75);
      doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, 50, yPos + 100);

      addFooterToCurrentPage();

      // Score Page - NO EMPTY PAGE BEFORE THIS
      doc.addPage();
      doc.fontSize(24).fillColor('#1e40af').text('Overall Value Builder Score', 50, 50, {
        width: doc.page.width - 100,
        align: 'center'
      });

      drawScoreGauge(doc, doc.page.width / 2 - 150, 100, overallScore);

      doc.fontSize(24).fillColor('#111827').text(`Grade: ${getGrade(overallScore)}`, 50, 300, {
        width: doc.page.width - 100,
        align: 'center'
      });

      addFooterToCurrentPage();

      // AI Insights - NO EMPTY PAGE
      const aiInsights = await generateAIInsights(
        answers,
        categoryScores,
        overallScore,
        companyName,
        industry
      );

      doc.addPage();
      doc.fontSize(24).fillColor('#1e40af').text('Executive Analysis & Strategic Insights', 50, 50);
      doc.fontSize(10).fillColor('#6b7280').text('Powered by AI Analysis', 50, 80);

      // Parse AI insights properly
      let aiY = 110;
      const lines = aiInsights.split('\n');

      for (const line of lines) {
        if (aiY > doc.page.height - 80) {
          addFooterToCurrentPage();
          doc.addPage();
          aiY = 50;
        }

        const cleanLine = line.replace(/\*\*/g, '').trim();

        if (line.includes('**') && line.startsWith('**')) {
          // Section header
          doc.fontSize(14).fillColor('#1e40af').text(cleanLine, 50, aiY);
          aiY += 25;
        } else if (cleanLine.startsWith('-') || /^\d+\./.test(cleanLine)) {
          // Bullet or numbered item
          const content = cleanLine.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
          doc.fontSize(10).fillColor('#374151').text(`• ${content}`, 60, aiY, {
            width: doc.page.width - 120,
            lineGap: 3
          });
          aiY = doc.y + 10;
        } else if (cleanLine) {
          // Regular paragraph
          doc.fontSize(10).fillColor('#111827').text(cleanLine, 50, aiY, {
            width: doc.page.width - 100,
            align: 'justify',
            lineGap: 4
          });
          aiY = doc.y + 12;
        }
      }

      addFooterToCurrentPage();

      // Summary page
      generateSummaryPage(doc, categoryScores);
      addFooterToCurrentPage();

      // Priority Areas - Only if needed
      const areasForImprovement = Object.entries(categoryScores)
        .filter(([_, s]) => s.score < 60)
        .sort((a, b) => a[1].score - b[1].score);

      if (areasForImprovement.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fillColor('#1e40af').fontSize(20).text('Priority Areas for Improvement', 50, yPos);
        yPos += 35;

        for (const [category, score] of areasForImprovement) {
          if (yPos > doc.page.height - 120) {
            addFooterToCurrentPage();
            doc.addPage();
            yPos = 50;
          }

          doc.fillColor('#ef4444').fontSize(14)
            .text(`${category} (Current Score: ${score.score}/100)`, 50, yPos);
          yPos += 20;

          const recommendation = getImprovementRecommendation(category, score.score);
          doc.fillColor('black').fontSize(11).text(recommendation, 50, yPos, {
            width: doc.page.width - 100,
            lineGap: 3
          });
          yPos = doc.y + 20;
        }

        addFooterToCurrentPage();
      }

      // Strategic Recommendations
      const strategicRecs = getStrategicRecommendations(overallScore, categoryScores);
      if (strategicRecs.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fillColor('#1e40af').fontSize(20).text('Strategic Recommendations', 50, yPos);
        yPos += 35;

        for (const rec of strategicRecs) {
          if (yPos > doc.page.height - 80) {
            addFooterToCurrentPage();
            doc.addPage();
            yPos = 50;
          }

          doc.fontSize(11).fillColor('black').text(`• ${rec}`, 50, yPos, {
            width: doc.page.width - 100,
            lineGap: 3
          });
          yPos = doc.y + 10;
        }

        addFooterToCurrentPage();
      }

      // Category detail pages - combine consecutively without blank pages
      let categoriesProcessed = 0;
      const allCategories = [...coreDrivers, ...supplementalDrivers];

      for (const category of allCategories) {
        if (categoryScores[category]) {
          if (categoriesProcessed > 0) {
            addFooterToCurrentPage();
          }
          doc.addPage();

          await generateCategoryDetailPageWithAI(
            doc,
            category,
            categoryScores[category],
            coreDrivers.includes(category),
            answers
          );

          categoriesProcessed++;
        }
      }

      if (categoriesProcessed > 0) {
        addFooterToCurrentPage();
      }

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

