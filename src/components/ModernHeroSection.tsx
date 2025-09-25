import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-solar-home.jpg";
import { cn } from "@/lib/utils";

interface ModernHeroSectionProps {
  overallProgress?: number;
  completedSections?: number;
  totalSections?: number;
  showProgress?: boolean;
  showStartButton?: boolean;
}

const ModernHeroSection = ({ 
  overallProgress = 0, 
  completedSections = 0, 
  totalSections = 9,
  showProgress = false,
  showStartButton = true
}: ModernHeroSectionProps) => {
  const navigate = useNavigate();

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Modern home with clean design and natural lighting"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Transparent overlay with gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl">
          {/* Main Heading */}
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Professional Survey
          </h1>
          
          {/* Subtitle */}
          <p className="font-body text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Empower your clean energy journey in minutes
          </p>

          {/* Compact Status Badges - Desktop Only */}
          {showProgress && (
            <div className="hidden md:flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="font-body text-sm text-white">{completedSections} Completed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Clock className="h-4 w-4 text-white/70" />
                <span className="font-body text-sm text-white">{totalSections - completedSections} Remaining</span>
              </div>
            </div>
          )}

          {/* Slim Progress Bar - Desktop Only */}
          {showProgress && overallProgress > 0 && (
            <div className="hidden md:block mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm text-white/80">Progress</span>
                <span className="font-body text-sm font-medium text-white">{Math.round(overallProgress)}% Complete</span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Single Primary Action */}
          {showStartButton && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStartSurvey}
                size="lg"
                className="font-highlight font-semibold text-lg px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {showProgress && overallProgress > 0 ? "Resume Survey" : "Start Survey"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Subtle floating elements for visual interest */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
      <div className="absolute bottom-32 right-32 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-16 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
    </section>
  );
};

export default ModernHeroSection;
