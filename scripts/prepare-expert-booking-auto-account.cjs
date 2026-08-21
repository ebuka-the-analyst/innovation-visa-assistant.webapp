const fs = require("fs");
const path = require("path");

const root = process.cwd();

function update(relativePath, transform) {
  const target = path.join(root, relativePath);
  const before = fs.readFileSync(target, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, "utf8");
    console.log(`[expert-booking-auto-account] prepared ${relativePath}`);
  }
}

update("client/src/App.tsx", (source) => {
  let next = source;

  if (!next.includes('const { data: shellUser } = useQuery<{ id: string }>')) {
    const anchor = `function AppLayout() {\n  const [location] = useLocation();`;
    if (!next.includes(anchor)) throw new Error("Could not locate AppLayout auth anchor");
    next = next.replace(anchor, `${anchor}\n  const { data: shellUser } = useQuery<{ id: string }>({\n    queryKey: [\"/api/auth/user\"],\n    retry: false,\n  });`);
  }

  next = next.replace("<AppSidebar publicMode />", "<AppSidebar publicMode={!shellUser} />");
  return next;
});

update("client/src/components/app-sidebar.tsx", (source) => {
  let next = source;

  next = next.replace('email: "No account required",', 'email: "",');
  next = next.replace('displayName: "Guest visitor",', 'displayName: "",');

  if (!next.includes("{!publicMode && <SidebarFooter>")) {
    const open = "      <SidebarFooter>";
    const close = "      </SidebarFooter>";
    if (!next.includes(open) || !next.includes(close)) throw new Error("Could not locate sidebar footer");
    next = next.replace(open, "      {!publicMode && <SidebarFooter>");
    next = next.replace(close, "      </SidebarFooter>}");
  }

  return next;
});

update("client/src/components/expert-booking/PublicExpertBooking.tsx", (source) => {
  let next = source;

  next = next.replace(
    "Compare professionals, choose the consultation you need, pick a live time and pay securely. No subscription and no account required.",
    "Compare professionals, choose the consultation you need, pick a live time and pay securely.",
  );
  next = next.replace(
    "No account required. Confirmation, payment and meeting updates will be sent to this email.",
    "We'll create your account automatically when your booking is confirmed. Confirmation and meeting updates will be sent to this email.",
  );
  next = next.replace(
    'toast({ title: "Payment verified", description: "Your consultation is confirmed and the details have been emailed to you." });',
    'toast({ title: "Payment verified", description: "Your consultation is confirmed. Your account is ready and you are now signed in." });',
  );

  const paymentSuccessAnchor = `      queryClient.invalidateQueries({ queryKey: [\"/api/expert-booking/bookings\"] });`;
  if (!next.includes('queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });')) {
    const firstSuccess = next.indexOf(paymentSuccessAnchor);
    if (firstSuccess === -1) throw new Error("Could not locate Expert Booking success cache invalidation");
    next = `${next.slice(0, firstSuccess)}      queryClient.invalidateQueries({ queryKey: [\"/api/auth/user\"] });\n${next.slice(firstSuccess)}`;

    const secondSuccess = next.indexOf(paymentSuccessAnchor, firstSuccess + paymentSuccessAnchor.length + 1);
    if (secondSuccess !== -1) {
      next = `${next.slice(0, secondSuccess)}      queryClient.invalidateQueries({ queryKey: [\"/api/auth/user\"] });\n${next.slice(secondSuccess)}`;
    }
  }

  return next;
});

