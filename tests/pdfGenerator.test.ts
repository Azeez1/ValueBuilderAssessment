import assert from 'node:assert';
import { PDFDocument } from 'pdf-lib';
delete process.env.OPENAI_API_KEY;
const { generatePDFReport, coreDrivers, supplementalDrivers } = await import('../server/pdfGenerator.js');
import type { CategoryScore } from '../shared/schema.js';

(async () => {
  const categoryScores: Record<string, CategoryScore> = {
    [coreDrivers[0]]: { name: coreDrivers[0], score: 75, weight: 0, maxScore: 100 }
  };

  const buffer = await generatePDFReport(
    'Test User',
    'user@example.com',
    'Test Co',
    'Software',
    75,
    categoryScores,
    {}
  );

  const pdf = await PDFDocument.load(buffer);
  const pageCount = pdf.getPageCount();
  console.log('Generated page count:', pageCount);
  assert(pageCount < 25, `PDF has ${pageCount} pages (expected < 25)`);
})();
