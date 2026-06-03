const fs = require('fs');
const zlib = require('zlib');

function extractCompressed(file) {
  const buf = fs.readFileSync(file);
  const s = buf.toString('binary');
  const results = [];

  // Find all FlateDecode streams
  const streamRe = /stream\r?\n/g;
  const endRe = /\r?\nendstream/;
  let m;
  while ((m = streamRe.exec(s)) !== null) {
    const start = m.index + m[0].length;
    const endMatch = s.slice(start).search(endRe);
    if (endMatch < 0) continue;
    const raw = Buffer.from(s.slice(start, start + endMatch), 'binary');
    try {
      const inflated = zlib.inflateSync(raw).toString('utf8');
      if (inflated.includes('BT') || inflated.includes('Tj') || inflated.includes('TJ')) {
        results.push(inflated);
      }
    } catch(e) {}
  }
  return results;
}

function parseText(streams) {
  const lines = [];
  for (const s of streams) {
    // Match TJ arrays
    const re1 = /\[([^\]]+)\]\s*TJ/g;
    let m;
    while ((m = re1.exec(s)) !== null) {
      const parts = m[1].match(/\(([^)]*)\)/g) || [];
      const txt = parts.map(p => p.slice(1,-1)).join('').trim();
      if (txt.length > 0) lines.push(txt);
    }
    // Match Tj
    const re2 = /\(([^)]+)\)\s*Tj/g;
    while ((m = re2.exec(s)) !== null) {
      const txt = m[1].trim();
      if (txt.length > 0) lines.push(txt);
    }
  }
  return lines;
}

['etap1.pdf','etap2.pdf'].forEach(f => {
  console.log('\n=== ' + f + ' ===');
  const streams = extractCompressed(f);
  console.log('Streams with text:', streams.length);
  const lines = parseText(streams);
  console.log('Text lines found:', lines.length);
  lines.slice(0, 200).forEach(l => console.log(l));
});
