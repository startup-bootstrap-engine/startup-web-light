import { Upload, Sparkles, Rocket } from 'lucide-react';

export function ExplainerStrip() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload or connect',
      description: 'Link your YouTube channel or upload video files directly',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'AI clips & captions',
      description: 'Our AI instantly finds viral moments and adds engaging captions',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Rocket,
      title: 'Publish & track',
      description: 'Auto-publish to platforms and watch your analytics grow',
      gradient: 'from-red-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            From long-form to viral in
            <span className="block mt-2 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              three simple steps
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            No editing skills required. Our AI handles everything from clipping to captioning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                <div className="absolute -top-4 -right-4 text-6xl font-bold text-white/5">
                  {index + 1}
                </div>

                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: `${index * 0.3}s` }} />
              {index < steps.length - 1 && (
                <div className="w-16 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
