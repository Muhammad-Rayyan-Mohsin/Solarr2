import { useState, useEffect } from "react";
import { SupabaseService } from "@/services/supabaseService";
import { Button } from "@/components/ui/button";
import { SurveyHeader } from "@/components/SurveyHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Survey } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

export default function Submissions() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (survey: any) => {
    if (!survey.id) {
      toast({
        title: "Error",
        description: "Survey ID not found",
        variant: "destructive",
      });
      return;
    }
    // Redirect to edit page with survey ID
    navigate(`/?survey=${survey.id}`);
  };

  const handleDelete = async (survey: any) => {
    if (!survey.id) {
      toast({
        title: "Error",
        description: "Survey ID not found",
        variant: "destructive",
      });
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the survey for ${survey.customer_name}? This action cannot be undone and will remove all data including images.`
    );

    if (!confirmed) return;

    try {
      // Call the delete service
      await SupabaseService.deleteSurvey(survey.id);
      
      // Refresh the surveys list
      await loadSurveys();
      
      toast({
        title: "Survey Deleted",
        description: "Survey and all associated data have been permanently deleted.",
      });
    } catch (error) {
      console.error("Failed to delete survey:", error);
      toast({
        title: "Error",
        description: "Failed to delete survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await SupabaseService.listSurveys();
      setSurveys(data);
    } catch (error) {
      console.error("Failed to load surveys:", error);
      toast({
        title: "Error",
        description: "Failed to load surveys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  const generateCSV = (survey: any) => {
    try {
      const fields = [
        ["Survey Date", survey.survey_date],
        ["Customer Name", survey.customer_name],
        ["Site Address", survey.site_address],
        ["Postcode", survey.postcode],
        ["Grid Reference", survey.grid_reference],
        ["Phone", survey.phone],
        ["Email", survey.email],
        ["Secondary Contact Name", survey.secondary_contact_name],
        ["Secondary Contact Phone", survey.secondary_contact_phone],
        ["Electricity Usage", survey.current_electricity_usage],
        ["MPAN Number", survey.mpan_number],
        ["Electricity Supplier", survey.current_electricity_supplier],
        ["Network Operator", survey.network_operator],
        ["Permission Granted", survey.customer_permission_granted],
        ["Daytime Import Rate", survey.daytime_import_rate],
        ["Nighttime Import Rate", survey.nighttime_import_rate],
        ["Standing Charge", survey.standing_charge],
        ["Tariff Type", survey.current_electricity_tariff],
        ["Smart Meter Present", survey.smart_meter_present],
        ["Export Tariff Available", survey.export_tariff_available],
        ["Property Type", survey.property_type],
        ["Property Age", survey.property_age],
        ["Listed Building", survey.listed_building],
        ["Conservation Area", survey.conservation_area],
        ["New Build", survey.new_build],
        ["Shared Roof", survey.shared_roof],
        ["Scaffold Access", survey.scaffold_access],
        ["Storage Area", survey.storage_area],
        ["Restricted Parking", survey.restricted_parking],
        ["Loft Hatch Width", survey.loft_hatch_width],
        ["Loft Hatch Height", survey.loft_hatch_height],
        ["Loft Access Quality", survey.loft_access_quality],
        ["Loft Headroom", survey.loft_headroom],
        ["Roof Timber Condition", survey.roof_timber_condition],
        ["Wall Space Inverter", survey.wall_space_inverter],
        ["Wall Space Battery", survey.wall_space_battery],
        ["Loft Insulation Thickness", survey.loft_insulation_thickness],
        ["Loft Lighting", survey.loft_lighting],
        ["Loft Power Socket", survey.loft_power_socket],
        ["Electrical Supply Type", survey.electrical_supply_type],
        ["Main Fuse Rating", survey.main_fuse_rating],
        ["Consumer Unit Make", survey.consumer_unit_make],
        ["Consumer Unit Location", survey.consumer_unit_location],
        ["Spare Fuse Ways", survey.spare_fuse_ways],
        ["Existing Surge Protection", survey.existing_surge_protection],
        ["Earth Bonding Verified", survey.earth_bonding_verified],
        ["Earthing System", survey.earthing_system],
        ["DNO Notification Required", survey.dno_notification_required],
        ["EV Charger Installed", survey.ev_charger_installed],
        ["EV Charger Load", survey.ev_charger_load],
        ["Battery Required", survey.battery_required],
        ["Install Location", survey.install_location],
        ["Distance from CU", survey.distance_from_cu],
        ["Mounting Surface", survey.mounting_surface],
        ["Ventilation Adequate", survey.ventilation_adequate],
        ["Fire Egress Compliance", survey.fire_egress_compliance],
        ["Temperature Range Min", survey.temperature_range_min],
        ["Temperature Range Max", survey.temperature_range_max],
        ["IP Rating", survey.ip_rating],
        ["Asbestos Presence", survey.asbestos_presence],
        [
          "Working at Height Difficulties",
          survey.working_at_height_difficulties,
        ],
        ["Livestock/Pets", survey.livestock_pets],
        ["Livestock/Pets Notes", survey.livestock_pets_notes],
        ["Special Access Instructions", survey.special_access_instructions],
        ["Contact Method", survey.contact_method],
        ["Installation Start Date", survey.installation_start_date],
        ["Installation End Date", survey.installation_end_date],
        ["Customer Away", survey.customer_away],
        ["Customer Away Notes", survey.customer_away_notes],
        ["Budget Range", survey.budget_range],
        ["Interested in EV Charger", survey.interested_in_ev_charger],
        [
          "Interested in Energy Monitoring",
          survey.interested_in_energy_monitoring,
        ],
        ["Additional Notes", survey.additional_notes],
        ["Status", survey.status],
      ];

      const csvContent = fields
        .map(([label, value]) => `"${label}","${value || "N/A"}"`)
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `solar-survey-${survey.customer_name?.replace(
        /\s+/g,
        "-"
      )}-${survey.survey_date}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: "Success",
        description: "CSV generated successfully",
      });
    } catch (error) {
      console.error("Failed to generate CSV:", error);
      toast({
        title: "Error",
        description: "Failed to generate CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async (survey: Survey) => {
    try {
      const doc = new jsPDF();
      const lineHeight = 10;
      let yPos = 20;

      // Add title
      doc.setFontSize(20);
      doc.text("Solar Survey Report", 20, yPos);
      yPos += lineHeight * 2;

      // Add basic info
      doc.setFontSize(12);
      doc.text(`Survey Date: ${survey.survey_date || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Customer: ${survey.customer_name || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Site Address: ${survey.site_address || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Postcode: ${survey.postcode || "N/A"}`, 20, yPos);
      yPos += lineHeight * 2;

      // Add electricity details
      doc.setFontSize(16);
      doc.text("Electricity Details", 20, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      doc.text(
        `Supplier: ${survey.current_electricity_supplier || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(
        `Tariff: ${survey.current_electricity_tariff || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(
        `Usage: ${survey.current_electricity_usage || "N/A"} kWh/year`,
        20,
        yPos
      );
      yPos += lineHeight * 2;

      // Add property details
      doc.setFontSize(16);
      doc.text("Property Details", 20, yPos);
      yPos += lineHeight;
      doc.setFontSize(12);
      doc.text(`Type: ${survey.property_type || "N/A"}`, 20, yPos);
      yPos += lineHeight;
      doc.text(
        `Supply Type: ${survey.electrical_supply_type || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(
        `Battery Required: ${survey.battery_required ? "Yes" : "No"}`,
        20,
        yPos
      );
      yPos += lineHeight;
      doc.text(
        `Install Location: ${survey.install_location || "N/A"}`,
        20,
        yPos
      );
      yPos += lineHeight * 2;

      // Add notes
      if (survey.additional_notes) {
        doc.setFontSize(16);
        doc.text("Additional Notes", 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        const notes = doc.splitTextToSize(survey.additional_notes, 170);
        doc.text(notes, 20, yPos);
      }

      // Save the PDF
      const fileName = `solar-survey-${survey.customer_name?.replace(
        /\s+/g,
        "-"
      )}-${survey.survey_date}.pdf`;
      doc.save(fileName);

      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">Loading surveys...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SurveyHeader
        customerName=""
        currentStep={1}
        totalSteps={1}
        completedSteps={[]}
        isOnline={true}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        backTo="/"
        backTooltip="Back to Home"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Submitted Surveys</h1>
          <Button onClick={() => (window.location.href = "/")}>
            New Survey
          </Button>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No surveys found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>{survey.survey_date || "No date"}</TableCell>
                    <TableCell>
                      {survey.customer_name || "Unnamed Customer"}
                    </TableCell>
                    <TableCell>
                      {survey.site_address || "N/A"}
                      <br />
                      <span className="text-sm text-gray-500">
                        {survey.postcode || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{survey.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => generateCSV(survey)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Export CSV
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(survey)}
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(survey)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
