const fs = require('fs');

const file = 'server/email.ts';
let text = fs.readFileSync(file, 'utf8');

const oldBlock = `// Always use production URL for email links since emails go to real users\nconst BASE_URL = process.env.BASE_URL;\nif (!BASE_URL && process.env.NODE_ENV === 'production') {\n  throw new Error('[Email] BASE_URL is required in production.');\n}\n`;

const newBlock = `// Resolve the public base URL without making an optional email setting fatal to app startup.\n// BASE_URL remains the preferred branded URL. Railway automatically exposes\n// RAILWAY_PUBLIC_DOMAIN, which is a safe runtime fallback for link generation.\nfunction resolveBaseUrl(): string {\n  const configured = process.env.BASE_URL?.trim();\n  if (configured) return configured.replace(/\\/+$/, '');\n\n  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();\n  if (railwayDomain) {\n    const host = railwayDomain.replace(/^https?:\\/\\//i, '').replace(/\\/+$/, '');\n    return \\`https://\\${host}\\`;\n  }\n\n  if (process.env.NODE_ENV !== 'production') return 'http://localhost:5000';\n\n  console.warn('[Email] BASE_URL is not configured and RAILWAY_PUBLIC_DOMAIN is unavailable. Link-bearing emails will fail when requested, but the web application will continue to run.');\n  return '';\n}\n\nconst BASE_URL = resolveBaseUrl();\n\nfunction requireBaseUrl(): string {\n  if (!BASE_URL) {\n    throw new Error('[Email] BASE_URL or RAILWAY_PUBLIC_DOMAIN is required for link-bearing emails.');\n  }\n  return BASE_URL;\n}\n`;

if (!text.includes(oldBlock)) {
  throw new Error('Expected BASE_URL startup block was not found');
}
text = text.replace(oldBlock, newBlock);

text = text.replace(
  'const resetUrl = `${BASE_URL || "http://localhost:5000"}/reset-password?token=${token}`;',
  'const resetUrl = `${requireBaseUrl()}/reset-password?token=${token}`;',
);
text = text.replace(
  'const verificationUrl = `${BASE_URL || "http://localhost:5000"}/verify-email?token=${token}`;',
  'const verificationUrl = `${requireBaseUrl()}/verify-email?token=${token}`;',
);

fs.writeFileSync(file, text);
console.log('Patched server/email.ts to avoid fatal startup when BASE_URL is absent.');
