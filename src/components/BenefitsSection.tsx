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
    title: "Quick Process",
    description:
      "Streamlined questions designed to take just a few minutes to complete.",
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
    emoji: "📄",
    title: "Clear Structure",
    description:
      "Organized sections including General & Contact and Electricity Baseline.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4 text-foreground">
            Solar Readiness Survey Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, structured approach to capture your baseline information
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="card-hover border-0 bg-card/80 backdrop-blur-sm scroll-reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-3" style={{ color: "black" }}>
                  {benefit.emoji}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
