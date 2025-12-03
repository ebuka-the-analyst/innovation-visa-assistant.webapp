// Stripe Client - ENFORCES LIVE MODE ONLY
import Stripe from 'stripe';

// CRITICAL: Always enforce LIVE mode for production payments
const ENFORCE_LIVE_MODE = true;

function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  if (!publishableKey) {
    throw new Error('VITE_STRIPE_PUBLIC_KEY environment variable is required');
  }

  // CRITICAL: Validate keys are LIVE mode
  const isLiveSecretKey = secretKey.startsWith('sk_live_');
  const isLivePublishableKey = publishableKey.startsWith('pk_live_');
  
  if (ENFORCE_LIVE_MODE) {
    if (!isLiveSecretKey) {
      console.error('[Stripe] CRITICAL ERROR: Test secret key detected! Production requires LIVE keys.');
      console.error('[Stripe] Your STRIPE_SECRET_KEY starts with "sk_test_" but must start with "sk_live_"');
      console.error('[Stripe] Please update your STRIPE_SECRET_KEY in Secrets to use your Stripe Live secret key.');
      throw new Error('STRIPE_SECRET_KEY must be a LIVE key (sk_live_...) for production. Test keys are not allowed.');
    }
    
    if (!isLivePublishableKey) {
      console.error('[Stripe] CRITICAL ERROR: Test publishable key detected! Production requires LIVE keys.');
      console.error('[Stripe] Your VITE_STRIPE_PUBLIC_KEY starts with "pk_test_" but must start with "pk_live_"');
      console.error('[Stripe] Please update your VITE_STRIPE_PUBLIC_KEY in Secrets to use your Stripe Live publishable key.');
      throw new Error('VITE_STRIPE_PUBLIC_KEY must be a LIVE key (pk_live_...) for production. Test keys are not allowed.');
    }
  }

  console.log(`[Stripe] Using LIVE mode credentials - payments are real`);

  return {
    publishableKey,
    secretKey,
  };
}

// Get a fresh Stripe client - always call this function for server-side operations
export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Get publishable key for client-side operations
export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

// Get secret key for server-side operations
export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
