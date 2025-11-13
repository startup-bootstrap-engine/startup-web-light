import { Play, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Hero() {
  const [videoTransform, setVideoTransform] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoTransform((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center gap-8 opacity-10"
          style={{ transform: `translateY(${Math.sin(videoTransform / 10) * 20}px)` }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="w-48 h-64 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl opacity-50" />
              <div className="w-48 h-64 bg-gradient-to-br from-blue-500 to-red-600 rounded-xl opacity-50" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        <div className="inline-flex items-center gap-2 bg-red-950/50 border border-red-500/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Trusted by 2,000+ creators</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
          Turn your long videos into
          <span className="block mt-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            viral Shorts — automatically
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
          AI-powered clips, captions, and publishing. No editing needed. Ever again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-300">
          <button className="group bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/50 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Get your first 5 Shorts free
          </button>
          <button className="group border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            See how it works
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center animate-fade-in-up animation-delay-400">
          <div>
            <div className="text-3xl font-bold text-red-400 mb-1">10M+</div>
            <div className="text-sm text-gray-400">Shorts Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400 mb-1">98%</div>
            <div className="text-sm text-gray-400">Time Saved</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400 mb-1">5x</div>
            <div className="text-sm text-gray-400">Growth Rate</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
