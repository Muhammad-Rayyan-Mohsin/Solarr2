import { SolarApiTestPanel } from '@/components/SolarApiTestPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SolarApiTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized Header */}
      <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-4 py-3 flex items-center gap-3 md:container md:mx-auto md:px-6 md:py-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm md:text-base h-10 md:h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Survey</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold md:font-bold truncate">Solar API Testing</h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Test and validate Google Solar API integration
            </p>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Content */}
      <div className="px-4 py-4 md:container md:mx-auto md:px-6 md:py-8">
        <SolarApiTestPanel />
      </div>
    </div>
  );
}
