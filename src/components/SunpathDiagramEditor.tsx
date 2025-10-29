import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Download, 
  Eraser, 
  Pencil, 
  RotateCcw, 
  Trash2,
  Undo,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SunpathDiagramEditorProps {
  roofId: string;
  roofLabel: string;
  onSave?: (imageData: string) => void;
  initialImageData?: string;
}

export function SunpathDiagramEditor({
  roofId,
  roofLabel,
  onSave,
  initialImageData
}: SunpathDiagramEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'pen' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the sunpath diagram image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = '/sunpath-diagram.png'; // Path to your sunpath diagram
    
    img.onload = () => {
      // Rotate 90 degrees clockwise - swap width/height for horizontal display
      const maxDisplayWidth = 800;
      const maxDisplayHeight = 800;
      
      // Swap dimensions because we're rotating 90 degrees
      let displayWidth = img.height;
      let displayHeight = img.width;
      
      // Scale down if image is too large
      if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        const scaleX = maxDisplayWidth / displayWidth;
        const scaleY = maxDisplayHeight / displayHeight;
        const scale = Math.min(scaleX, scaleY);
        
        displayWidth = displayWidth * scale;
        displayHeight = displayHeight * scale;
      }
      
      // Set canvas size to rotated display size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // Rotate and draw the image 90 degrees clockwise
      ctx.save();
      ctx.translate(displayWidth / 2, displayHeight / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -displayHeight / 2, -displayWidth / 2, displayHeight, displayWidth);
      ctx.restore();
      
      // If there's initial data, load it
      if (initialImageData) {
        const savedImg = new Image();
        savedImg.src = initialImageData;
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0, displayWidth, displayHeight);
          saveToHistory();
          setIsLoaded(true);
        };
      } else {
        saveToHistory();
        setIsLoaded(true);
      }
    };

    img.onerror = () => {
      console.error('Failed to load sunpath diagram');
      // Fallback: create a blank canvas
      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sunpath Diagram', canvas.width / 2, canvas.height / 2);
      saveToHistory();
      setIsLoaded(true);
    };
  }, [initialImageData]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    // Limit history to 20 steps
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryStep(historyStep + 1);
    }
    
    setHistory(newHistory);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (drawMode === 'eraser') {
      // Eraser mode: clear the area
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      // Drawing mode
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      
      // Save the current state
      const canvas = canvasRef.current;
      if (canvas && onSave) {
        onSave(canvas.toDataURL('image/png'));
      }
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      ctx.putImageData(history[newStep], 0, 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reload the base image
    const img = new Image();
    img.src = '/sunpath-diagram.png';
    img.onload = () => {
      // Rotate 90 degrees clockwise - swap width/height for horizontal display
      const maxDisplayWidth = 800;
      const maxDisplayHeight = 800;
      
      // Swap dimensions because we're rotating 90 degrees
      let displayWidth = img.height;
      let displayHeight = img.width;
      
      // Scale down if image is too large
      if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        const scaleX = maxDisplayWidth / displayWidth;
        const scaleY = maxDisplayHeight / displayHeight;
        const scale = Math.min(scaleX, scaleY);
        
        displayWidth = displayWidth * scale;
        displayHeight = displayHeight * scale;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Rotate and draw the image 90 degrees clockwise
      ctx.save();
      ctx.translate(displayWidth / 2, displayHeight / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -displayHeight / 2, -displayWidth / 2, displayHeight, displayWidth);
      ctx.restore();
      
      saveToHistory();
    };
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `sunpath-diagram-${roofLabel.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const colorPresets = [
    { color: '#FF0000', label: 'Red' },
    { color: '#0000FF', label: 'Blue' },
    { color: '#00FF00', label: 'Green' },
    { color: '#FFFF00', label: 'Yellow' },
    { color: '#FF00FF', label: 'Magenta' },
    { color: '#00FFFF', label: 'Cyan' },
    { color: '#000000', label: 'Black' },
    { color: '#FFFFFF', label: 'White' }
  ];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Sunpath Diagram - {roofLabel}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Mark shading objects, obstructions, and sun paths on the diagram
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drawing Tools */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={drawMode === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDrawMode('pen')}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Draw
            </Button>
            <Button
              variant={drawMode === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDrawMode('eraser')}
              className="flex items-center gap-2"
            >
              <Eraser className="h-4 w-4" />
              Erase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="flex items-center gap-2"
            >
              <Undo className="h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2 ml-auto"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Color Picker */}
          {drawMode === 'pen' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Drawing Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setStrokeColor(preset.color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      strokeColor === preset.color
                        ? "border-primary scale-110 shadow-lg"
                        : "border-gray-300 hover:scale-105"
                    )}
                    style={{ backgroundColor: preset.color }}
                    title={preset.label}
                  />
                ))}
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>
          )}

          {/* Stroke Width */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {drawMode === 'pen' ? 'Line' : 'Eraser'} Width: {strokeWidth}px
            </Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white" style={{ minHeight: '600px' }}>
          <div className="flex justify-center items-center" style={{ minHeight: '600px' }}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair touch-none"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '800px',
                minHeight: '600px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-900 font-medium mb-2">How to use:</p>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Use the <strong>Draw</strong> tool to mark shading objects (trees, buildings, etc.)</li>
            <li>Mark the sun path and times when shading occurs</li>
            <li>Use different colors to distinguish between different obstructions</li>
            <li>Use the <strong>Erase</strong> tool to correct mistakes</li>
            <li>Click <strong>Download</strong> to save your annotated diagram</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

