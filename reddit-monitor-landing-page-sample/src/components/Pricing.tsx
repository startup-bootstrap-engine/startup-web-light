import { Check, Crown, Rocket, Zap } from 'lucide-react';

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: '29',
      period: 'month',
      description: 'Perfect for solo creators testing the waters',
      features: [
        '50 Shorts per month',
        'AI clip detection',
        'Auto captions & emojis',
        'Basic templates',
        'YouTube integration',
        '720p export quality',
      ],
      cta: 'Start free trial',
      highlighted: false,
      badge: null,
    },
    {
      name: 'Creator Pro',
      icon: Crown,
      price: '79',
      period: 'month',
      description: 'For serious creators scaling their channel',
      features: [
        '200 Shorts per month',
        'Advanced AI editing',
        'Custom brand templates',
        'Auto-publish scheduling',
        'Multi-platform support',
        '1080p export quality',
        'Voice cloning (ElevenLabs)',
        'Background music (Suno)',
        'Priority rendering',
      ],
      cta: 'Get started',
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      name: 'Agency Studio',
      icon: Rocket,
      price: '199',
      period: 'month',
      description: 'Built for agencies managing multiple clients',
      features: [
        'Unlimited Shorts',
        'White-label exports',
        'Team collaboration',
        'API access',
        'Dedicated account manager',
        '4K export quality',
        'Custom AI training',
        'Advanced analytics',
        'Instant rendering',
        'Priority support',
      ],
      cta: 'Contact sales',
      highlighted: false,
      badge: 'Enterprise',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-red-400 font-semibold mb-2 tracking-wide uppercase text-sm">Simple pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose your content
            <span className="block mt-2 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              creation superpower
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            No editing needed. Ever again. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-gradient-to-br from-gray-900 to-black border rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-red-500 scale-105 shadow-2xl shadow-red-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-red-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${plan.highlighted ? 'bg-red-500' : 'bg-gray-800'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {plan.highlighted && (
                    <div className="text-xs text-red-400 font-semibold">SAVE 30%</div>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6 h-10">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 mb-8 ${
                    plan.highlighted
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-red-400' : 'text-gray-400'}`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-3xl pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ No hidden fees</span>
            <span>✓ Money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
