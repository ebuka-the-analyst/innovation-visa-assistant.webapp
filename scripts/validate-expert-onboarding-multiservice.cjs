const fs = require('fs');

const server = fs.readFileSync('server/expertApplicationRoutes.ts', 'utf8');
const client = fs.readFileSync('client/src/pages/expert-join.tsx', 'utf8');

if (!server.includes('services: z.array(consultationServiceSchema).min(1).max(8)')) {
  throw new Error('Expert application schema is not accepting multiple consultation services.');
}
if (/const consultationServiceSchema = z\.object\(\{\s*services: z\.array\(consultationServiceSchema\)/s.test(server)) {
  throw new Error('Expert consultation service schema is self-referential.');
}
if (!server.includes('fieldErrors')) {
  throw new Error('Expert application validation does not expose field-level errors.');
}
if (!client.includes('collectValidationIssues')) {
  throw new Error('Expert onboarding client-side validation summary is missing.');
}
if (!client.includes('id="expert-form-errors"')) {
  throw new Error('Expert onboarding validation error panel is missing.');
}

console.log('Expert multi-service onboarding validation passed.');
