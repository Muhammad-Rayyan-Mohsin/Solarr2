import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextInput } from "@/components/inputs/TextInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { SliderInput } from "@/components/inputs/SliderInput";
import { EnhancedSliderInput } from "@/components/inputs/EnhancedSliderInput";
import { DropdownSelect } from "@/components/inputs/DropdownSelect";
import { PhotoUpload } from "@/components/inputs/PhotoUpload";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { TextWithPhotoInput } from "@/components/inputs/TextWithPhotoInput";
import { SunpathDiagramEditor } from "@/components/SunpathDiagramEditor";

interface RoofFace {
  id: string;
  label: string;
  orientation: number;
  pitch: number;
  width: string;
  length: string;
  area: string;
  covering: string;
  coveringCondition: string;
  obstructions: string[];
  shading: string[];
  gutterHeight: string;
  rafterSpacing: string;
  rafterDepth: string;
  rafterWidth: string;
  membraneType: string;
  membraneCondition: string;
  structuralDefects: string;
  plannedPanelCount: string;
  photos: string[];
  sunpathDiagram?: string;
  noShading?: boolean;
}

interface RoofSectionProps {
  roofFaces: RoofFace[];
  onRoofFacesChange: (faces: RoofFace[]) => void;
}

const coveringOptions = [
  { value: "slate", label: "Slate" },
  { value: "concrete-tile", label: "Concrete Tile" },
  { value: "clay-tile", label: "Clay Tile" },
  { value: "metal-sheet", label: "Metal Sheet" },
  { value: "membrane", label: "Membrane" },
  { value: "shingle", label: "Shingle" },
  { value: "other", label: "Other" }
];

const conditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" }
];

const rafterSpacingOptions = [
  { value: "40", label: "40cm" },
  { value: "45", label: "45cm" },
  { value: "60", label: "60cm" },
  { value: "90", label: "90cm" },
  { value: "other", label: "Other" }
];

const membraneTypeOptions = [
  { value: "breathable", label: "Breathable" },
  { value: "bitumen", label: "Bitumen" },
  { value: "none", label: "None" }
];

const gutterHeightOptions = [
  { value: "0.5", label: "0.5m" },
  { value: "1.0", label: "1.0m" },
  { value: "1.5", label: "1.5m" },
  { value: "2.0", label: "2.0m" },
  { value: "2.5", label: "2.5m" },
  { value: "3.0", label: "3.0m" },
  { value: "3.5", label: "3.5m" },
  { value: "4.0", label: "4.0m" },
  { value: "4.5", label: "4.5m" },
  { value: "5.0", label: "5.0m" },
  { value: "5.5", label: "5.5m" },
  { value: "6.0", label: "6.0m" },
  { value: "6.5", label: "6.5m" },
  { value: "7.0", label: "7.0m" },
  { value: "7.5", label: "7.5m" },
  { value: "8.0", label: "8.0m" },
  { value: "8.5", label: "8.5m" },
  { value: "9.0", label: "9.0m" },
  { value: "9.5", label: "9.5m" },
  { value: "10.0", label: "10.0m" },
  { value: "other", label: "Other" }
];

