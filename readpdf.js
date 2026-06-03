const { PDFParse, VerbosityLevel } = require('pdf-parse');
const fs = require('fs');

async function readPDF(file) {
  const buf = fs.readFileSync(file);
  const data = new Uint8Array(buf);
  const parser = new PDFParse({ data, verbosityLevel: VerbosityLevel.ERRORS });
  await parser.load();
  const result = await parser.getText();
  const pages = result.pages || [];
  return pages.map(p => p.text || '').join('\n\n--- PAGE BREAK ---\n\n');
}

async function main() {
  const e1 = await readPDF('etap1.pdf');
  const e2 = await readPDF('etap2.pdf');
  fs.writeFileSync('etap1_text.txt', e1, 'utf8');
  fs.writeFileSync('etap2_text.txt', e2, 'utf8');
  console.log('=== ETAP1 (II Мукур Трофи) ===');
  console.log(e1);
  console.log('\n\n=== ETAP2 (I Кочевник Трофи) ===');
  console.log(e2);
}

main().catch(console.error);
