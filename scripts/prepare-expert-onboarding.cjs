const fs = require('fs');
const path = require('path');

const root = process.cwd();
const file = (relative) => path.join(root, relative);

function update(relative, transform) {
  const target = file(relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-onboarding] prepared ${relative}`);
  }
}

update('client/src/App.tsx', (source) => {
  let next = source;

  if (!next.includes('const ExpertJoin = lazy(')) {
    const anchor = 'const ExpertBooking = lazy(() => import("@/pages/expert-booking"));';
    if (!next.includes(anchor)) throw new Error('Could not locate Expert Booking lazy-load anchor');
    next = next.replace(anchor, `${anchor}\nconst ExpertJoin = lazy(() => import("@/pages/expert-join"));`);
  }

  if (!next.includes('"/join-expert-network"')) {
    const routeList = next.match(/const SIDEBAR_HIDDEN_ROUTES = \[([^\]]*)\];/);
    if (!routeList) throw new Error('Could not locate public route list');
    const current = routeList[1].trim();
    next = next.replace(routeList[0], `const SIDEBAR_HIDDEN_ROUTES = [${current}${current ? ', ' : ''}"/join-expert-network"];`);
  }

  if (!next.includes('<Route path="/join-expert-network"')) {
    const anchor = '      <Route path="/expert-booking" component={ExpertBooking} />';
    if (!next.includes(anchor)) throw new Error('Could not locate Expert Booking route anchor');
    next = next.replace(anchor, `${anchor}\n      <Route path="/join-expert-network" component={ExpertJoin} />`);
  }

  return next;
});

update('server/index.ts', (source) => {
  let next = source;

  if (!next.includes('registerExpertApplicationRoutes')) {
    const importAnchor = 'import { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";';
    if (!next.includes(importAnchor)) throw new Error('Could not locate AI gateway import anchor');
    next = next.replace(importAnchor, `${importAnchor}\nimport { registerExpertApplicationRoutes } from "./expertApplicationRoutes";`);
  }

  if (!next.includes('registerExpertApplicationRoutes(app);')) {
    const routeAnchor = '  registerAIProviderGatewayRoutes(app);';
    if (!next.includes(routeAnchor)) throw new Error('Could not locate AI gateway route registration anchor');
    next = next.replace(routeAnchor, `${routeAnchor}\n  registerExpertApplicationRoutes(app);`);
  }

  return next;
});

console.log('[expert-onboarding] route preparation complete');
require('./prepare-expert-photo-upload.cjs');
