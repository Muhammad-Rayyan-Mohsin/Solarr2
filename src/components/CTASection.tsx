import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-solar-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-float" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-headline text-white mb-6">Ready to Discover Your Solar Potential?</h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">Simple, structured survey to capture your baseline information.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button onClick={() => navigate('/survey')} className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all group">
              Start Survey Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Takes ~3 minutes</span>
            </div>
            <span className="text-sm">•</span>
            <span className="text-sm">No signup required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
