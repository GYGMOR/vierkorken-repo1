import Stripe from 'stripe';

// Skip validation during build time
if (!process.env.STRIPE_SECRET_KEY && !process.env.SKIP_ENV_VALIDATION) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
