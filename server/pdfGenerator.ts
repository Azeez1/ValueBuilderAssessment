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


  doc
    .fontSize(8)
    .fillColor('#9ca3af')
    .text('The ValueBuilder System™', centerX - 60, centerY - 30, {
      width: 120,
      align: 'center'
    });
}

function generateSummaryPage(doc: PDFKit.PDFDocument, categoryScores: Record<string, CategoryScore>) {
  doc.addPage();
  let currentY = 50;

  doc.fontSize(24).fillColor('#1e40af').text('Performance Summary', 50, currentY, {
    align: 'center'
  });
  currentY += 40;

  doc.fontSize(16).fillColor('#111827').text('Part I: Core Value Builder Drivers (70% weight)', 50, currentY);
  currentY += 30;

  const coreDriverInfo = [
    { name: 'Financial Performance', icon: '📊', industryAvg: 38 },
    { name: 'Growth Potential', icon: '📈', industryAvg: 61 },
    { name: 'Switzerland Structure', icon: '🛡️', industryAvg: 65 },
    { name: 'Valuation Teeter-Totter', icon: '⚖️', industryAvg: 59 },
    { name: 'Recurring Revenue', icon: '🔄', industryAvg: 35 },
    { name: 'Monopoly Control', icon: '💎', industryAvg: 55 },
    { name: 'Customer Satisfaction', icon: '👥', industryAvg: 81 },
    { name: 'Hub & Spoke', icon: '⚙️', industryAvg: 52 }
  ];

  coreDriverInfo.forEach((driver) => {
    const score = categoryScores[driver.name];
    if (!score) return;

    drawCategoryBar(doc, 50, currentY, driver.name, score.score, score.weight, driver.icon);
    currentY += 35;
  });

  currentY += 20;
  doc.fontSize(16).fillColor('#111827').text('Part II: Supplemental Deep-Dive Analysis (30% weight)', 50, currentY);
  currentY += 30;

  const supplementalDriverInfo = [
    { name: 'Financial Health & Analysis', icon: '📊' },
    { name: 'Market & Competitive Position', icon: '🎯' },
    { name: 'Operational Excellence', icon: '⚙️' },
    { name: 'Human Capital & Organization', icon: '👥' },
    { name: 'Legal, Risk & Compliance', icon: '⚖️' },
    { name: 'Strategic Assets & Intangibles', icon: '💎' }
  ];

  supplementalDriverInfo.forEach((driver) => {
    const score = categoryScores[driver.name];
    if (!score) return;

    drawCategoryBar(doc, 50, currentY, driver.name, score.score, 0, driver.icon);
    currentY += 35;
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
  const iconColor = score < 33 ? '#ef4444' : score < 67 ? '#f59e0b' : '#10b981';
  doc.circle(x + 15, y + 10, 15).fillColor(iconColor).fill();
  doc.fontSize(12).fillColor('white').text(icon, x + 10, y + 5, { width: 10 });

  doc.fontSize(12).fillColor('#111827').text(name, x + 40, y + 5);

  if (weight > 0) {
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text(`(${Math.round(weight * 100)}% weight)`, x + 200, y + 7);
  }

  const barX = x + 340;
  const barWidth = 150;
  const barHeight = 8;

  doc.rect(barX, y + 8, barWidth, barHeight).fillColor('#e5e7eb').fill();

  const progressWidth = (score / 100) * barWidth;
  const barColor = score < 33 ? '#ef4444' : score < 67 ? '#f59e0b' : '#10b981';
  doc.rect(barX, y + 8, progressWidth, barHeight).fillColor(barColor).fill();

  doc.fontSize(14).fillColor('#111827').text(score.toString(), x + 510, y + 5, {
    width: 30,
    align: 'right'
  });
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
  generateCategoryDetailPage(doc, category, score, isCore);

  let currentY = doc.y;

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
      doc.fontSize(12).fillColor('#1e40af').text('GPT-4.1 Analysis:', 50, currentY);
      currentY += 15;
      doc.fontSize(9).fillColor('#374151').text(categoryInsight, 50, currentY, {
        width: 500,
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

      if (!categoryScores || Object.keys(categoryScores).length === 0) {
        doc.text('No assessment data available', 50, 50);
        doc.end();
        return;
      }

      const pageMargin = 50;
      let currentY = pageMargin;

      const addFooter = () => {
        const footerY = doc.page.height - pageMargin + 10;
        doc.fontSize(10).fillColor('#6b7280');
        doc.text(
          `This report is confidential and proprietary to ${companyName || userName}`,
          pageMargin,
          footerY,
          { width: doc.page.width - pageMargin * 2, align: 'center' }
        );
        doc.text(
          `Generated by Value Builder Assessment™ | ${new Date().toISOString()}`,
          { width: doc.page.width - pageMargin * 2, align: 'center' }
        );
        doc.text(
          'For questions, contact: aoseni@duxvitaecapital.com',
          { width: doc.page.width - pageMargin * 2, align: 'center' }
        );
      };

      const checkAndAddPage = (requiredSpace: number) => {
        if (currentY + requiredSpace > doc.page.height - pageMargin) {
          addFooter();
          doc.addPage();
          currentY = pageMargin;
        }
      };

      console.log('Generating AI insights with GPT-4.1...');
      const aiInsights = await generateAIInsights(
        answers,
        categoryScores,
        overallScore,
        companyName,
        industry
      );

      // Title Page
      doc.fillColor('#1e40af').fontSize(28).text('Value Builder Assessment Report', {
        align: 'center'
      });
      currentY = doc.y + 20;
      doc.fillColor('black').fontSize(16);
      doc.text(`Assessed By: ${userName}`, pageMargin, currentY);
      currentY = doc.y;
      doc.text(`Email: ${userEmail}`);
      currentY = doc.y;
      doc.text(`Company: ${companyName || 'Not Specified'}`);
      currentY = doc.y;
      doc.text(`Industry: ${industry || 'Not Specified'}`);
      currentY = doc.y;
      doc.text(
        `Assessment Date: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`
      );
      addFooter();

      // Overall Score Page with Gauge
      doc.addPage();
      doc.fontSize(24).fillColor('#1e40af').text('Overall Value Builder Score', 50, 50, {
        align: 'center'
      });

      drawScoreGauge(doc, doc.page.width / 2 - 150, 100, overallScore);

      doc.fontSize(24).fillColor('#111827').text(`Grade: ${getGrade(overallScore)}`, 50, 300, {
        align: 'center'
      });
      addFooter();

      // AI Insights Page
      doc.addPage();
      doc.fontSize(24).fillColor('#1e40af')
        .text('Executive Analysis & Strategic Insights', 50, 50);

      doc.fontSize(10).fillColor('#6b7280')
        .text('Powered by GPT-4.1 AI Analysis', 50, 80);

      const insightLines = aiInsights.split('\n');
      let insightY = 110;
      let currentSection = '';

      insightLines.forEach(line => {
        if (insightY > doc.page.height - 100) {
          doc.addPage();
          insightY = 50;
        }

        if (line.includes('**') && line.includes('**')) {
          currentSection = line.replace(/\*\*/g, '');
          doc.fontSize(14).fillColor('#1e40af')
            .text(currentSection, 50, insightY);
          insightY += 20;
        } else if (line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
          doc.fontSize(10).fillColor('#374151')
            .text(line.trim(), 60, insightY, { width: 480, lineGap: 3 });
          insightY = doc.y + 8;
        } else if (line.trim()) {
          doc.fontSize(10).fillColor('#111827')
            .text(line.trim(), 50, insightY, { width: 500, align: 'justify', lineGap: 4 });
          insightY = doc.y + 10;
        }
      });
      addFooter();

      // Summary Page
      generateSummaryPage(doc, categoryScores);
      addFooter();
      doc.addPage();
      currentY = pageMargin;
      const barWidth = doc.page.width - pageMargin * 2;

      // Areas for Improvement
      const areasForImprovement = Object.entries(categoryScores)
        .filter(([_, s]) => s.score < 60)
        .sort((a, b) => a[1].score - b[1].score);

      if (areasForImprovement.length > 0) {
        doc.fillColor('#1e40af').fontSize(20).text('Priority Areas for Improvement', pageMargin, currentY);
        currentY = doc.y + 10;
        for (const [category, score] of areasForImprovement) {
          const recommendation = getImprovementRecommendation(category, score.score);
          checkAndAddPage(50);
          doc.fillColor('#ef4444').fontSize(16).text(`${category} (Current Score: ${score.score}/100)`, pageMargin, currentY);
          currentY = doc.y + 5;
          doc.fillColor('black').fontSize(12).text(recommendation, pageMargin, currentY, {
            width: barWidth,
            lineGap: 5
          });
          currentY = doc.y + 15;
        }
        addFooter();
        doc.addPage();
        currentY = pageMargin;
      }

      // Strategic Recommendations
      const strategicRecs = getStrategicRecommendations(overallScore, categoryScores);
      doc.fillColor('#1e40af').fontSize(20).text('Strategic Recommendations', pageMargin, currentY);
      currentY = doc.y + 10;
      for (const rec of strategicRecs) {
        checkAndAddPage(20);
        doc.fontSize(12).fillColor('black').text(`• ${rec}`, pageMargin, currentY, {
          width: barWidth,
          lineGap: 5
        });
        currentY = doc.y + 5;
      }

      addFooter();

      for (const category of coreDrivers) {
        if (categoryScores[category]) {
          await generateCategoryDetailPageWithAI(
            doc,
            category,
            categoryScores[category],
            true,
            answers
          );
          addFooter();
        }
      }

      for (const category of supplementalDrivers) {
        if (categoryScores[category]) {
          await generateCategoryDetailPageWithAI(
            doc,
            category,
            categoryScores[category],
            false,
            answers
          );
          addFooter();
        }
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
  if (score >= 67) return '#10b981';
  if (score >= 34) return '#f59e0b';
  return '#ef4444';
}

function getScoreBarColor(score: number): string {
  return getScoreColor(score);
}

