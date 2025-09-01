import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextInput } from "@/components/inputs/TextInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { SliderInput } from "@/components/inputs/SliderInput";
import { DropdownSelect } from "@/components/inputs/DropdownSelect";
import { PhotoUpload } from "@/components/inputs/PhotoUpload";
import { TextareaInput } from "@/components/inputs/TextareaInput";

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
  battenDepth: string;
  membraneType: string;
  membraneCondition: string;
  structuralDefects: string;
  plannedPanelCount: string;
  photos: string[];
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
  { value: "400", label: "400mm" },
  { value: "450", label: "450mm" },
  { value: "600", label: "600mm" },
  { value: "900", label: "900mm" },
  { value: "other", label: "Other" }
];

const membraneTypeOptions = [
  { value: "breathable", label: "Breathable" },
  { value: "bitumen", label: "Bitumen" },
  { value: "none", label: "None" }
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
      battenDepth: "",
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
            const area = (parseFloat(width) * parseFloat(length)).toFixed(2);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TextInput
                id={`${face.id}-label`}
                label="Roof Face Label"
                value={face.label}
                onChange={(value) => updateRoofFace(face.id, 'label', value)}
                required
              />
              
              <SliderInput
                id={`${face.id}-orientation`}
                label="Orientation (° from South)"
                value={face.orientation}
                onChange={(value) => updateRoofFace(face.id, 'orientation', value)}
                min={-180}
                max={180}
                step={1}
                unit="°"
                required
              />
              
              <SliderInput
                id={`${face.id}-pitch`}
                label="Pitch (°)"
                value={face.pitch}
                onChange={(value) => updateRoofFace(face.id, 'pitch', value)}
                min={0}
                max={60}
                step={1}
                unit="°"
                presetValues={[15, 30, 35, 45]}
                required
              />
              
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
              
              <NumberInput
                id={`${face.id}-area`}
                label="Gross Roof Area"
                value={face.area}
                onChange={(value) => updateRoofFace(face.id, 'area', value)}
                min={0}
                max={1000}
                step={0.01}
                unit="m²"
                required
                enableVoice={false}
              />
              
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
              
              <NumberInput
                id={`${face.id}-gutter-height`}
                label="Gutter Height Above Ground"
                value={face.gutterHeight}
                onChange={(value) => updateRoofFace(face.id, 'gutterHeight', value)}
                min={0}
                max={20}
                step={0.1}
                unit="m"
                required
              />
              
              <DropdownSelect
                id={`${face.id}-rafter-spacing`}
                label="Rafter Spacing"
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
                max={500}
                step={1}
                unit="mm"
                required
              />
              
              <NumberInput
                id={`${face.id}-batten-depth`}
                label="Batten Depth"
                value={face.battenDepth}
                onChange={(value) => updateRoofFace(face.id, 'battenDepth', value)}
                min={0}
                max={100}
                step={1}
                unit="mm"
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
            
            <div className="space-y-4">
              <PhotoUpload
                id={`${face.id}-obstructions`}
                label="Obstructions on Roof (chimneys, aerials, velux, vents)"
                photos={face.obstructions}
                onChange={(photos) => updateRoofFace(face.id, 'obstructions', photos)}
                maxPhotos={5}
              />
              
              <PhotoUpload
                id={`${face.id}-shading`}
                label="Shading Objects (trees, buildings, pylons)"
                photos={face.shading}
                onChange={(photos) => updateRoofFace(face.id, 'shading', photos)}
                maxPhotos={5}
              />
              
              <PhotoUpload
                id={`${face.id}-photos`}
                label="General Roof Photos"
                photos={face.photos}
                onChange={(photos) => updateRoofFace(face.id, 'photos', photos)}
                maxPhotos={10}
              />
              
              <TextareaInput
                id={`${face.id}-structural-defects`}
                label="Structural Defects"
                value={face.structuralDefects}
                onChange={(value) => updateRoofFace(face.id, 'structuralDefects', value)}
                placeholder="Describe any structural defects or concerns..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
