interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  completedSteps
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`progress-circle ${
              completedSteps.includes(step)
                ? 'completed'
                : step === currentStep
                ? 'current'
                : 'pending'
            }`}
          >
            <span className="text-xs font-medium">
              {step}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className="w-8 h-0.5 mx-1 bg-border">
              <div
                className={`h-full bg-primary transition-all duration-300 ${
                  completedSteps.includes(step) ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}