import { ArrowRight, Clock, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/solar-hero.jpg';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ShimmerButton } from '@/components/ui/shimmer-button';

const HeroSection = () => {
  const navigate = useNavigate();
  const handleStartSurvey = () => navigate('/survey');

  return (
    <AuroraBackground className="pt-0">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <h1 className="text-display mb-6 text-foreground">
              Start Your Solar Readiness Survey
            </h1>
            <p className="text-subhead text-muted-foreground mb-8 max-w-lg">
              Answer a few structured questions so we can understand your baseline and next steps. Takes just a few minutes.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 backdrop-blur-sm border border-border/20">
                <Shield className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">No signup required</span>
              </div>
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 backdrop-blur-sm border border-border/20">
                <Clock className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Takes ~3–5 minutes</span>
              </div>
              <div className="flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 backdrop-blur-sm border border-border/20">
                <CheckCircle className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Privacy-first</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-20 sm:mb-0">
              <ShimmerButton onClick={handleStartSurvey} className="px-8 py-4 rounded-full text-lg font-semibold group" background="hsl(var(--primary))" shimmerColor="rgba(255,255,255,0.8)">
                <span className="flex items-center text-primary-foreground">
                  Start Survey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </ShimmerButton>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-mid)] animate-float">
              <img src={heroImage} alt="Modern home with clean design and natural lighting" className="w-full h-auto object-cover" loading="eager" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-border/20 to-border/10 rounded-full animate-float" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-muted/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default HeroSection;
