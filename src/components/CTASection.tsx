import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  const handleStartSurvey = () => {
    navigate("/survey");
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-solar-gradient relative overflow-hidden">
      {/* Background Elements - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
      <div className="hidden sm:block absolute top-10 right-10 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full animate-float" />
      <div
        className="hidden sm:block absolute bottom-10 left-10 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-headline text-white mb-4 sm:mb-6 leading-tight font-bold tracking-tight">
            Ready to Discover Your Solar Potential?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed font-medium">
            Join thousands of homeowners who have already discovered their solar
            savings potential. Get your personalized assessment in 45-60 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
            <Button
              onClick={handleStartSurvey}
              className="bg-white text-primary hover:bg-white/90 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto"
            >
              Start Survey Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Professional assessment</span>
            </div>
            <span className="hidden sm:inline text-sm">•</span>
            <span className="text-xs sm:text-sm">No signup required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
