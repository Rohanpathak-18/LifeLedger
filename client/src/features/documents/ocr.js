export async function extractDocumentText(file, onProgress = () => {}) {
  let image = file;
  let canvas;
  if (file.type === 'application/pdf') {
    const [{ default: pdfWorkerUrl }, pdfjs] = await Promise.all([
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      import('pdfjs-dist'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    onProgress('Reading first page of PDF…');
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.7 });
    canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
    image = canvas;
  }
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, { logger: (entry) => {
    if (entry.status === 'loading language traineddata') onProgress('Loading the English text model…');
    else if (entry.status === 'recognizing text') onProgress(`Reading text · ${Math.round(entry.progress * 100)}%`);
  } });
  try {
    const result = await worker.recognize(image);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
    canvas?.remove();
  }
}

export function suggestDetails(text, filename) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dateMatch = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/) || text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  let purchaseDate = '';
  if (dateMatch) {
    if (dateMatch[1].startsWith('20')) purchaseDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    else purchaseDate = `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
  }
  const priceLine = lines.find((line) => /total|amount|paid|price/i.test(line) && /[$€£₹]|\d+[.,]\d{2}/.test(line)) || '';
  const priceMatch = priceLine.match(/(?:[$€£₹]\s*)?([\d,]+\.\d{2})/);
  const symbol = priceLine.match(/[$€£₹]/)?.[0];
  const currency = symbol === '₹' ? 'INR' : symbol === '€' ? 'EUR' : symbol === '£' ? 'GBP' : symbol === '$' ? 'USD' : '';
  const warrantyMatch = text.match(/(?:warranty.{0,24}?(\d+\s*(?:year|month)s?)|\b(\d+\s*(?:year|month)s?\s*warranty)\b)/i);
  const warranty = warrantyMatch?.[1] || warrantyMatch?.[2] || '';
  const fallback = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  const productName = lines.find((line) => line.length >= 4 && line.length <= 120) || fallback.slice(0, 120);
  return { productName, purchaseDate, purchasePrice: priceMatch ? priceMatch[1].replaceAll(',', '') : '', currency, warrantyPeriod: warranty };
}
