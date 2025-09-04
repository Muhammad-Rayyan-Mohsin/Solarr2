import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SurveyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-solar-gradient rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Solar Survey</span>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-border/20">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-solar-gradient rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Survey Coming Soon!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're putting the finishing touches on our comprehensive solar 
                readiness assessment. It will include:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Property assessment questions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Energy usage analysis</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Roof condition evaluation</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Savings calculations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Incentive identification</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Personalized recommendations</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/20 pt-8">
              <p className="text-muted-foreground mb-6">
                Want to be notified when the survey goes live? We'll send you an 
                email as soon as it's ready.
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="btn-solar px-8 py-3 rounded-full font-semibold"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;