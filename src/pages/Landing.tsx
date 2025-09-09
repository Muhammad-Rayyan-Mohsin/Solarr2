import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import BenefitsSection from '@/components/BenefitsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Landing = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const scrollEls = document.querySelectorAll('.scroll-reveal');
    scrollEls.forEach((el) => observer.observe(el));
    return () => scrollEls.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="min-h-screen">
      <div id="top"></div>
      <Navigation />
      <main>
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
