import { Hero } from './components/Hero';
import { ExplainerStrip } from './components/ExplainerStrip';
import { SocialProof } from './components/SocialProof';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { StickyNav } from './components/StickyNav';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <StickyNav />
      <Hero />
      <ExplainerStrip />
      <SocialProof />
      <Pricing />
      <Footer />
    </div>
  );
}

export default App;
