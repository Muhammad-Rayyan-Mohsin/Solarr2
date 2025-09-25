import { SolarApiTestPanel } from '@/components/SolarApiTestPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SolarApiTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Survey
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Solar API Testing</h1>
            <p className="text-muted-foreground">
              Test and validate Google Solar API integration
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <SolarApiTestPanel />
      </div>
    </div>
  );
}
