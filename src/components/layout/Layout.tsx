import React, { JSX } from 'react';
import { LoadingBackdrop } from '../common/LoadingBackdrop';
import { NavBar } from '../navigation/NavBar';

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <LoadingBackdrop />

      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-reddit-orange/5 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-reddit-orange/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-300" />
      </div>

      <NavBar />

      <main className="relative z-10 min-h-screen pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};
