import { jsPDF } from "jspdf";
import { SupabaseService } from "./supabaseService";
import { supabase } from "@/integrations/supabase/client";

export class PDFService {
  private static async getImageAsBase64(storagePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('surveys')
        .download(storagePath);
      
      if (error) {
        console.error('Error downloading image:', error);
        return null;
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/... prefix
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(data);
      });
    } catch (error) {
      console.error('Failed to fetch image:', error);
      return null;
    }
  }

  private static addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number {
    if (!text) return y;
    
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return y + (splitText.length * lineHeight);
  }

  private static addSection(doc: jsPDF, title: string, yPos: number): number {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    return yPos + 10;
  }

  private static addField(doc: jsPDF, label: string, value: any, yPos: number, maxWidth: number = 170): number {
    if (value === null || value === undefined || value === '') return yPos;
    
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPos);
    doc.setFont("helvetica", "normal");
    
    const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
    return this.addWrappedText(doc, valueStr, 70, yPos, maxWidth - 50, 6) + 3;
  }

  private static async addImageToDoc(doc: jsPDF, asset: any, yPos: number): Promise<number> {
    try {
      const base64Image = await this.getImageAsBase64(asset.storagePath);
      if (!base64Image) return yPos;

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const imgWidth = 80;
      const imgHeight = 60;
      
      doc.setFont("helvetica", "bold");
      doc.text(`${asset.section} - ${asset.field}:`, 20, yPos);
      yPos += 8;
      
      // Determine image format from mime type
      let format = 'JPEG';
      if (asset.mimeType?.includes('png')) format = 'PNG';
      else if (asset.mimeType?.includes('gif')) format = 'GIF';
      
      doc.addImage(base64Image, format, 20, yPos, imgWidth, imgHeight);
      return yPos + imgHeight + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      return yPos;
    }
  }

  static async generateComprehensivePDF(surveyId: string): Promise<void> {
    try {
      // Fetch complete survey data
      const fullSurvey = await SupabaseService.getFullSurvey(surveyId);
      if (!fullSurvey) {
        throw new Error('Survey not found');
      }

      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Solar Survey Report", 20, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Basic Information
      yPos = this.addSection(doc, "Survey Information", yPos);
      yPos = this.addField(doc, "Survey ID", fullSurvey.id, yPos);
      yPos = this.addField(doc, "Survey Date", fullSurvey.surveyDate, yPos);
      yPos = this.addField(doc, "Status", fullSurvey.status, yPos);
      yPos += 5;

      // Customer Information
      yPos = this.addSection(doc, "Customer Information", yPos);
      yPos = this.addField(doc, "Customer Name", fullSurvey.customerName, yPos);
      yPos = this.addField(doc, "Site Address", fullSurvey.siteAddress, yPos);
      yPos = this.addField(doc, "Postcode", fullSurvey.postcode, yPos);
      yPos = this.addField(doc, "Phone", fullSurvey.phone, yPos);
      yPos = this.addField(doc, "Email", fullSurvey.email, yPos);
      yPos = this.addField(doc, "Secondary Contact Name", fullSurvey.secondaryContactName, yPos);
      yPos = this.addField(doc, "Secondary Contact Phone", fullSurvey.secondaryContactPhone, yPos);
      yPos = this.addField(doc, "Grid Reference", fullSurvey.gridReference, yPos);
      yPos = this.addField(doc, "What3Words", fullSurvey.what3words, yPos);
      yPos += 5;

      // Surveyor Information
      if (fullSurvey.surveyorInfo) {
        yPos = this.addSection(doc, "Surveyor Information", yPos);
        yPos = this.addField(doc, "Surveyor Name", fullSurvey.surveyorInfo.name, yPos);
        yPos = this.addField(doc, "Surveyor Phone", fullSurvey.surveyorInfo.telephone, yPos);
        yPos = this.addField(doc, "Surveyor Email", fullSurvey.surveyorInfo.email, yPos);
        yPos += 5;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Electricity Baseline
      if (fullSurvey.electricity_baseline) {
        yPos = this.addSection(doc, "Electricity Baseline", yPos);
        const eb = fullSurvey.electricity_baseline;
        yPos = this.addField(doc, "Annual Consumption", eb.annual_consumption ? `${eb.annual_consumption} kWh` : '', yPos);
        yPos = this.addField(doc, "MPAN Number", eb.mpan_number, yPos);
        yPos = this.addField(doc, "Electricity Provider", eb.electricity_provider, yPos);
        yPos = this.addField(doc, "Network Operator", eb.network_operator, yPos);
        yPos = this.addField(doc, "Customer Permission Granted", eb.customer_permission_granted ? 'Yes' : 'No', yPos);
        yPos = this.addField(doc, "Daytime Import Rate", eb.daytime_import_rate ? `${eb.daytime_import_rate}p/kWh` : '', yPos);
        yPos = this.addField(doc, "Nighttime Import Rate", eb.nighttime_import_rate ? `${eb.nighttime_import_rate}p/kWh` : '', yPos);
        yPos = this.addField(doc, "Standing Charge", eb.standing_charge ? `${eb.standing_charge}p/day` : '', yPos);
        yPos = this.addField(doc, "Tariff Type", eb.tariff_type, yPos);
        yPos = this.addField(doc, "Smart Meter Present", eb.smart_meter_present, yPos);
        yPos = this.addField(doc, "SEG Tariff Available", eb.seg_tariff_available, yPos);
        yPos = this.addField(doc, "SEG Tariff Explanation", eb.seg_tariff_explanation, yPos);
        yPos = this.addField(doc, "Smart Tariff Available", eb.smart_tariff_available, yPos);
        yPos += 5;
      }

      // Property Overview
      if (fullSurvey.property_overview) {
        yPos = this.addSection(doc, "Property Overview", yPos);
        const po = fullSurvey.property_overview;
        yPos = this.addField(doc, "Property Type", po.property_type, yPos);
        yPos = this.addField(doc, "Property Age", po.property_age, yPos);
        yPos = this.addField(doc, "Listed Building", po.listed_building, yPos);
        yPos = this.addField(doc, "Conservation Area", po.conservation_area, yPos);
        yPos = this.addField(doc, "New Build", po.new_build, yPos);
        yPos = this.addField(doc, "Shared Roof", po.shared_roof, yPos);
        yPos = this.addField(doc, "Scaffold Access", po.scaffold_access, yPos);
        yPos = this.addField(doc, "Storage Area", po.storage_area, yPos);
        yPos = this.addField(doc, "Restricted Parking", po.restricted_parking, yPos);
        yPos += 5;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Roof Faces
      if (fullSurvey.roof_faces && fullSurvey.roof_faces.length > 0) {
        yPos = this.addSection(doc, "Roof Faces", yPos);
        for (const rf of fullSurvey.roof_faces) {
          const index = fullSurvey.roof_faces.indexOf(rf);
          yPos = this.addField(doc, `Roof Face ${index + 1} Label`, rf.label, yPos);
          yPos = this.addField(doc, "Orientation", rf.orientation ? `${rf.orientation}°` : '', yPos);
          yPos = this.addField(doc, "Pitch", rf.pitch ? `${rf.pitch}°` : '', yPos);
          yPos = this.addField(doc, "Width", rf.width ? `${rf.width}m` : '', yPos);
          yPos = this.addField(doc, "Length", rf.length ? `${rf.length}m` : '', yPos);
          yPos = this.addField(doc, "Area", rf.area ? `${rf.area}m²` : '', yPos);
          yPos = this.addField(doc, "Covering", rf.covering, yPos);
          yPos = this.addField(doc, "Covering Condition", rf.covering_condition, yPos);
          yPos = this.addField(doc, "Obstructions", rf.obstructions, yPos);
          yPos = this.addField(doc, "Shading", rf.shading, yPos);
          yPos = this.addField(doc, "Planned Panel Count", rf.planned_panel_count, yPos);

          // Add roof face images
          if (rf.assets && rf.assets.length > 0) {
            for (const asset of rf.assets) {
              if (yPos > 200) {
                doc.addPage();
                yPos = 20;
              }
              yPos = await this.addImageToDoc(doc, asset, yPos);
            }
          }
          yPos += 5;
        }
      }

      // Loft/Attic
      if (fullSurvey.loft_attic) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Loft/Attic", yPos);
        const la = fullSurvey.loft_attic;
        yPos = this.addField(doc, "Loft Hatch Width", la.loft_hatch_width ? `${la.loft_hatch_width}m` : '', yPos);
        yPos = this.addField(doc, "Loft Hatch Height", la.loft_hatch_height ? `${la.loft_hatch_height}m` : '', yPos);
        yPos = this.addField(doc, "Loft Access Type", la.loft_access_type, yPos);
        yPos = this.addField(doc, "Loft Headroom", la.loft_headroom, yPos);
        yPos = this.addField(doc, "Loft Boards in Place", la.loft_boards_in_place, yPos);
        yPos = this.addField(doc, "Roof Timber Condition", la.roof_timber_condition, yPos);
        yPos = this.addField(doc, "Roof Timber Notes", la.roof_timber_notes, yPos);
        yPos = this.addField(doc, "Wall Space for Inverter", la.wall_space_inverter, yPos);
        yPos = this.addField(doc, "Wall Space Inverter Notes", la.wall_space_inverter_notes, yPos);
        yPos = this.addField(doc, "Wall Space for Battery", la.wall_space_battery, yPos);
        yPos = this.addField(doc, "Wall Space Battery Notes", la.wall_space_battery_notes, yPos);
        yPos = this.addField(doc, "Loft Insulation Thickness", la.loft_insulation_thickness ? `${la.loft_insulation_thickness}mm` : '', yPos);
        yPos = this.addField(doc, "Loft Lighting", la.loft_lighting, yPos);
        yPos = this.addField(doc, "Loft Power Socket", la.loft_power_socket, yPos);
        yPos += 5;
      }

      // Electrical Supply
      if (fullSurvey.electrical_supply) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Electrical Supply", yPos);
        const es = fullSurvey.electrical_supply;
        yPos = this.addField(doc, "Supply Type", es.supply_type, yPos);
        yPos = this.addField(doc, "Main Fuse Rating", es.main_fuse_rating, yPos);
        yPos = this.addField(doc, "Consumer Unit Make", es.consumer_unit_make, yPos);
        yPos = this.addField(doc, "Consumer Unit Location", es.consumer_unit_location, yPos);
        yPos = this.addField(doc, "Spare Fuse Ways", es.spare_fuse_ways, yPos);
        yPos = this.addField(doc, "Existing Surge Protection", es.existing_surge_protection, yPos);
        yPos = this.addField(doc, "Earth Bonding Verified", es.earth_bonding_verified, yPos);
        yPos = this.addField(doc, "Earthing System Type", es.earthing_system_type, yPos);
        yPos = this.addField(doc, "Cable Route to Roof", es.cable_route_to_roof, yPos);
        yPos = this.addField(doc, "Cable Route to Battery", es.cable_route_to_battery, yPos);
        yPos = this.addField(doc, "DNO Notification Required", es.dno_notification_required ? 'Yes' : 'No', yPos);
        yPos = this.addField(doc, "EV Charger Installed", es.ev_charger_installed, yPos);
        yPos = this.addField(doc, "EV Charger Load", es.ev_charger_load ? `${es.ev_charger_load}kW` : '', yPos);
        yPos += 5;
      }

      // Battery Storage
      if (fullSurvey.battery_storage) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Battery Storage", yPos);
        const bs = fullSurvey.battery_storage;
        yPos = this.addField(doc, "Battery Required", bs.battery_required, yPos);
        yPos = this.addField(doc, "Preferred Install Location", bs.preferred_install_location, yPos);
        yPos = this.addField(doc, "Distance from CU", bs.distance_from_cu, yPos);
        yPos = this.addField(doc, "Mounting Surface", bs.mounting_surface, yPos);
        yPos = this.addField(doc, "Ventilation Adequate", bs.ventilation_adequate, yPos);
        yPos += 5;
      }

      // Health & Safety
      if (fullSurvey.health_safety) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Health & Safety", yPos);
        const hs = fullSurvey.health_safety;
        yPos = this.addField(doc, "Asbestos Presence", hs.asbestos_presence, yPos);
        yPos = this.addField(doc, "Working at Height Difficulties", hs.working_at_height_difficulties, yPos);
        yPos = this.addField(doc, "Fragile Roof Areas", hs.fragile_roof_areas, yPos);
        yPos = this.addField(doc, "Livestock/Pets on Site", hs.livestock_pets_on_site, yPos);
        yPos = this.addField(doc, "Livestock/Pets Notes", hs.livestock_pets_notes, yPos);
        yPos = this.addField(doc, "Special Access Instructions", hs.special_access_instructions, yPos);
        yPos += 5;
      }

      // Customer Preferences
      if (fullSurvey.customer_preferences) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Customer Preferences", yPos);
        const cp = fullSurvey.customer_preferences;
        yPos = this.addField(doc, "Preferred Contact Method", cp.preferred_contact_method, yPos);
        yPos = this.addField(doc, "Installation Start Date", cp.installation_start_date, yPos);
        yPos = this.addField(doc, "Installation End Date", cp.installation_end_date, yPos);
        yPos = this.addField(doc, "Customer Away", cp.customer_away ? 'Yes' : 'No', yPos);
        yPos = this.addField(doc, "Customer Away Notes", cp.customer_away_notes, yPos);
        yPos = this.addField(doc, "Budget Range", cp.budget_range, yPos);
        yPos = this.addField(doc, "Interested in EV Charger", cp.interested_in_ev_charger, yPos);
        yPos = this.addField(doc, "Interested in Energy Monitoring", cp.interested_in_energy_monitoring, yPos);
        yPos = this.addField(doc, "Additional Notes", cp.additional_notes, yPos);
        yPos += 5;
      }

      // General Images (not specific to roof faces)
      if (fullSurvey.assets && fullSurvey.assets.length > 0) {
        if (yPos > 150) {
          doc.addPage();
          yPos = 20;
        }
        yPos = this.addSection(doc, "Additional Images", yPos);
        
        for (const asset of fullSurvey.assets) {
          if (yPos > 200) {
            doc.addPage();
            yPos = 20;
          }
          yPos = await this.addImageToDoc(doc, asset, yPos);
        }
      }

      // Save the PDF
      const fileName = `solar-survey-${fullSurvey.customerName?.replace(/\s+/g, '-') || 'unnamed'}-${fullSurvey.surveyDate || 'undated'}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}