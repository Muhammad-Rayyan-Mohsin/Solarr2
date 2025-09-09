import { ArrowRight, Clock, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/solar-hero.jpg';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  const navigate = useNavigate();
  const handleStartSurvey = () => navigate('/survey');

  return (
    <AuroraBackground className="pt-0 sm:pt-0">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-12 sm:items-center">
          {/* Text content - mobile first */}
          <div className="order-1 sm:order-none animate-fade-in-up space-y-4 sm:space-y-6">
            <h1 className="text-3xl font-bold sm:text-display text-foreground">
              Start Your Solar Readiness Survey
            </h1>
            <p className="text-base sm:text-subhead text-muted-foreground">
              Answer a few structured questions so we can understand your baseline and next steps. Takes just a few minutes.
            </p>
            
            {/* Benefits badges - mobile wrapping */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ShimmerButton 
                onClick={handleStartSurvey} 
                className="h-12 px-8 rounded-full text-lg font-semibold group" 
                background="hsl(var(--primary))" 
                shimmerColor="rgba(255,255,255,0.8)"
              >
                <span className="flex items-center text-primary-foreground">
                  Start Survey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </ShimmerButton>
              
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                  <Shield className="h-3 w-3" />
                  <span>No signup</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                  <Clock className="h-3 w-3" />
                  <span>~3–5 mins</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                  <CheckCircle className="h-3 w-3" />
                  <span>Privacy‑first</span>
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Image - mobile first, order 0 (appears first on mobile) */}
          <div className="order-0 sm:order-none relative">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg animate-float">
              <img 
                src={heroImage} 
                alt="Modern home with solar panels" 
                className="w-full aspect-[16/9] sm:aspect-[4/3] object-cover" 
                loading="eager" 
                decoding="async"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            {/* Decorative elements - hidden on mobile */}
            <div className="hidden sm:block absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-border/20 to-border/10 rounded-full animate-float" />
            <div className="hidden sm:block absolute -bottom-6 -left-6 w-16 h-16 bg-muted/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default HeroSection;
