const fs = require('fs');
const path = require('path');

const file = path.resolve(process.cwd(), 'migrations/app/20260819_expert_booking_platform.sql');
if (!fs.existsSync(file)) {
  console.error('[EXPERT BOOKING] Migration file missing');
  process.exit(1);
}
const sql = fs.readFileSync(file, 'utf8');
const required = [
  'expert_consultation_profiles',
  'expert_consultation_services',
  'expert_availability_rules',
  'expert_availability_blocks',
  'expert_consultation_bookings',
  'ux_expert_booking_user_idempotency',
];
const missing = required.filter((name) => !sql.includes(name));
if (missing.length) {
  console.error('[EXPERT BOOKING] Migration is missing required objects:', missing.join(', '));
  process.exit(1);
}
console.log('[EXPERT BOOKING] Migration structure looks complete');
