const fs = require('fs');
const path = require('path');

function update(relative, transform) {
  const target = path.join(process.cwd(), relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-notification-routes] prepared ${relative}`);
  }
}

update('server/routes.ts', (source) => {
  const oldFilter = "AND (n.target_type = 'all' OR (n.target_type = 'tier' AND n.target_value = ${tier}))";
  const newFilter = "AND (n.target_type = 'all' OR (n.target_type = 'tier' AND n.target_value = ${tier}) OR (n.target_type = 'user' AND n.target_value = ${userId}))";
  let next = source;
  if (next.includes(oldFilter)) next = next.split(oldFilter).join(newFilter);
  if (!next.includes("n.target_type = 'user' AND n.target_value = ${userId}")) {
    throw new Error('Could not enable user-targeted notification delivery');
  }
  return next;
});

update('client/src/pages/admin/ExpertNetwork.tsx', (source) => {
  let next = source;
  if (!next.includes('import { NotificationBell } from "@/components/NotificationBell";')) {
    const anchor = 'import { AdminSidebar } from "@/components/AdminSidebar";';
    if (!next.includes(anchor)) throw new Error('Could not locate Admin Expert Network sidebar import');
    next = next.replace(anchor, `${anchor}\nimport { NotificationBell } from "@/components/NotificationBell";`);
  }
  if (!next.includes('<NotificationBell />')) {
    const anchor = '            <Button variant="outline" size="sm" onClick={refreshNetwork}>';
    if (!next.includes(anchor)) throw new Error('Could not locate Admin Expert Network header actions');
    next = next.replace(anchor, `            <NotificationBell />\n${anchor}`);
  }
  return next;
});
