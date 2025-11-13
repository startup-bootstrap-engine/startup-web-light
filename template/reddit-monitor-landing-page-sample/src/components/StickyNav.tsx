import { Video } from 'lucide-react';
import { useState, useEffect } from 'react';

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold">ShortsAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="hover:text-red-400 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-red-400 transition-colors">Pricing</a>
            <a href="#analytics" className="hover:text-red-400 transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm hover:text-red-400 transition-colors">
              Sign in
            </button>
            <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105">
              Try for free
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
