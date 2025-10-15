import { Card, CardContent } from "@/components/ui/card";
import { Target, DollarSign, Shield, Zap } from "lucide-react";

const benefits = [
  {
    icon: Target,
    emoji: "📋",
    title: "Structured Form",
    description:
      "Guided multi-section survey to capture your information systematically.",
  },
  {
    icon: DollarSign,
    emoji: "⚡",
    title: "Professional Assessment",
    description:
      "Comprehensive evaluation conducted by our professional team to ensure accuracy and compliance.",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "No Commitment",
    description:
      "No signup required, no sales calls, and no hidden requirements.",
  },
  {
    icon: Zap,
    emoji: "🎯",
    title: "Clear Structure",
    description:
      "Organized sections including General & Contact and Electricity Baseline.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="section-spacing bg-section-gradient">
      <div className="container mx-auto mobile-spacing">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-headline mb-6 text-foreground font-bold tracking-tight">
            Solar Readiness Survey Features
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Simple, structured approach to capture your baseline information
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="card-hover border-0 bg-card/80 backdrop-blur-sm scroll-reveal h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center h-full flex flex-col component-spacing">
                <div className="text-4xl mb-6" style={{ color: "black" }}>
                  {benefit.emoji}
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed flex-grow font-medium">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        <div className="sm:hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide mobile-scroll">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="card-hover border-0 bg-card/80 backdrop-blur-sm scroll-reveal flex-shrink-0 w-72"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-5 text-center h-full flex flex-col">
                  <div className="text-3xl mb-3" style={{ color: "black" }}>
                    {benefit.emoji}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-grow font-medium">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Scroll indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {benefits.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
