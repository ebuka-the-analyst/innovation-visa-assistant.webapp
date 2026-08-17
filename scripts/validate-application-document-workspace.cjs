const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const workspace = read('client/src/components/ApplicationDocumentWorkspace.tsx');
const notice = read('client/src/components/ContextualDocumentNotice.tsx');
const app = read('client/src/App.tsx');
const toolRoutes = read('client/src/lib/toolRoutes.ts');
const badge = read('client/src/components/ui/badge.tsx');
const button = read('client/src/components/ui/button.tsx');
const main = read('client/src/main.tsx');
const attentionCss = read('client/src/attention-accessibility.css');

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

if (!workspace.includes('/api/view/html/${encodeURIComponent(String(latestCompletedPlan.id))}')) {
  throw new Error('Ready Business Plan must open the generated plan rather than linking back to My Documents.');
}

if (workspace.includes('href: completedPlan ? "/documents"')) {
  throw new Error('Business Plan Open action still contains a no-op My Documents link.');
}

for (const label of ['return "Open"', 'return "Continue"', 'return "Start"']) {
  if (!workspace.includes(label)) {
    throw new Error(`Missing ADHD-friendly workspace action label: ${label}`);
  }
}

if (!workspace.includes('aria-label={`${label} ${artefact.title}`}')) {
  throw new Error('Workspace actions must expose clear accessible action labels.');
}

if (!workspace.includes('data-app-status={artefact.status}')) {
  throw new Error('Workspace cards do not expose semantic status hooks.');
}

const toolLinks = [...workspace.matchAll(/href:\s*"\/tools\/([a-z0-9-]+)"/g)].map((match) => match[1]);
for (const toolId of new Set(toolLinks)) {
  if (!toolRoutes.includes(`'${toolId}': lazy(`)) {
    throw new Error(`Workspace action points to an unmapped tool route: ${toolId}`);
  }
}

for (const route of [
  '/questionnaire',
  '/progress',
  '/founder-portfolio',
  '/commercial-validation',
  '/traction-evidence',
  '/endorser-comparison',
  '/interview-prep',
  '/document-review',
]) {
  if (!app.includes(`<Route path="${route}"`)) {
    throw new Error(`Workspace action points to an unmapped application route: ${route}`);
  }
}

if (!badge.includes('bg-emerald-100') || !badge.includes('bg-red-100') || !badge.includes('bg-amber-100')) {
  throw new Error('Shared badges do not provide green, red and amber semantic status colours.');
}

if (!badge.includes('label.startsWith("ready ")') || !badge.includes('label.startsWith("not started ")')) {
  throw new Error('Shared badge status colouring is not applied broadly enough across the application.');
}

if (badge.includes('hover-elevate')) {
  throw new Error('Non-interactive status badges should not use attention-grabbing hover elevation.');
}

if (!button.includes('focus-visible:ring-2') || !button.includes('focus-visible:ring-offset-2')) {
  throw new Error('Buttons do not have a sufficiently visible keyboard focus state.');
}

if (!main.includes('import "./attention-accessibility.css"')) {
  throw new Error('ADHD-friendly attention accessibility styles are not loaded.');
}

for (const selector of ['.animate-ping', '.animate-ping-slow', '.animate-blink-2s']) {
  if (!attentionCss.includes(selector)) {
    throw new Error(`Attention animation is not bounded by ADHD-friendly CSS: ${selector}`);
  }
}

if (!attentionCss.includes('animation-iteration-count: 2 !important')) {
  throw new Error('Attention animations must settle after a short finite sequence.');
}

console.log('Application document workspace, navigation and ADHD accessibility validation passed.');
