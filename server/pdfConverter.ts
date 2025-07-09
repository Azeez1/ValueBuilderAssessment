import puppeteer from 'puppeteer';

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const data = await page.pdf({ format: 'A4', printBackground: true });
    await page.close();
    return Buffer.from(data);
  } finally {
    await browser.close();
  }
}