update("server/publicExpertBookingRoutes.ts", (source) => {
  let next = source;

  if (!next.includes('from "./expertBookingAccountProvisioning"')) {
    const anchor = 'import { queueExpertBookingEvent } from "./expertNotificationService";';
    if (!next.includes(anchor)) throw new Error("Could not locate public booking import anchor");
    next = next.replace(anchor, `${anchor}\nimport {\n  activateProvisionedExpertBookingAccount,\n  getOrCreateProvisionedExpertBookingAccount,\n} from \"./expertBookingAccountProvisioning\";`);
  }

  next = next.replace(
    `    booking\n    && !booking.userId\n    && booking.customerEmail`,
    `    booking\n    && booking.customerEmail`,
  );

  if (!next.includes("const accountProvision = await getOrCreateProvisionedExpertBookingAccount")) {
    const anchor = "      const amountPence = Number(configuration.pricePence);";
    if (!next.includes(anchor)) throw new Error("Could not locate guest booking account-provision anchor");
    const provision = `      const accountProvision = await getOrCreateProvisionedExpertBookingAccount(client, {\n        email,\n        firstName: input.customerFirstName,\n        lastName: input.customerLastName,\n      });\n      if (accountProvision.requiresSignIn || !accountProvision.userId) {\n        await client.query(\"ROLLBACK\");\n        return res.status(409).json({\n          error: \"An account already exists with this email. Please sign in to continue with the booking.\",\n          requiresSignIn: true,\n        });\n      }\n      const provisionedUserId = accountProvision.userId;\n\n`;
    next = next.replace(anchor, `${provision}${anchor}`);
  }

  if (!next.includes("SET provisioned_user_id = $2")) {
    const commitAnchor = '      await client.query("COMMIT");\n      const accessToken = createGuestBookingAccessToken(booking.id, email);';
    if (!next.includes(commitAnchor)) throw new Error("Could not locate guest booking commit anchor");
    next = next.replace(commitAnchor, `      await client.query(\`\n        UPDATE expert_consultation_bookings\n        SET provisioned_user_id = $2, updated_at = NOW()\n        WHERE id = $1\n      \`, [booking.id, provisionedUserId]);\n\n${commitAnchor}`);
  }

  if (!next.includes("provisionedUserId,")) {
    const metadataAnchor = `            serviceId: input.serviceId,\n          },`;
    if (!next.includes(metadataAnchor)) throw new Error("Could not locate Stripe metadata anchor");
    next = next.replace(metadataAnchor, `            serviceId: input.serviceId,\n            provisionedUserId,\n          },`);
  }

  const freeAnchor = `      if (isFree) {\n        await queueExpertBookingEvent(\"confirmed\", booking.id);\n        return res.status(201).json({ booking, requiresPayment: false, guestAccessToken: accessToken });\n      }`;
  if (next.includes(freeAnchor)) {
    next = next.replace(freeAnchor, `      if (isFree) {\n        const account = await activateProvisionedExpertBookingAccount(booking.id, req);\n        await queueExpertBookingEvent(\"confirmed\", booking.id);\n        return res.status(201).json({\n          booking,\n          requiresPayment: false,\n          guestAccessToken: accessToken,\n          accountCreated: Boolean(account),\n        });\n      }`);
  }

  const alreadyConfirmed = `      if (booking.status === \"confirmed\" && booking.paymentStatus === \"paid\") {\n        return res.json({ success: true, bookingId: booking.id, alreadyConfirmed: true });\n      }`;
  if (next.includes(alreadyConfirmed)) {
    next = next.replace(alreadyConfirmed, `      if (booking.status === \"confirmed\" && booking.paymentStatus === \"paid\") {\n        const account = await activateProvisionedExpertBookingAccount(booking.id, req);\n        return res.json({\n          success: true,\n          bookingId: booking.id,\n          alreadyConfirmed: true,\n          accountCreated: Boolean(account),\n        });\n      }`);
  }

  next = next.replace(
    "        WHERE id = $1 AND user_id IS NULL\n        RETURNING id",
    "        WHERE id = $1 AND (user_id IS NULL OR user_id = provisioned_user_id)\n        RETURNING id",
  );

  const confirmedAnchor = `      if (!updated) return res.status(404).json({ error: \"Booking not found.\" });\n      await queueExpertBookingEvent(\"confirmed\", booking.id);\n      return res.json({ success: true, bookingId: booking.id });`;
  if (next.includes(confirmedAnchor)) {
    next = next.replace(confirmedAnchor, `      if (!updated) return res.status(404).json({ error: \"Booking not found.\" });\n      const account = await activateProvisionedExpertBookingAccount(booking.id, req);\n      await queueExpertBookingEvent(\"confirmed\", booking.id);\n      return res.json({\n        success: true,\n        bookingId: booking.id,\n        accountCreated: Boolean(account),\n      });`);
  }

  return next;
});

update("server/expertBookingPaymentWebhook.ts", (source) => {
  let next = source;

  if (!next.includes('from "./expertBookingAccountProvisioning"')) {
    const anchor = 'import { sendEmail } from "./email";';
    if (!next.includes(anchor)) throw new Error("Could not locate Expert Booking webhook import anchor");
    next = next.replace(anchor, `${anchor}\nimport { activateProvisionedExpertBookingAccount } from \"./expertBookingAccountProvisioning\";`);
  }

  next = next.replace(
    'const guestSession = userId === "guest" && !booking?.userId;',
    'const guestSession = userId === "guest";',
  );

  if (!next.includes("await activateProvisionedExpertBookingAccount(bookingId);")) {
    const anchor = `  if (shouldNotify) void sendConfirmedBookingEmail(bookingId);`;
    if (!next.includes(anchor)) throw new Error("Could not locate webhook notification anchor");
    next = next.replace(anchor, `  try {\n    await activateProvisionedExpertBookingAccount(bookingId);\n  } catch (error) {\n    console.error(\"[Expert Booking Webhook] Account activation failed\", error);\n  }\n\n${anchor}`);
  }

  return next;
});

console.log("[expert-booking-auto-account] account provisioning, auto-login and guest UX cleanup complete");
