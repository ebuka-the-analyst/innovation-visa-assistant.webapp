const fs = require('fs');
const path = require('path');

function update(relative, transform) {
  const target = path.join(process.cwd(), relative);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, 'utf8');
    console.log(`[expert-meetings] prepared ${relative}`);
  }
}

update('server/index.ts', (source) => {
  let next = source;
  if (!next.includes('import { registerExpertMeetingProviderRoutes } from "./expertMeetingProviderRoutes";')) {
    const anchor = 'import { registerAIProviderGatewayRoutes, registerAIProviderAdminRoutes } from "./aiProviderGateway";';
    if (!next.includes(anchor)) throw new Error('Could not locate server route imports for meeting providers');
    next = next.replace(anchor, `${anchor}\nimport { registerExpertMeetingProviderRoutes } from "./expertMeetingProviderRoutes";`);
  }
  if (!next.includes('registerExpertMeetingProviderRoutes(app);')) {
    const anchor = '  registerAdminBusinessPlanRevisionRoutes(app);';
    if (!next.includes(anchor)) throw new Error('Could not locate server route registration for meeting providers');
    next = next.replace(anchor, `${anchor}\n  registerExpertMeetingProviderRoutes(app);`);
  }
  return next;
});

update('server/expertBookingRoutes.ts', (source) => {
  let next = source;
  const oldSelect = '          b.agenda, b.meeting_url AS "meetingUrl", b.meeting_mode AS "meetingMode", b.admin_notes AS "adminNotes",';
  const newSelect = '          b.agenda, b.meeting_url AS "meetingUrl", b.meeting_mode AS "meetingMode", b.admin_notes AS "adminNotes",\n          b.meeting_provider AS "meetingProvider", b.provider_event_id AS "providerEventId",\n          b.provider_event_url AS "providerEventUrl", b.provider_sync_status AS "providerSyncStatus",\n          b.provider_last_error AS "providerLastError",';
  if (next.includes(oldSelect)) next = next.replace(oldSelect, newSelect);
  if (!next.includes('b.meeting_provider AS "meetingProvider"')) {
    throw new Error('Could not expose meeting-provider state in admin bookings');
  }
  return next;
});

