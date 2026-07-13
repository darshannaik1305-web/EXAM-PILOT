import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import AiShowcaseSection from "../components/landing/AiShowcaseSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FaqSection from "../components/landing/FaqSection";

function Home() {
  return (
    <div className="bg-background min-h-screen text-text">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AiShowcaseSection />
      <TestimonialsSection />
      <FaqSection />
    </div>
  );
}

export default Home;