# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe payments and subscriptions for your application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Stripe Configuration](#stripe-configuration)
5. [Environment Variables](#environment-variables)
6. [Webhook Setup](#webhook-setup)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Overview

The Stripe integration provides:

- **One-off purchases** for credits
- **Recurring subscriptions** with multiple tiers
- **Usage-based credit system** for tracking feature usage
- **Secure webhook handling** for real-time payment updates
- **RLS-protected database** with secure RPC functions

### Architecture

```
Frontend → Next.js API Routes (Cloudflare Workers) → Stripe API
                ↓
          Supabase Database
                ↑
    Stripe Webhooks (via API Routes)
```

## Prerequisites

1. **Stripe Account**: [Sign up for Stripe](https://dashboard.stripe.com/register)
2. **Supabase Project**: Active Supabase project with database access
3. **Cloudflare Account**: For deploying Next.js API routes

## Database Setup

### Step 1: Run Migrations

Execute the SQL migrations in your Supabase SQL Editor in this order:

1. **Profiles Table**
   ```bash
   # File: supabase/migrations/20250120_create_profiles_table.sql
   ```
   This creates the `profiles` table with Stripe customer ID and credits tracking.

2. **Subscriptions & Pricing Tables**
   ```bash
   # File: supabase/migrations/20250120_create_subscriptions_table.sql
   ```
   This creates `subscriptions`, `products`, and `prices` tables.

3. **RPC Functions**
   ```bash
   # File: supabase/migrations/20250120_create_rpc_functions.sql
   ```
   This creates secure functions for credit management.

### Step 2: Verify Tables

After running migrations, verify the tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'subscriptions', 'products', 'prices');
```

## Stripe Configuration

### Step 1: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_...`)
3. Copy your **Publishable key** (starts with `pk_test_...`)

### Step 2: Create Products & Prices

#### Option A: Via Stripe Dashboard

1. Go to **Products** → **Add Product**
2. Create products for:
   - **Credit Packs** (one-time payment)
     - Example: "100 Credits Pack" - $9.99
     - Add metadata: `{ "credits_amount": "100" }`
   - **Subscription Tiers** (recurring)
     - Example: "Pro Plan" - $29/month

3. Copy the **Price ID** for each (starts with `price_...`)

#### Option B: Via Stripe CLI

```bash
# Create a one-time credit pack
stripe products create \
  --name="100 Credits Pack" \
  --description="100 credits for image processing"

stripe prices create \
  --product=prod_XXX \
  --unit-amount=999 \
  --currency=usd \
  --metadata[credits_amount]=100

# Create a subscription
stripe products create \
  --name="Pro Plan" \
  --description="Professional subscription tier"

stripe prices create \
  --product=prod_YYY \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month
```

## Environment Variables

### Local Development

Create a `.env.local` file in the project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Security Notes:**
- ⚠️ **NEVER** commit `.env.local` to version control
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-side only
- ⚠️ Only `VITE_*` and `NEXT_PUBLIC_*` variables are exposed to the client

### Cloudflare Pages Deployment

Set environment variables in Cloudflare Dashboard:

1. Go to **Workers & Pages** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_BASE_URL`

## Webhook Setup

Webhooks ensure your database stays in sync with Stripe events.

### Local Development

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.18.0/stripe_1.18.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.18.0_linux_x86_64.tar.gz
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)
   Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

5. **Test a webhook**
   ```bash
   stripe trigger checkout.session.completed
   ```

### Production

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Set URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add to Cloudflare environment variables

## Testing

### Test Credit Purchase

```typescript
import { StripeService } from '@/lib/stripe';

// Create checkout session for 100 credits
const { url } = await StripeService.createCheckoutSession('price_XXX', {
  metadata: {
    credits_amount: '100',
  },
});

// Redirect user to Stripe Checkout
window.location.href = url;
```

### Test Subscription

```typescript
import { StripeService } from '@/lib/stripe';

// Create subscription checkout
await StripeService.redirectToCheckout('price_YYY');
```

### Verify Database Updates

After successful payment:

```sql
-- Check profile was updated
SELECT * FROM profiles WHERE id = 'user-uuid';

-- Check credits were added
SELECT credits_balance FROM profiles WHERE id = 'user-uuid';

-- Check subscription was created
SELECT * FROM subscriptions WHERE user_id = 'user-uuid';
```

## Production Deployment

### Checklist

- [ ] Run all database migrations in production Supabase
- [ ] Set all environment variables in Cloudflare Dashboard
- [ ] Create products and prices in **Live Mode** Stripe Dashboard
- [ ] Configure production webhook endpoint
- [ ] Test with real payment in Test Mode first
- [ ] Switch to Live Mode keys
- [ ] Monitor webhook deliveries in Stripe Dashboard

### Monitoring

1. **Stripe Dashboard**: Monitor payments and subscriptions
2. **Webhook Logs**: Check webhook delivery status
3. **Supabase Logs**: Monitor database operations and RPC calls
4. **Cloudflare Logs**: Check API route performance

## Usage Examples

### Frontend: Buy Credits Button

```tsx
import { StripeService } from '@/lib/stripe';

function BuyCreditsButton() {
  const handleBuyCredits = async () => {
    try {
      await StripeService.redirectToCheckout('price_XXX', {
        metadata: {
          credits_amount: '100',
        },
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/canceled`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return <button onClick={handleBuyCredits}>Buy 100 Credits - $9.99</button>;
}
```

### Frontend: Display User Credits

```tsx
import { StripeService } from '@/lib/stripe';
import { useEffect, useState } from 'react';

function CreditsDisplay() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    StripeService.getUserProfile().then(setProfile);
  }, []);

  return <div>Credits: {profile?.credits_balance || 0}</div>;
}
```

### Frontend: Use Credits for Feature

```tsx
import { StripeService } from '@/lib/stripe';

async function processImage() {
  const hasCredits = await StripeService.hasSufficientCredits(1);

  if (!hasCredits) {
    alert('Insufficient credits. Please purchase more.');
    return;
  }

  try {
    // Perform the action
    await performImageProcessing();

    // Deduct credits
    const newBalance = await StripeService.decrementCredits(1);
    console.log(`New balance: ${newBalance} credits`);
  } catch (error) {
    console.error('Processing error:', error);
  }
}
```

## Troubleshooting

### Webhook signature verification failed

- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that you're using the correct secret for your environment (test vs live)
- Verify the webhook endpoint URL matches your configuration

### Credits not updating after payment

- Check Stripe webhook logs for delivery status
- Verify the `credits_amount` metadata is set in the checkout session
- Check Supabase logs for RPC function errors

### User profile not found

- Ensure the database trigger creates profiles on user signup
- Manually create profile: `INSERT INTO profiles (id) VALUES ('user-uuid')`

## Security Best Practices

1. **Never expose secret keys** - Only use in server-side code
2. **Verify webhook signatures** - Always validate Stripe signatures
3. **Use RLS policies** - Prevent direct database modifications
4. **Use RPC functions** - Secure credit operations with SECURITY DEFINER
5. **Validate user input** - Always validate price IDs and amounts
6. **Monitor webhook deliveries** - Set up alerts for failed webhooks

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: [Report issues here]

## License

See main project LICENSE file.
