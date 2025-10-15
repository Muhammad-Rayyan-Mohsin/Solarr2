import { CheckCircle2, BarChart3, FileText } from "lucide-react";

const steps = [
  {
    icon: CheckCircle2,
    emoji: "❓",
    title: "Professional Assessment",
    description:
      "Answer simple questions about your property, energy usage, and preferences.",
  },
  {
    icon: BarChart3,
    emoji: "🧠",
    title: "Smart Analysis",
    description:
      "Our algorithm analyzes your data using solar irradiance maps and local incentives.",
  },
  {
    icon: FileText,
    emoji: "📊",
    title: "Your Results",
    description:
      "Receive a personalized report with savings estimates and next steps.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-headline mb-3 sm:mb-4 text-foreground font-bold tracking-tight">How It Works</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Get your solar readiness assessment in three simple steps
          </p>
        </div>

        <div className="relative">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center scroll-reveal"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 bg-solar-gradient rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl" style={{ color: "black" }}>
                      {step.emoji}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Scroll Layout */}
          <div className="md:hidden">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide mobile-scroll">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-center scroll-reveal flex-shrink-0 w-64"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Step Number */}
                  <div className="relative mb-4">
                    <div className="mx-auto w-14 h-14 bg-solar-gradient rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl" style={{ color: "black" }}>
                        {step.emoji}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            {/* Scroll indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-muted-foreground/30"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