update('client/src/pages/expert-booking.tsx', (source) => {
  let next = source;

  const interfaceAnchor = '  meetingMode?: string;\n  adminNotes?: string | null;';
  if (!next.includes('meetingProvider?:')) {
    if (!next.includes(interfaceAnchor)) throw new Error('Could not locate AdminBooking meeting fields');
    next = next.replace(interfaceAnchor, `  meetingMode?: string;\n  meetingProvider?: "custom" | "google_meet" | "microsoft_teams" | null;\n  providerEventId?: string | null;\n  providerEventUrl?: string | null;\n  providerSyncStatus?: string | null;\n  providerLastError?: string | null;\n  adminNotes?: string | null;`);
  }

  if (!next.includes('const meetingProvidersQuery = useQuery')) {
    const anchor = '  const selectedAdminExpert = (expertsQuery.data || []).find((expert) => expert.id === selectedExpertId);';
    if (!next.includes(anchor)) throw new Error('Could not locate Admin Expert provider-query anchor');
    const block = `  const meetingProvidersQuery = useQuery<{\n    googleMeet: { configured: boolean; available: boolean; label: string; reason: string };\n    microsoftTeams: { configured: boolean; available: boolean; label: string; reason: string };\n    customLink: { configured: boolean; available: boolean; label: string; reason: string };\n  }>({\n    queryKey: ["admin-expert-meeting-providers"],\n    queryFn: () => fetchJson("/api/admin/expert-booking/meeting-providers"),\n    staleTime: 120_000,\n    refetchOnWindowFocus: true,\n  });\n\n`;
    next = next.replace(anchor, block + anchor);
  }

  if (!next.includes('const meetingProviderMutation = useMutation')) {
    const anchor = '  const enabledCount = (expertsQuery.data || []).filter((expert) => expert.consultationEnabled).length;';
    if (!next.includes(anchor)) throw new Error('Could not locate booking mutation insertion anchor');
    const block = `  const meetingProviderMutation = useMutation({\n    mutationFn: async ({ bookingId, provider, meetingUrl }: { bookingId: string; provider: "google_meet" | "microsoft_teams" | "custom"; meetingUrl?: string }) => {\n      const response = await apiRequest("POST", \`/api/admin/expert-booking/bookings/\${bookingId}/meeting\`, { provider, meetingUrl });\n      return response.json();\n    },\n    onSuccess: (payload, variables) => {\n      if (payload?.meetingUrl) {\n        setMeetingLinks((current) => ({ ...current, [variables.bookingId]: payload.meetingUrl }));\n      }\n      const label = variables.provider === "google_meet" ? "Google Meet" : variables.provider === "microsoft_teams" ? "Microsoft Teams" : "Custom meeting link";\n      toast({\n        title: payload?.pending ? \`\${label} is being prepared\` : \`\${label} saved\`,\n        description: payload?.pending\n          ? "The calendar event was created. The platform will attach the join link automatically as soon as the provider finishes generating it."\n          : "The customer, professional and administrators are being notified with the latest meeting details.",\n      });\n      queryClient.invalidateQueries({ queryKey: ["admin-expert-bookings"] });\n      queryClient.invalidateQueries({ queryKey: ["/api/expert-booking/bookings"] });\n    },\n    onError: (error: Error) => toast({ title: "Meeting could not be created", description: error.message, variant: "destructive" }),\n  });\n\n`;
    next = next.replace(anchor, block + anchor);
  }

  const bookingsQueryOld = '    staleTime: 10_000,\n  });\n\n  const meetingProvidersQuery';
  if (next.includes(bookingsQueryOld)) {
    next = next.replace(bookingsQueryOld, '    staleTime: 10_000,\n    refetchInterval: 15_000,\n  });\n\n  const meetingProvidersQuery');
  }

  const badgeAnchor = '<Badge variant="secondary">{booking.paymentStatus}</Badge>';
  if (!next.includes('booking.meetingProvider === "google_meet" ? "Google Meet"')) {
    if (!next.includes(badgeAnchor)) throw new Error('Could not locate booking badges for meeting provider status');
    next = next.replace(
      badgeAnchor,
      `${badgeAnchor}{booking.meetingProvider && <Badge variant="outline">{booking.meetingProvider === "google_meet" ? "Google Meet" : booking.meetingProvider === "microsoft_teams" ? "Microsoft Teams" : "Custom link"}</Badge>}{booking.providerSyncStatus === "creating" && <Badge variant="secondary">Generating link</Badge>}{booking.providerSyncStatus === "cancel_failed" && <Badge variant="destructive">Calendar sync needs attention</Badge>}`,
    );
  }

  const oldControls = '<Input value={meetingLinks[booking.id] ?? booking.meetingUrl ?? ""} onChange={(e) => setMeetingLinks({ ...meetingLinks, [booking.id]: e.target.value })} placeholder="Meeting URL" className="min-w-[200px]" />\n                <Button variant="outline" size="sm" onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, changes: { meetingUrl: meetingLinks[booking.id] ?? booking.meetingUrl ?? null } })}>Save link</Button>';
  if (!next.includes('meetingProviderMutation.mutate({ bookingId: booking.id, provider: "google_meet" })')) {
    if (!next.includes(oldControls)) throw new Error('Could not locate meeting URL controls');
    const newControls = `<div className="flex flex-wrap gap-2 items-center">\n                  <Button\n                    type="button"\n                    variant="outline"\n                    size="sm"\n                    disabled={booking.status !== "confirmed" || meetingProviderMutation.isPending || !meetingProvidersQuery.data?.googleMeet?.available}\n                    title={meetingProvidersQuery.data?.googleMeet?.reason || "Checking Google Meet availability"}\n                    onClick={() => meetingProviderMutation.mutate({ bookingId: booking.id, provider: "google_meet" })}\n                  >\n                    <Video className="h-4 w-4 mr-1.5" /> Google Meet\n                  </Button>\n                  <Button\n                    type="button"\n                    variant="outline"\n                    size="sm"\n                    disabled={booking.status !== "confirmed" || meetingProviderMutation.isPending || !meetingProvidersQuery.data?.microsoftTeams?.available}\n                    title={meetingProvidersQuery.data?.microsoftTeams?.reason || "Checking Microsoft Teams availability"}\n                    onClick={() => meetingProviderMutation.mutate({ bookingId: booking.id, provider: "microsoft_teams" })}\n                  >\n                    <Video className="h-4 w-4 mr-1.5" /> Teams\n                  </Button>\n                </div>\n                <div className="flex gap-2 items-center">\n                  <Input value={meetingLinks[booking.id] ?? booking.meetingUrl ?? ""} onChange={(e) => setMeetingLinks({ ...meetingLinks, [booking.id]: e.target.value })} placeholder="Paste custom meeting URL" className="min-w-[220px]" disabled={booking.status !== "confirmed"} />\n                  <Button\n                    variant="outline"\n                    size="sm"\n                    disabled={booking.status !== "confirmed" || meetingProviderMutation.isPending}\n                    onClick={() => meetingProviderMutation.mutate({ bookingId: booking.id, provider: "custom", meetingUrl: meetingLinks[booking.id] ?? booking.meetingUrl ?? "" })}\n                  >Save custom</Button>\n                </div>`;
    next = next.replace(oldControls, newControls);
  }

  const parentClass = 'className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 min-w-[260px]"';
  if (next.includes(parentClass)) next = next.replace(parentClass, 'className="flex flex-wrap justify-end gap-2 min-w-[320px] max-w-[760px]"');

  if (!next.includes('Google Meet') || !next.includes('Microsoft Teams') || !next.includes('Save custom')) {
    throw new Error('Meeting provider controls were not prepared');
  }
  return next;
});

console.log('[expert-meetings] Google Meet, Microsoft Teams and custom meeting controls prepared');
