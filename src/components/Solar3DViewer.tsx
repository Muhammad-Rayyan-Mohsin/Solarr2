import { SimpleSolar3DViewer } from "@/components/SimpleSolar3DViewer";

interface Solar3DViewerProps {
  solarData?: any;
  enableInteraction?: boolean;
  showGrid?: boolean;
}

/**
 * Solar 3D Viewer
 * Advanced 3D solar visualization component
 */
export function Solar3DViewer({
  solarData,
  enableInteraction = true,
  showGrid = true
}: Solar3DViewerProps) {
  return <SimpleSolar3DViewer solarData={solarData} width={800} height={600} />;
}

