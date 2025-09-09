import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, BarChart3, FileText } from 'lucide-react';

const steps = [
  { icon: FileText, title: 'Quick questions', desc: 'A short, structured form to gather your baseline details.' },
  { icon: BarChart3, title: 'Smart review', desc: 'We organize your answers to make next steps easier.' },
  { icon: ListChecks, title: 'Your results', desc: 'Review your submission anytime in the Submissions page.' },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-headline text-foreground">How it works</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, idx) => (
            <Card key={idx} className="bg-card/80 border border-border/50 scroll-reveal">
              <CardContent className="p-4 sm:p-6">
                {/* Mobile: horizontal layout */}
                <div className="flex items-start gap-4 sm:block sm:text-center">
                  <div className="flex-shrink-0 w-12 h-12 sm:mx-auto sm:w-16 sm:h-16 bg-solar-gradient rounded-full flex items-center justify-center shadow-lg sm:mb-4">
                    <s.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{s.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
