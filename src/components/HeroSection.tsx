import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-solar-home.jpg";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  return (
    <AuroraBackground className="pt-0">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="animate-fade-in-up order-2 lg:order-1 text-center lg:text-left component-spacing pt-4 lg:pt-8">
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-6 font-bold text-gray-900">
              Start Your Solar Readiness Survey
            </h1>

            <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0 text-gray-600">
              Comprehensive solar assessment conducted by our professional team.
              Takes 45-60 minutes for accurate results.
            </p>

            {/* Trust Badges - Centered on mobile, left-aligned on desktop */}
            <div className="content-group mb-8 justify-center lg:justify-start">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center justify-center space-x-2 bg-white rounded-full px-4 py-2 border border-black shadow-sm">
                  <Shield className="h-3 w-3 text-black flex-shrink-0" />
                  <span className="font-medium text-xs text-black">No signup</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white rounded-full px-4 py-2 border border-black shadow-sm">
                  <Clock className="h-3 w-3 text-black flex-shrink-0" />
                  <span className="font-medium text-xs text-black">45-60 mins</span>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white rounded-full px-4 py-2 border border-black shadow-sm">
                  <CheckCircle className="h-3 w-3 text-black flex-shrink-0" />
                  <span className="font-medium text-xs text-black">Privacy-first</span>
                </div>
              </div>
            </div>

            {/* CTA Button - Centered on mobile, left-aligned on desktop */}
            <div className="flex justify-center lg:justify-start cta-spacing-lg">
              <ShimmerButton
                onClick={handleStartSurvey}
                className="px-6 py-3 rounded-full group shadow-lg hover:shadow-xl transition-all duration-300"
                background="linear-gradient(135deg, #000000 0%, #333333 100%)"
                shimmerColor="rgba(255,255,255,0.3)"
              >
                <span className="flex items-center justify-center text-white font-semibold text-base">
                  Start Survey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </ShimmerButton>
            </div>
          </div>

          {/* Hero Image - Centered and aligned with text */}
           <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
             <div className="relative max-w-lg lg:max-w-xl xl:max-w-2xl">
              <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl animate-float">
                <img
                  src={heroImage}
                  alt="Modern home with clean design and natural lighting"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating Elements - Subtle and modern */}
              <div className="hidden lg:block absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-float blur-sm" />
              <div
                className="hidden lg:block absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full animate-float blur-sm"
                style={{ animationDelay: "1.5s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default HeroSection;