export function RoofSection({ roofFaces, onRoofFacesChange }: RoofSectionProps) {
  const addRoofFace = () => {
    const newFace: RoofFace = {
      id: `roof-${roofFaces.length + 1}`,
      label: `Roof-${roofFaces.length + 1}`,
      orientation: 0,
      pitch: 30,
      width: "",
      length: "",
      area: "",
      covering: "",
      coveringCondition: "",
      obstructions: [],
      shading: [],
      gutterHeight: "",
      rafterSpacing: "",
      rafterDepth: "",
      rafterWidth: "",
      membraneType: "",
      membraneCondition: "",
      structuralDefects: "",
      plannedPanelCount: "",
      photos: []
    };
    onRoofFacesChange([...roofFaces, newFace]);
  };

  const removeRoofFace = (id: string) => {
    onRoofFacesChange(roofFaces.filter(face => face.id !== id));
  };

  const updateRoofFace = (id: string, field: keyof RoofFace, value: any) => {
    const updatedFaces = roofFaces.map(face => {
      if (face.id === id) {
        const updatedFace = { ...face, [field]: value };
        
        // Auto-calculate area if width and length are provided
        if (field === 'width' || field === 'length') {
          const width = field === 'width' ? value : face.width;
          const length = field === 'length' ? value : face.length;
          if (width && length) {
            // Deduct 40cm (0.4m) border from all edges for usable area
            const usableWidth = Math.max(0, parseFloat(width) - 0.8);
            const usableLength = Math.max(0, parseFloat(length) - 0.8);
            const area = (usableWidth * usableLength).toFixed(2);
            updatedFace.area = area;
          }
        }
        
        return updatedFace;
      }
      return face;
    });
    onRoofFacesChange(updatedFaces);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Roof Inspection</h3>
        <Button onClick={addRoofFace} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Roof Face
        </Button>
      </div>

      {roofFaces.map((face, index) => (
        <Card key={face.id} className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{face.label}</CardTitle>
              {roofFaces.length > 1 && (
                <Button
                  onClick={() => removeRoofFace(face.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {/* Basic Roof Information */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Basic Roof Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TextInput
                    id={`${face.id}-label`}
                    label="Roof Face Label"
                    value={face.label}
                    onChange={(value) => updateRoofFace(face.id, 'label', value)}
                    required
                  />
                  
                  <EnhancedSliderInput
                    id={`${face.id}-orientation`}
                    label="Orientation (° from South)"
                    value={face.orientation}
                    onChange={(value) => updateRoofFace(face.id, 'orientation', value)}
                    min={-180}
                    max={180}
                    step={1}
                    unit="°"
                    required
                    showLabels={true}
                    showInput={true}
                    showButtons={true}
                    presetValues={[-180, -90, 0, 90, 180]}
                    description="0° = South, 90° = West, -90° = East, 180° = North"
                  />
                  
                  <EnhancedSliderInput
                    id={`${face.id}-pitch`}
                    label="Pitch (°)"
                    value={face.pitch}
                    onChange={(value) => updateRoofFace(face.id, 'pitch', value)}
                    min={0}
                    max={60}
                    step={1}
                    unit="°"
                    required
                    showLabels={true}
                    showInput={true}
                    showButtons={true}
                    presetValues={[15, 30, 35, 45]}
                    description="Roof angle from horizontal. 30-35° is optimal for solar panels"
                  />
                </div>
              </div>

              {/* Roof Dimensions */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Roof Dimensions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput
                    id={`${face.id}-width`}
                    label="Available Width"
                    value={face.width}
                    onChange={(value) => updateRoofFace(face.id, 'width', value)}
                    min={0}
                    max={50}
                    step={0.1}
                    unit="m"
                    required
                  />
                  
                  <NumberInput
                    id={`${face.id}-length`}
                    label="Available Length"
                    value={face.length}
                    onChange={(value) => updateRoofFace(face.id, 'length', value)}
                    min={0}
                    max={50}
                    step={0.1}
                    unit="m"
                    required
                  />
                </div>
              </div>

              {/* Roof Covering & Condition */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Roof Covering & Condition
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DropdownSelect
                    id={`${face.id}-covering`}
                    label="Roof Covering"
                    value={face.covering}
                    onChange={(value) => updateRoofFace(face.id, 'covering', value)}
                    options={coveringOptions}
                    required
                  />
                  
                  <DropdownSelect
                    id={`${face.id}-covering-condition`}
                    label="Covering Condition"
                    value={face.coveringCondition}
                    onChange={(value) => updateRoofFace(face.id, 'coveringCondition', value)}
                    options={conditionOptions}
                    required
                  />
                </div>
              </div>

              {/* Structural Details */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Structural Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TextInput
                    id={`${face.id}-gutter-height`}
                    label="Gutter Height Above Ground (m)"
                    value={face.gutterHeight}
                    onChange={(value) => updateRoofFace(face.id, 'gutterHeight', value)}
                    placeholder="e.g., 2.5"
                    required
                  />
                  
                  <DropdownSelect
                    id={`${face.id}-rafter-spacing`}
                    label="Rafter Spacing (cm)"
                    value={face.rafterSpacing}
                    onChange={(value) => updateRoofFace(face.id, 'rafterSpacing', value)}
                    options={rafterSpacingOptions}
                    required
                  />
                  
                  <NumberInput
                    id={`${face.id}-rafter-depth`}
                    label="Rafter Depth"
                    value={face.rafterDepth}
                    onChange={(value) => updateRoofFace(face.id, 'rafterDepth', value)}
                    min={0}
                    max={50}
                    step={0.1}
                    unit="cm"
                    required
                  />
                  
                  <NumberInput
                    id={`${face.id}-rafter-width`}
                    label="Rafter Width"
                    value={face.rafterWidth}
                    onChange={(value) => updateRoofFace(face.id, 'rafterWidth', value)}
                    min={0}
                    max={10}
                    step={0.1}
                    unit="cm"
                    required
                  />
                  
                  <DropdownSelect
                    id={`${face.id}-membrane-type`}
                    label="Membrane Type"
                    value={face.membraneType}
                    onChange={(value) => updateRoofFace(face.id, 'membraneType', value)}
                    options={membraneTypeOptions}
                    required
                  />
                  
                  <DropdownSelect
                    id={`${face.id}-membrane-condition`}
                    label="Membrane Condition"
                    value={face.membraneCondition}
                    onChange={(value) => updateRoofFace(face.id, 'membraneCondition', value)}
                    options={conditionOptions}
                    required
                  />
                </div>
              </div>

              {/* Planning */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Planning
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput
                    id={`${face.id}-planned-panel-count`}
                    label="Planned Panel Count"
                    value={face.plannedPanelCount}
                    onChange={(value) => updateRoofFace(face.id, 'plannedPanelCount', value)}
                    min={1}
                    max={50}
                    step={1}
                    required
                    enableVoice={false}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Obstructions - Text + Photo grouped */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Roof Obstructions
                </h4>
                <TextWithPhotoInput
                  id={`${face.id}-obstructions`}
                  label="Obstructions on Roof"
                  textValue=""
                  onTextChange={() => {}}
                  photos={face.obstructions}
                  onPhotosChange={(photos) => updateRoofFace(face.id, 'obstructions', photos)}
                  placeholder="Describe obstructions (chimneys, aerials, velux, vents)..."
                  multiline
                  maxPhotos={5}
                  photoGuidelines={[
                    {
                      title: "Chimneys",
                      description: "Document chimney locations and heights",
                      icon: "•"
                    },
                    {
                      title: "Aerials & Vents",
                      description: "Show aerials, vents, and other roof fixtures",
                      icon: "•"
                    },
                    {
                      title: "Velux Windows",
                      description: "Document skylight positions and sizes",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Shading - Text + Photo grouped */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Shading Objects
                </h4>
                <TextWithPhotoInput
                  id={`${face.id}-shading`}
                  label="Shading Objects"
                  textValue=""
                  onTextChange={() => {}}
                  photos={face.shading}
                  onPhotosChange={(photos) => updateRoofFace(face.id, 'shading', photos)}
                  placeholder="Describe shading objects (trees, buildings, pylons)..."
                  multiline
                  maxPhotos={5}
                  photoGuidelines={[
                    {
                      title: "Trees",
                      description: "Document tree positions and heights",
                      icon: "•"
                    },
                    {
                      title: "Buildings",
                      description: "Show nearby buildings that may cause shading",
                      icon: "•"
                    },
                    {
                      title: "Pylons & Poles",
                      description: "Document utility poles and pylons",
                      icon: "•"
                    }
                  ]}
                />
              </div>

              {/* Sunpath Diagram Editor */}
              <div className="space-y-4">
                <SunpathDiagramEditor
                  roofId={face.id}
                  roofLabel={face.label}
                  initialImageData={face.sunpathDiagram}
                  onSave={(imageData) => updateRoofFace(face.id, 'sunpathDiagram', imageData)}
                  noShading={face.noShading}
                  onNoShadingChange={(noShading) => updateRoofFace(face.id, 'noShading', noShading)}
                />
              </div>

              {/* General Roof Photos */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  General Roof Photos
                </h4>
                <PhotoUpload
                  id={`${face.id}-photos`}
                  label="General Roof Photos"
                  photos={face.photos}
                  onChange={(photos) => updateRoofFace(face.id, 'photos', photos)}
                  maxPhotos={10}
                />
              </div>

              {/* Structural Defects */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2">
                  Structural Assessment
                </h4>
                <TextareaInput
                  id={`${face.id}-structural-defects`}
                  label="Structural Defects"
                  value={face.structuralDefects}
                  onChange={(value) => updateRoofFace(face.id, 'structuralDefects', value)}
                  placeholder="Describe any structural defects or concerns..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
