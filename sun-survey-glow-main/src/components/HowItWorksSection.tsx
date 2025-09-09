import { CheckCircle2, BarChart3, FileText } from 'lucide-react';

const steps = [
  {
    icon: CheckCircle2,
    emoji: '📝',
    title: 'Quick Questions',
    description: 'Answer simple questions about your property, energy usage, and preferences.'
  },
  {
    icon: BarChart3,
    emoji: '🔍',
    title: 'Smart Analysis',
    description: 'Our algorithm analyzes your data using solar irradiance maps and local incentives.'
  },
  {
    icon: FileText,
    emoji: '📊',
    title: 'Your Results',
    description: 'Receive a personalized report with savings estimates and next steps.'
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your solar readiness assessment in three simple steps
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="text-center scroll-reveal"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 bg-solar-gradient rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl" style={{ color: 'black' }}>
                      {step.emoji}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;