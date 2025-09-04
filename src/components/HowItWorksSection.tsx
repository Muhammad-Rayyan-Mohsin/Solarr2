import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, BarChart3, FileText } from 'lucide-react';

const steps = [
  { icon: FileText, title: 'Quick questions', desc: 'A short, structured form to gather your baseline details.' },
  { icon: BarChart3, title: 'Smart review', desc: 'We organize your answers to make next steps easier.' },
  { icon: ListChecks, title: 'Your results', desc: 'Review your submission anytime in the Submissions page.' },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-headline text-foreground">How it works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <Card key={idx} className="bg-card/80 border border-border/50 scroll-reveal">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-solar-gradient rounded-full flex items-center justify-center shadow-lg mb-4">
                  <s.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
