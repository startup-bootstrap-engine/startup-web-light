'use client';

import { PricingCard } from '@/components/stripe';

export default function PricingPage() {
  // TODO: Replace these with your actual Stripe Price IDs from your dashboard
  // Create products in Stripe Dashboard and copy the price IDs here

  return (
    <main className="flex-1">
      <div className="container mx-auto py-16 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Purchase credits for one-time use
            or subscribe for ongoing access.
          </p>
        </div>

        {/* Credits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Credit Packs</h2>
          <p className="text-center text-base-content/70 mb-8">
            Buy credits once, use them anytime. Perfect for occasional users.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter Pack"
              description="Perfect for trying out"
              price={9.99}
              features={[
                '100 processing credits',
                'Valid for 12 months',
                'Email support',
                'Basic features',
              ]}
              priceId="price_starter_credits"
              creditsAmount={100}
            />

            <PricingCard
              name="Pro Pack"
              description="Best value for regular users"
              price={29.99}
              features={[
                '500 processing credits',
                'Valid for 12 months',
                'Priority email support',
                'All features included',
                '40% more credits',
              ]}
              priceId="price_pro_credits"
              creditsAmount={500}
              recommended
            />

            <PricingCard
              name="Enterprise Pack"
              description="For power users"
              price={99.99}
              features={[
                '2000 processing credits',
                'Valid for 12 months',
                '24/7 priority support',
                'All features included',
                'Best value per credit',
              ]}
              priceId="price_enterprise_credits"
              creditsAmount={2000}
            />
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Monthly Subscriptions
          </h2>
          <p className="text-center text-base-content/70 mb-8">
            Get credits every month with our subscription plans. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Hobby"
              description="For personal projects"
              price={19}
              interval="month"
              features={[
                '200 credits per month',
                'Rollover unused credits',
                'Email support',
                'All features included',
              ]}
              priceId="price_hobby_monthly"
            />

            <PricingCard
              name="Professional"
              description="For professionals"
              price={49}
              interval="month"
              features={[
                '1000 credits per month',
                'Rollover unused credits',
                'Priority support',
                'All features included',
                'Early access to new features',
              ]}
              priceId="price_pro_monthly"
              recommended
            />

            <PricingCard
              name="Business"
              description="For teams and agencies"
              price={149}
              interval="month"
              features={[
                '5000 credits per month',
                'Rollover unused credits',
                '24/7 priority support',
                'All features included',
                'Dedicated account manager',
                'Custom integrations',
              ]}
              priceId="price_business_monthly"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" defaultChecked />
              <div className="collapse-title text-lg font-medium">
                What are credits used for?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  Credits are used for processing actions in the application. Each
                  action (like image processing, data analysis, etc.) consumes a
                  certain number of credits based on complexity.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                Do credits expire?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  One-time credit packs are valid for 12 months from purchase.
                  Subscription credits roll over month-to-month as long as your
                  subscription is active.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                Can I cancel my subscription anytime?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  Yes! You can cancel your subscription at any time. You'll
                  continue to have access until the end of your billing period,
                  and any remaining credits will stay in your account.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                What payment methods do you accept?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  We accept all major credit cards (Visa, Mastercard, American
                  Express) and various other payment methods through Stripe.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                Can I upgrade or downgrade my plan?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  Yes! You can change your subscription plan at any time. Changes
                  take effect at the start of the next billing cycle, and we'll
                  prorate any differences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/30 max-w-2xl mx-auto">
            <div className="card-body">
              <h3 className="text-2xl font-bold mb-4">
                Need a custom plan?
              </h3>
              <p className="text-base-content/70 mb-6">
                Contact us for enterprise pricing, bulk discounts, or custom
                integration requirements.
              </p>
              <div className="card-actions justify-center">
                <a href="mailto:sales@pixelperfect.com" className="btn btn-primary">
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
