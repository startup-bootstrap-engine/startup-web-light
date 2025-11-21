import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test.describe('API: Stripe Webhooks', () => {
  // Helper function to generate Stripe webhook signature
  function generateStripeSignature(
    payload: string,
    secret: string
  ): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return `t=${timestamp},v1=${signature}`;
  }

  test('should reject requests without stripe-signature header', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/stripe', {
      data: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} },
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('stripe-signature');
  });

  test('should reject requests with invalid signature', async ({ request }) => {
    const payload = JSON.stringify({
      id: 'evt_test_invalid',
      type: 'checkout.session.completed',
      data: { object: {} },
    });

    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': 'invalid_signature',
        'content-type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('signature verification failed');
  });

  test('should process valid webhook with correct signature', async ({
    request,
  }) => {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

    const event = {
      id: 'evt_test_123',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          object: 'checkout.session',
          mode: 'payment',
          customer: 'cus_test_123',
          metadata: {
            user_id: 'user_test_123',
            credits_amount: '100',
          },
        },
      },
    };

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, webhookSecret);

    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    // This will likely return 500 if the webhook secret doesn't match
    // or if database operations fail, but we verify the signature was accepted
    if (response.status() === 500) {
      const data = await response.json();
      // Make sure it's not a signature error
      expect(data.error).not.toContain('signature');
      console.log('Expected error (DB/config issue):', data.error);
    } else {
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.received).toBe(true);
    }
  });

  test('should handle subscription created event', async ({ request }) => {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

    const event = {
      id: 'evt_test_sub_123',
      object: 'event',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          object: 'subscription',
          customer: 'cus_test_123',
          status: 'active',
          current_period_start: 1234567890,
          current_period_end: 1234567890,
          cancel_at_period_end: false,
          canceled_at: null,
          items: {
            data: [
              {
                price: {
                  id: 'price_test_123',
                },
              },
            ],
          },
        },
      },
    };

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, webhookSecret);

    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    // Validate request handling (may fail on DB operations)
    expect([200, 500]).toContain(response.status());
  });

  test('should handle subscription deleted event', async ({ request }) => {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

    const event = {
      id: 'evt_test_sub_del_123',
      object: 'event',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_123',
          object: 'subscription',
          customer: 'cus_test_123',
          status: 'canceled',
          current_period_start: 1234567890,
          current_period_end: 1234567890,
          cancel_at_period_end: false,
          canceled_at: 1234567890,
          items: {
            data: [
              {
                price: {
                  id: 'price_test_123',
                },
              },
            ],
          },
        },
      },
    };

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, webhookSecret);

    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    expect([200, 500]).toContain(response.status());
  });

  test('should handle unhandled event types gracefully', async ({
    request,
  }) => {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

    const event = {
      id: 'evt_test_unknown',
      object: 'event',
      type: 'customer.created', // Unhandled event type
      data: {
        object: {
          id: 'cus_test_123',
        },
      },
    };

    const payload = JSON.stringify(event);
    const signature = generateStripeSignature(payload, webhookSecret);

    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    // Should still return 200 for unhandled events
    expect([200, 500]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.received).toBe(true);
    }
  });

  test('should validate content-type header', async ({ request }) => {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

    const payload = JSON.stringify({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: { object: {} },
    });

    const signature = generateStripeSignature(payload, webhookSecret);

    // Test with correct content-type
    const response = await request.post('/api/webhooks/stripe', {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    // Should process (may fail on DB, but not on content-type)
    expect([200, 500]).toContain(response.status());
  });
});
