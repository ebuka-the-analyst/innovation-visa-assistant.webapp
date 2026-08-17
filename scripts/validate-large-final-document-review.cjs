const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const service = read('server/services/documentReviewService.ts');

const required = [
  'MAX_DOCUMENT_CHARS = 600_000',
  'CHUNK_TARGET_CHARS = 18_000',
  'splitDocumentIntoChunks',
  'analyzeWholeDocument',
  'Document content exceeds the',
  'Scores measure DOCUMENT PREPARATION QUALITY only. They are not success probabilities.',
];

for (const snippet of required) {
  if (!service.includes(snippet)) {
    throw new Error(`Large final document review support missing: ${snippet}`);
  }
}

if (service.includes('MAX_DOCUMENT_CHARS = 180_000')) {
  throw new Error('The old 180,000-character ceiling is still active.');
}

console.log('Large final document review validation passed.');
