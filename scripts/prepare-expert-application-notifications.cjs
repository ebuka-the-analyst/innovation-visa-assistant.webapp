const fs = require('fs');
const path = require('path');

function update(relative, transform) {
  const target = path.join(process.cwd(), relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-application-notifications] prepared ${relative}`);
  }
}

function replaceBetween(source, startAnchor, endAnchor, replacement, label) {
  const start = source.indexOf(startAnchor);
  if (start < 0) throw new Error(`Could not locate ${label} start anchor`);
  const end = source.indexOf(endAnchor, start);
  if (end < 0) throw new Error(`Could not locate ${label} end anchor`);
  return source.slice(0, start) + replacement + source.slice(end);
}

update('server/expertApplicationRoutes.ts', (source) => {
  let next = source;

  if (!next.includes('from "./expertNotificationService"')) {
    const anchor = 'import { sendEmail } from "./email";';
    if (!next.includes(anchor)) throw new Error('Could not locate expert application email import');
    next = next.replace(
      anchor,
      `${anchor}\nimport { queueAdminExpertNetworkAlert, queueExpertProfileEmail } from "./expertNotificationService";`,
    );
  }

  const reviewRouteStart = next.indexOf('app.patch("/api/admin/expert-applications/:applicationId/review"');
  if (reviewRouteStart < 0) throw new Error('Could not locate expert application review route');
  const reviewCommit = next.indexOf('      await client.query("COMMIT");', reviewRouteStart);
  const reviewReturn = next.indexOf('      return res.json({ success: true, decision: parsed.data.decision });', reviewCommit);
  if (reviewCommit < 0 || reviewReturn < 0) throw new Error('Could not locate expert application review notification block');

  const reviewNotificationBlock = [
    '      if (application.email) {',
    '        await queueExpertProfileEmail({',
    '          expertEmail: application.email,',
    '          expertName: application.firstName || "Professional",',
    '          expertId: application.expertId,',
    '          eventType: approved ? "expert_application_approved" : "expert_application_rejected",',
    '          subject: approved ? "Your Expert Support profile has been approved" : "Update on your Expert Support profile",',
    '          message: approved',
    '            ? "Your Expert Support profile has been verified by the platform administrator and can now be displayed for consultation bookings."',
    '            : `Your Expert Support profile is not being published at this time.${parsed.data.notes ? ` Notes: ${parsed.data.notes}` : ""}`,',
    '          dedupeRevision: { applicationId: application.id, decision: parsed.data.decision, notes: parsed.data.notes || "" },',
    '        }, client);',
    '      }',
    '      await queueAdminExpertNetworkAlert({',
    '        eventType: approved ? "expert_application_approved" : "expert_application_rejected",',
    '        title: approved ? "Expert application approved" : "Expert application rejected",',
    '        message: `${application.firstName || "Professional"} (${application.email || "no email"}) was ${parsed.data.decision}.`,',
    '        actionUrl: "/admin/expert-network",',
    '        dedupeRevision: { applicationId: application.id, decision: parsed.data.decision, notes: parsed.data.notes || "" },',
    '      }, client);',
    '      await client.query("COMMIT");',
    '',
  ].join('\n');

  next = next.slice(0, reviewCommit) + reviewNotificationBlock + next.slice(reviewReturn);

  const submitRouteStart = next.indexOf('app.post("/api/expert-applications/submit"');
  if (submitRouteStart < 0) throw new Error('Could not locate expert application submit route');
  const submitCommit = next.indexOf('      await client.query("COMMIT");', submitRouteStart);
  const submitReturn = next.indexOf('      return res.status(201).json({', submitCommit);
  if (submitCommit < 0 || submitReturn < 0) throw new Error('Could not locate expert application submit notification block');

  const submitNotificationBlock = [
    '      await queueExpertProfileEmail({',
    '        expertEmail: input.email,',
    '        expertName: `${input.firstName} ${input.lastName}`.trim(),',
    '        expertId: expert.id,',
    '        eventType: "expert_application_received",',
    '        subject: "Your Expert Support profile has been received",',
    '        message: "Your professional profile, consultation services and availability have been saved. The platform administrator will verify your professional details before the profile becomes publicly bookable.",',
    '        dedupeRevision: { applicationId: application.id, inviteId: invite.id },',
    '      }, client);',
    '      await queueAdminExpertNetworkAlert({',
    '        eventType: "expert_application_received",',
    '        title: "New expert application received",',
    '        message: `${input.firstName} ${input.lastName} (${input.email}) submitted a professional profile for verification.`,',
    '        actionUrl: "/admin/expert-network",',
    '        dedupeRevision: { applicationId: application.id, expertId: expert.id },',
    '      }, client);',
    '      await client.query("COMMIT");',
    '',
  ].join('\n');

  next = next.slice(0, submitCommit) + submitNotificationBlock + next.slice(submitReturn);

  if (!next.includes('queueAdminExpertNetworkAlert')) throw new Error('Admin expert application alerts were not wired');
  if (!next.includes('queueExpertProfileEmail')) throw new Error('Expert application lifecycle emails were not wired');
  return next;
});
