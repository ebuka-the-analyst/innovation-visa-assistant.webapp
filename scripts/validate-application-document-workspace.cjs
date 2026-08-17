const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspace = read('client/src/components/ApplicationDocumentWorkspace.tsx');
const notice = read('client/src/components/ContextualDocumentNotice.tsx');
const app = read('client/src/App.tsx');

const requiredCategories = [
  'Business & Strategy',
  'Financial',
  'AI Analysis & Diagnostics',
  'Evidence',
  'Endorsement',
  'Application Preparation',
  'Final Pack',
];

const requiredArtefacts = [
  'Business Plan',
  'Market Research',
  'Competitor Analysis',
  '36-Month Financial Model',
  'Financial Assumptions & Projections',
  'Innovation Assessment',
  'Viability Assessment',
  'Scalability Assessment',
  'Evidence Register',
  'Founder Capability & CV Evidence',
  'Customer Validation',
  'LOIs, Contracts & Traction Evidence',
  'Master Endorsement Evidence Dossier',
  'Pitch & Endorsement Material',
  'Endorser Preparation',
  'Interview Preparation',
  'Final Document Review',
  'Eligibility & Compliance Checks',
  'Final Application Pack',
  'Read Me First',
];

for (const category of requiredCategories) {
  if (!workspace.includes(`category: "${category}"`)) {
    throw new Error(`Missing document workspace category: ${category}`);
  }
}

for (const title of requiredArtefacts) {
  if (!workspace.includes(`title: "${title}"`)) {
    throw new Error(`Missing document workspace artefact: ${title}`);
  }
}

if (!workspace.includes('ApplicationDocumentWorkspaceContainer')) {
  throw new Error('My Documents does not have a self-loading application workspace container.');
}

if (!notice.includes('location === "/documents"') || !notice.includes('<ApplicationDocumentWorkspaceContainer />')) {
  throw new Error('The application document workspace is not mounted on My Documents.');
}

if (!app.includes('<ContextualDocumentNotice />')) {
  throw new Error('Contextual document access is not mounted in the authenticated application shell.');
}

for (const route of ['/dashboard', '/progress', '/questionnaire', '/generation', '/interview-prep']) {
  if (!notice.includes(route)) {
    throw new Error(`Missing contextual document access for ${route}.`);
  }
}

for (const anchor of ['business-strategy', 'financial', 'ai-analysis-diagnostics', 'evidence', 'endorsement', 'application-preparation']) {
  if (!notice.includes(`libraryAnchor: "${anchor}"`)) {
    throw new Error(`Missing contextual My Documents anchor: ${anchor}`);
  }
}

if (!workspace.includes('Uploaded files are not automatically counted as verified evidence.')) {
  throw new Error('Evidence-safety wording is missing for traction evidence.');
}

if (!workspace.includes('doc.status === "verified"')) {
  throw new Error('Founder evidence must not be marked ready from an unverified upload.');
}

if (workspace.includes('status: tractionEvidenceStarted ? "ready"')) {
  throw new Error('Uploaded traction candidates must not be promoted directly to ready evidence.');
}

if (!workspace.includes('finalPackReady = dossierReady && requiredDocumentsComplete && reviewReady && complianceReady')) {
  throw new Error('Final Pack readiness is not tied to the required preparation checks.');
}

console.log('Application document workspace validation passed.');
