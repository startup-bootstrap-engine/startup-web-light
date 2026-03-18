import Stripe from 'stripe';

// Validate required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Stripe operations will fail.');
}

// Initialize Stripe client
// This will be used in API routes (server-side only)
// Use a dummy key in development if not set to prevent build failures
export const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Stripe webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Validate webhook secret in production
if (process.env.NODE_ENV === 'production' && !STRIPE_WEBHOOK_SECRET) {
  console.warn(
    'Warning: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will fail.'
  );
}
