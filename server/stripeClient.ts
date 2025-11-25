// Stripe Client - Uses Replit Stripe Integration with fallback to env vars
// Reference: connector:ccfg_stripe_01K611P4YQR0SZM11XFRQJC44Y

import Stripe from 'stripe';

let connectionSettings: any;
let cachedCredentials: { publishableKey: string; secretKey: string } | null = null;

async function getCredentials() {
  // Return cached credentials if available
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // First, try to use direct environment variables (most reliable for deployments)
  if (process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY) {
    cachedCredentials = {
      publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    };
    console.log('[Stripe] Using environment variable credentials');
    return cachedCredentials;
  }

  // Fallback to Replit connector system
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    // Final fallback - check for STRIPE_SECRET_KEY alone
    if (process.env.STRIPE_SECRET_KEY) {
      cachedCredentials = {
        publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY,
      };
      console.log('[Stripe] Using STRIPE_SECRET_KEY fallback');
      return cachedCredentials;
    }
    throw new Error('Stripe credentials not found. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  try {
    const url = new URL(`https://${hostname}/api/v2/connection`);
    url.searchParams.set('include_secrets', 'true');
    url.searchParams.set('connector_names', connectorName);
    url.searchParams.set('environment', targetEnvironment);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });

    const data = await response.json();
    
    connectionSettings = data.items?.[0];

    if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
      throw new Error(`Stripe ${targetEnvironment} connection not found`);
    }

    cachedCredentials = {
      publishableKey: connectionSettings.settings.publishable,
      secretKey: connectionSettings.settings.secret,
    };
    console.log('[Stripe] Using Replit connector credentials');
    return cachedCredentials;
  } catch (error) {
    // If connector fails, try environment variables as final fallback
    if (process.env.STRIPE_SECRET_KEY) {
      cachedCredentials = {
        publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY,
      };
      console.log('[Stripe] Connector failed, using env var fallback');
      return cachedCredentials;
    }
    throw error;
  }
}

// Get a fresh Stripe client - always call this function for server-side operations
export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Get publishable key for client-side operations
export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// Get secret key for server-side operations
export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
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
