// Stripe Client - Uses environment variables for live mode
import Stripe from 'stripe';

function getCredentials() {
  // Use environment variables directly for live mode (no caching issues)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  if (!publishableKey) {
    throw new Error('VITE_STRIPE_PUBLIC_KEY environment variable is required');
  }

  // Log key type for debugging (without exposing the key)
  const keyType = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`[Stripe] Using ${keyType} mode credentials from environment variables`);

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
