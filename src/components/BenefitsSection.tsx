import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  { emoji: '📋', title: 'Structured Form', description: 'Guided multi-section survey to capture your information systematically.' },
  { emoji: '⚡', title: 'Quick Process', description: 'Streamlined questions designed to take just a few minutes to complete.' },
  { emoji: '🛡️', title: 'No Commitment', description: 'No signup required, no sales calls, and no hidden requirements.' },
  { emoji: '📄', title: 'Clear Structure', description: 'Organized sections including General & Contact and Electricity Baseline.' },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-12 sm:py-20 bg-section-gradient">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-headline mb-4 text-foreground">Solar Readiness Survey Features</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">Simple, structured approach to capture your baseline information</p>
        </div>
        
        {/* Mobile: Horizontal scroll carousel */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="min-w-[260px] snap-start flex-shrink-0 border-0 bg-card/80 backdrop-blur-sm scroll-reveal sm:min-w-0 sm:flex-shrink" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 sm:p-6 text-center h-full">
                  <div className="text-3xl sm:text-4xl mb-3" style={{ color: 'black' }}>{benefit.emoji}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="flex justify-center mt-4 gap-1 sm:hidden">
          {benefits.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
