import PDFDocument from 'pdfkit';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';
import { CategoryScore } from '@shared/schema';

interface PDFSection {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'score' | 'gauge';
  content: string;
  level?: number;
  items?: string[];
  data?: any;
  style?: {
    fontSize?: number;
    color?: string;
    bold?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
    marginTop?: number;
    marginBottom?: number;
  };
}

export class HTMLToPDFBridge {
  private doc: PDFKit.PDFDocument;
  private pageWidth: number;
  private margins = { top: 50, bottom: 50, left: 50, right: 50 };

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: this.margins.top,
      bufferPages: true
    });
    this.pageWidth = this.doc.page.width - this.margins.left - this.margins.right;
  }

  async convertHTMLToPDF(html: string): Promise<Buffer> {
    const sections = this.parseHTMLToSections(html);

    for (const section of sections) {
      await this.renderSection(section);
    }

    return this.finalizePDF();
  }

  private parseHTMLToSections(html: string): PDFSection[] {
    const $ = cheerio.load(html);
    const sections: PDFSection[] = [];

    const processNode = (node: any) => {
      const $node = $(node);

      if ($node.is('h1, h2, h3, h4')) {
        const level = parseInt(node.tagName.substring(1));
        sections.push({
          type: 'heading',
          content: decode($node.text().trim()),
          level,
          style: {
            fontSize: level === 1 ? 28 : level === 2 ? 22 : level === 3 ? 18 : 14,
            color: '#1e40af',
            marginTop: level <= 2 ? 30 : 20,
            marginBottom: 10
          }
        });
      } else if ($node.is('p')) {
        const text = decode($node.text().trim());
        if (text) {
          sections.push({
            type: 'paragraph',
            content: text,
            style: {
              fontSize: 11,
              align: 'justify',
              marginBottom: 10
            }
          });
        }
      } else if ($node.is('ul, ol')) {
        const items: string[] = [];
        $node.find('li').each((_, li) => {
          items.push(decode($(li).text().trim()));
        });

        if (items.length > 0) {
          sections.push({
            type: 'list',
            content: '',
            items,
            style: {
              fontSize: 11,
              marginBottom: 15
            }
          });
        }
      } else if ($node.hasClass('category-score')) {
        const category = $node.attr('data-category') || '';
        const score = parseInt($node.attr('data-score') || '0');
        sections.push({
          type: 'score',
          content: category,
          data: { score, category },
          style: { marginTop: 10, marginBottom: 10 }
        });
      } else if ($node.find('[data-overall-score]').length > 0) {
        const scoreElem = $node.find('[data-overall-score]');
        const score = parseInt(scoreElem.attr('data-overall-score') || '0');
        sections.push({
          type: 'gauge',
          content: `Overall Score: ${score}/100`,
          data: { score },
          style: { align: 'center', marginTop: 30, marginBottom: 30 }
        });
      }

      $node.children().each((_, child) => {
        processNode(child);
      });
    };

    $('body').children().each((_, child) => {
      processNode(child);
    });

    return sections;
  }

  private checkPageSpace(neededSpace: number): void {
    const currentY = this.doc.y;
    const pageBottom = this.doc.page.height - this.margins.bottom;

    if (currentY + neededSpace > pageBottom) {
      this.doc.addPage();
      this.doc.y = this.margins.top;
    }
  }

  private async renderSection(section: PDFSection): Promise<void> {
    let estimatedHeight = 50;
    switch (section.type) {
      case 'heading':
        estimatedHeight = 40;
        break;
      case 'paragraph':
        estimatedHeight = this.doc.heightOfString(section.content, {
          width: this.pageWidth,
          align: section.style?.align || 'left'
        }) + 20;
        break;
      case 'gauge':
        estimatedHeight = 200;
        break;
      case 'list':
        estimatedHeight = (section.items?.length || 0) * 20 + 20;
        break;
    }
    this.checkPageSpace(estimatedHeight);

    const style = section.style || {};
    if (style.marginTop) {
      this.doc.moveDown(style.marginTop / 10);
    }

    switch (section.type) {
      case 'heading':
        this.renderHeading(section);
        break;
      case 'paragraph':
        this.renderParagraph(section);
        break;
      case 'gauge':
        await this.renderGauge(section);
        break;
      case 'score':
        this.renderScoreBar(section);
        break;
      case 'list':
        this.renderList(section);
        break;
    }

    if (style.marginBottom) {
      this.doc.moveDown(style.marginBottom / 10);
    }
  }

  private renderHeading(section: PDFSection): void {
    const { content, style = {}, level = 1 } = section;
    const fontSize = style.fontSize || (level === 1 ? 24 : level === 2 ? 18 : 14);

    this.doc
      .fontSize(fontSize)
      .fillColor(style.color || '#1e40af')
      .text(content, this.margins.left, this.doc.y, {
        width: this.pageWidth,
        align: style.align || 'left'
      });
  }

  private renderParagraph(section: PDFSection): void {
    const { content, style = {} } = section;

    this.doc
      .fontSize(style.fontSize || 11)
      .fillColor(style.color || '#374151')
      .text(content, this.margins.left, this.doc.y, {
        width: this.pageWidth,
        align: style.align || 'left',
        lineGap: 3
      });
  }

  private async renderGauge(section: PDFSection): Promise<void> {
    const { data } = section;
    const score = data?.score || 0;
    const centerX = this.doc.page.width / 2;
    const centerY = this.doc.y + 80;
    const radius = 60;

    const segments = [
      { start: 180, end: 225, color: '#ef4444' },
      { start: 225, end: 315, color: '#f59e0b' },
      { start: 315, end: 360, color: '#10b981' }
    ];

    segments.forEach(segment => {
      this.doc.save();
      const startAngle = (segment.start * Math.PI) / 180;
      const endAngle = (segment.end * Math.PI) / 180;
      (this.doc as any)
        .lineWidth(20)
        .strokeColor(segment.color)
        .arc(centerX, centerY, radius, startAngle, endAngle)
        .stroke();
      this.doc.restore();
    });

    let angle;
    if (score < 45) {
      angle = 180 + (score / 45) * 45;
    } else if (score < 80) {
      angle = 225 + ((score - 45) / 35) * 90;
    } else {
      angle = 315 + ((score - 80) / 20) * 45;
    }

    const needleAngle = (angle * Math.PI) / 180;
    const needleLength = radius - 10;
    const needleX = centerX + needleLength * Math.cos(needleAngle);
    const needleY = centerY + needleLength * Math.sin(needleAngle);

    this.doc
      .save()
      .lineWidth(3)
      .strokeColor('#374151')
      .moveTo(centerX, centerY)
      .lineTo(needleX, needleY)
      .stroke()
      .circle(centerX, centerY, 5)
      .fillColor('#374151')
      .fill()
      .restore();

    this.doc
      .fontSize(36)
      .fillColor(this.getScoreColor(score))
      .text(score.toString(), centerX - 25, centerY - 20, {
        width: 50,
        align: 'center'
      });

    this.doc.y = centerY + 80;
  }

  private renderScoreBar(section: PDFSection): void {
    const { content, data } = section;
    const score = data?.score || 0;
    const currentY = this.doc.y;

    this.doc
      .fontSize(12)
      .fillColor('#111827')
      .text(content, this.margins.left, currentY);

    const barX = this.margins.left + 300;
    const barY = currentY;
    const barWidth = 120;
    const barHeight = 8;

    this.doc
      .rect(barX, barY, barWidth, barHeight)
      .fillColor('#e5e7eb')
      .fill();

    const progressWidth = (score / 100) * barWidth;
    this.doc
      .rect(barX, barY, progressWidth, barHeight)
      .fillColor(this.getScoreColor(score))
      .fill();

    this.doc
      .fontSize(12)
      .fillColor('#111827')
      .text(score.toString(), barX + barWidth + 10, currentY);

    this.doc.moveDown();
  }

  private renderList(section: PDFSection): void {
    const { items = [], style = {} } = section;

    items.forEach(item => {
      this.doc
        .fontSize(style.fontSize || 11)
        .fillColor(style.color || '#374151')
        .text(`• ${item}`, this.margins.left + 20, this.doc.y);
    });
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  private finalizePDF(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      this.doc.on('data', chunk => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);
      this.doc.end();
    });
  }
}

export async function convertHTMLToPDF(html: string): Promise<Buffer> {
  const bridge = new HTMLToPDFBridge();
  return bridge.convertHTMLToPDF(html);
}
