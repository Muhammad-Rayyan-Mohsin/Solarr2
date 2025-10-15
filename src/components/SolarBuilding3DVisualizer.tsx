import { SimpleSolar3DViewer } from "@/components/SimpleSolar3DViewer";

interface SolarBuilding3DVisualizerProps {
  buildingData?: any;
  solarPanels?: any[];
  viewAngle?: number;
}

/**
 * Solar Building 3D Visualizer
 * Visualizes buildings with solar panel placement in 3D
 */
export function SolarBuilding3DVisualizer({
  buildingData,
  solarPanels,
  viewAngle = 45
}: SolarBuilding3DVisualizerProps) {
  return <SimpleSolar3DViewer solarData={buildingData} width={700} height={500} />;
}

