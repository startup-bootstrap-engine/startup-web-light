import { Youtube, Zap, Brain, Sparkles } from 'lucide-react';

export function SocialProof() {
  const logos = [
    { icon: Youtube, name: 'YouTube', color: 'text-red-500' },
    { icon: Zap, name: 'TikTok', color: 'text-cyan-400' },
    { icon: Brain, name: 'OpenAI', color: 'text-green-400' },
    { icon: Sparkles, name: 'Pika', color: 'text-purple-400' },
  ];

  const testimonials = [
    {
      quote: "ShortsAI turned my 2-hour podcast into 50 viral clips. My channel grew by 10K subs in a month.",
      author: "Sarah Chen",
      role: "Tech Podcaster",
      growth: "+347% engagement",
    },
    {
      quote: "I used to spend 8 hours editing Shorts. Now it takes 8 minutes. This is a game changer.",
      author: "Marcus Rodriguez",
      role: "Fitness Creator",
      growth: "+5.2M views",
    },
    {
      quote: "The AI knows exactly which moments will go viral. It's like having a team of editors on autopilot.",
      author: "Emma Thompson",
      role: "Business Coach",
      growth: "+12K subscribers",
    },
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-red-400 font-semibold mb-2 tracking-wide uppercase text-sm">Trusted by thousands</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Powering the world's best creators
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join 2,000+ creators using AI to scale their content
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12 mb-24 opacity-60">
          {logos.map((logo, index) => {
            const Icon = logo.icon;
            return (
              <div key={index} className="flex items-center gap-3 group cursor-pointer">
                <Icon className={`w-8 h-8 ${logo.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xl font-semibold text-gray-400 group-hover:text-white transition-colors">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">{testimonial.growth}</div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-purple-500/0 group-hover:from-red-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300" />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-950/50 to-purple-950/50 border border-red-500/30 rounded-full px-8 py-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-500 border-2 border-black"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="font-semibold">Join 2,000+ creators</div>
              <div className="text-sm text-gray-400">Already generating viral Shorts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
