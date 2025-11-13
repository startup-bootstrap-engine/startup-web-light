import { Video, Twitter, Youtube, Linkedin, Github } from 'lucide-react';

export function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'API', 'Integrations', 'Changelog'],
    Resources: ['Documentation', 'Tutorials', 'Blog', 'Case Studies', 'Help Center'],
    Company: ['About', 'Careers', 'Press Kit', 'Partners', 'Contact'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
  };

  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-black border-t border-white/10 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-950/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-gradient-to-r from-red-950/50 to-purple-950/50 border border-red-500/30 rounded-2xl p-8 mb-16 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to go viral on autopilot?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join 2,000+ creators who generate viral Shorts without editing.
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/50">
            Get your first 5 Shorts free
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">ShortsAI</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              AI-powered YouTube Shorts automation. Turn long videos into viral clips instantly.
            </p>
            <div className="flex items-center gap-4">
              {socials.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 ShortsAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>Built with AI</span>
            <span>•</span>
            <span>Powered by OpenAI, Suno & Pika</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
