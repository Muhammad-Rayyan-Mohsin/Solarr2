import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  formData: any;
  onExport: (type: 'pdf' | 'csv') => Promise<void>;
}

export function ExportButtons({ formData, onExport }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'pdf' | 'csv' | null>(null);
  const { toast } = useToast();

  const handleExport = async (type: 'pdf' | 'csv') => {
    setIsExporting(type);
    try {
      await onExport(type);
      toast({
        title: "Export Successful",
        description: `${type.toUpperCase()} file has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to generate ${type.toUpperCase()} file. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => handleExport('pdf')}
        disabled={isExporting !== null}
        className="flex items-center gap-2"
      >
        {isExporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Export PDF
      </Button>
      
      <Button
        onClick={() => handleExport('csv')}
        disabled={isExporting !== null}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isExporting === 'csv' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export CSV
      </Button>
    </div>
  );
}

