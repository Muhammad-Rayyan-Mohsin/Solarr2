/**
 * Data Flow Verification Utility
 * Tracks and validates data flow through the solar survey application
 */

export interface DataFlowStep {
  step: string;
  component: string;
  data: any;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
}

export class DataFlowVerification {
  private static instance: DataFlowVerification;
  private flowSteps: DataFlowStep[] = [];
  private isEnabled: boolean = false;

  private constructor() {}

  static getInstance(): DataFlowVerification {
    if (!DataFlowVerification.instance) {
      DataFlowVerification.instance = new DataFlowVerification();
    }
    return DataFlowVerification.instance;
  }

  enable() {
    this.isEnabled = true;
    console.log('[DataFlow] Verification enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('[DataFlow] Verification disabled');
  }

  trackStep(step: string, component: string, data: any, status: 'success' | 'error' | 'pending' = 'success') {
    if (!this.isEnabled) return;

    const flowStep: DataFlowStep = {
      step,
      component,
      data,
      timestamp: new Date(),
      status
    };

    this.flowSteps.push(flowStep);
    console.log(`[DataFlow] ${component} -> ${step}:`, data);
  }

  getFlowSteps(): DataFlowStep[] {
    return [...this.flowSteps];
  }

  clearFlow() {
    this.flowSteps = [];
    console.log('[DataFlow] Flow cleared');
  }

  verifyDataIntegrity(expectedData: any, actualData: any): boolean {
    const expectedKeys = Object.keys(expectedData);
    const actualKeys = Object.keys(actualData);

    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
    const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));

    if (missingKeys.length > 0) {
      console.warn('[DataFlow] Missing keys:', missingKeys);
      return false;
    }

    if (extraKeys.length > 0) {
      console.warn('[DataFlow] Extra keys:', extraKeys);
    }

    return true;
  }

  generateReport(): string {
    const report = this.flowSteps.map((step, index) => {
      return `${index + 1}. [${step.timestamp.toISOString()}] ${step.component} - ${step.step} (${step.status})`;
    }).join('\n');

    return `Data Flow Report\n================\n${report}\n\nTotal Steps: ${this.flowSteps.length}`;
  }

  exportToJSON(): string {
    return JSON.stringify(this.flowSteps, null, 2);
  }
}

// Export singleton instance
export const dataFlowVerifier = DataFlowVerification.getInstance();

