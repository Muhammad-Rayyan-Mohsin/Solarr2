import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignatureInputProps {
  id: string;
  label: string;
  value: string; // base64 signature data
  onChange: (value: string) => void;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
  description?: string;
}

export function SignatureInput({
  id,
  label,
  value,
  onChange,
  required = false,
  isFlagged = false,
  flagMessage,
  description,
}: SignatureInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    onChange(dataURL);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange("");
    setHasSignature(false);
  };

  const confirmSignature = () => {
    if (hasSignature) {
      // Signature is already saved, just confirm
      return;
    }
    saveSignature();
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  return (
    <div className={cn("space-y-2", isFlagged && "flag-indicator")}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {hasSignature ? "Signature captured" : "Click and drag to sign"}
              </p>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className={cn(
                    "border border-border rounded-lg cursor-crosshair bg-white shadow-sm",
                    isFlagged && "border-destructive"
                  )}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {!hasSignature ? (
                <Button
                  type="button"
                  onClick={confirmSignature}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Signature
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSignature}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear & Resign
                  </Button>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Signed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isFlagged && flagMessage && (
        <p className="text-sm text-destructive">{flagMessage}</p>
      )}
    </div>
  );
}