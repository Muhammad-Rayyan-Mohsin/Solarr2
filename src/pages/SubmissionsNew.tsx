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
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Download, FileText, ArrowLeft, Trash2 } from "lucide-react";
import { PDFService } from "@/services/pdfService";

export default function SubmissionsNew() {
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
    navigate(`/survey?survey=${survey.id}`);
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

  const handleViewDetails = async (survey: any) => {
    try {
      const fullSurvey = await SupabaseService.getFullSurvey(survey.id);
      console.log("Full survey data:", fullSurvey);
      toast({
        title: "Survey Details Loaded",
        description: "Check console for full survey data including images",
      });
    } catch (error) {
      console.error("Failed to load full survey:", error);
      toast({
        title: "Error",
        description: "Failed to load survey details",
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

  const generateCSV = async (survey: any) => {
    try {
      const fullSurvey = await SupabaseService.getFullSurvey(survey.id);

      const fmt = (v: any) => (v === null || v === undefined ? '' : `${v}`);
      const yn = (v: any) => (v === true ? 'Yes' : v === false ? 'No' : fmt(v));
      const join = (arr?: any[]) => (Array.isArray(arr) ? arr.join(' | ') : fmt(arr));
      const json = (obj: any) => (obj ? JSON.stringify(obj) : '');

      const fields: Array<[string, any]> = [
        // Basic info
        ['Survey ID', fullSurvey.id],
        ['Survey Date', fullSurvey.surveyDate],
        ['Status', fullSurvey.status],
        ['Customer Name', fullSurvey.customerName],
        ['Site Address', fullSurvey.siteAddress],
        ['Postcode', fullSurvey.postcode],
        ['Grid Reference', fullSurvey.gridReference],
        ['What3Words', fullSurvey.what3words],
        ['Phone', fullSurvey.phone],
        ['Email', fullSurvey.email],
        ['Secondary Contact Name', fullSurvey.secondaryContactName],
        ['Secondary Contact Phone', fullSurvey.secondaryContactPhone],

        // Surveyor info
        ['Surveyor Name', fullSurvey.surveyorInfo?.name],
        ['Surveyor Phone', fullSurvey.surveyorInfo?.telephone],
        ['Surveyor Email', fullSurvey.surveyorInfo?.email],

        // Electricity baseline
        ['Annual Consumption', fullSurvey.electricity_baseline?.annual_consumption],
        ['MPAN Number', fullSurvey.electricity_baseline?.mpan_number],
        ['Electricity Provider', fullSurvey.electricity_baseline?.electricity_provider],
        ['Network Operator', fullSurvey.electricity_baseline?.network_operator],
        ['Customer Permission Granted', yn(fullSurvey.electricity_baseline?.customer_permission_granted)],
        ['Daytime Import Rate', fullSurvey.electricity_baseline?.daytime_import_rate],
        ['Nighttime Import Rate', fullSurvey.electricity_baseline?.nighttime_import_rate],
        ['Standing Charge', fullSurvey.electricity_baseline?.standing_charge],
        ['Tariff Type', fullSurvey.electricity_baseline?.tariff_type],
        ['Smart Meter Present', fullSurvey.electricity_baseline?.smart_meter_present],
        ['SEG Tariff Available', fullSurvey.electricity_baseline?.seg_tariff_available],
        ['SEG Tariff Explanation', fullSurvey.electricity_baseline?.seg_tariff_explanation],
        ['Smart Tariff Available', fullSurvey.electricity_baseline?.smart_tariff_available],

        // Property overview
        ['Property Type', fullSurvey.property_overview?.property_type],
        ['Property Age', fullSurvey.property_overview?.property_age],
        ['Listed Building', fullSurvey.property_overview?.listed_building],
        ['Conservation Area', fullSurvey.property_overview?.conservation_area],
        ['New Build', fullSurvey.property_overview?.new_build],
        ['Shared Roof', fullSurvey.property_overview?.shared_roof],
        ['Scaffold Access', fullSurvey.property_overview?.scaffold_access],
        ['Storage Area', fullSurvey.property_overview?.storage_area],
        ['Restricted Parking', fullSurvey.property_overview?.restricted_parking],

        // Loft/Attic
        ['Loft Hatch Width', fullSurvey.loft_attic?.loft_hatch_width],
        ['Loft Hatch Height', fullSurvey.loft_attic?.loft_hatch_height],
        ['Loft Access Type', fullSurvey.loft_attic?.loft_access_type],
        ['Loft Headroom', fullSurvey.loft_attic?.loft_headroom],
        ['Loft Boards In Place', fullSurvey.loft_attic?.loft_boards_in_place],
        ['Roof Timber Condition', fullSurvey.loft_attic?.roof_timber_condition],
        ['Roof Timber Notes', fullSurvey.loft_attic?.roof_timber_notes],
        ['Wall Space Inverter', fullSurvey.loft_attic?.wall_space_inverter],
        ['Wall Space Inverter Notes', fullSurvey.loft_attic?.wall_space_inverter_notes],
        ['Wall Space Battery', fullSurvey.loft_attic?.wall_space_battery],
        ['Wall Space Battery Notes', fullSurvey.loft_attic?.wall_space_battery_notes],
        ['Loft Insulation Thickness', fullSurvey.loft_attic?.loft_insulation_thickness],
        ['Loft Lighting', fullSurvey.loft_attic?.loft_lighting],
        ['Loft Power Socket', fullSurvey.loft_attic?.loft_power_socket],

        // Electrical supply
        ['Supply Type', fullSurvey.electrical_supply?.supply_type],
        ['Main Fuse Rating', fullSurvey.electrical_supply?.main_fuse_rating],
        ['Consumer Unit Make', fullSurvey.electrical_supply?.consumer_unit_make],
        ['Consumer Unit Location', fullSurvey.electrical_supply?.consumer_unit_location],
        ['Spare Fuse Ways', fullSurvey.electrical_supply?.spare_fuse_ways],
        ['Existing Surge Protection', fullSurvey.electrical_supply?.existing_surge_protection],
        ['Earth Bonding Verified', fullSurvey.electrical_supply?.earth_bonding_verified],
        ['Earthing System Type', fullSurvey.electrical_supply?.earthing_system_type],
        ['Cable Route to Roof', join(fullSurvey.electrical_supply?.cable_route_to_roof)],
        ['Cable Route to Battery', join(fullSurvey.electrical_supply?.cable_route_to_battery)],
        ['DNO Notification Required', yn(fullSurvey.electrical_supply?.dno_notification_required)],
        ['EV Charger Installed', fullSurvey.electrical_supply?.ev_charger_installed],
        ['EV Charger Load', fullSurvey.electrical_supply?.ev_charger_load],

        // Battery storage
        ['Battery Required', fullSurvey.battery_storage?.battery_required],
        ['Preferred Install Location', fullSurvey.battery_storage?.preferred_install_location],
        ['Distance from CU', fullSurvey.battery_storage?.distance_from_cu],
        ['Mounting Surface', fullSurvey.battery_storage?.mounting_surface],
        ['Ventilation Adequate', fullSurvey.battery_storage?.ventilation_adequate],
        ['Fire Egress Compliance', fullSurvey.battery_storage?.fire_egress_compliance],
        ['Ambient Temp Min', fullSurvey.battery_storage?.ambient_temp_min],
        ['Ambient Temp Max', fullSurvey.battery_storage?.ambient_temp_max],
        ['IP Rating Required', fullSurvey.battery_storage?.ip_rating_required],

        // Health & safety
        ['Asbestos Presence', fullSurvey.health_safety?.asbestos_presence],
        ['Working at Height Difficulties', fullSurvey.health_safety?.working_at_height_difficulties],
        ['Fragile Roof Areas', join(fullSurvey.health_safety?.fragile_roof_areas)],
        ['Livestock/Pets On Site', fullSurvey.health_safety?.livestock_pets_on_site],
        ['Livestock/Pets Notes', fullSurvey.health_safety?.livestock_pets_notes],
        ['Special Access Instructions', fullSurvey.health_safety?.special_access_instructions],

        // Customer preferences
        ['Preferred Contact Method', fullSurvey.customer_preferences?.preferred_contact_method],
        ['Installation Start Date', fullSurvey.customer_preferences?.installation_start_date],
        ['Installation End Date', fullSurvey.customer_preferences?.installation_end_date],
        ['Customer Away', yn(fullSurvey.customer_preferences?.customer_away)],
        ['Customer Away Notes', fullSurvey.customer_preferences?.customer_away_notes],
        ['Budget Range', fullSurvey.customer_preferences?.budget_range],
        ['Interested in EV Charger', fullSurvey.customer_preferences?.interested_in_ev_charger],
        ['Interested in Energy Monitoring', fullSurvey.customer_preferences?.interested_in_energy_monitoring],
        ['Additional Notes', fullSurvey.customer_preferences?.additional_notes],

        // Roof faces (as JSON) and counts
        ['Number of Roof Faces', (fullSurvey.roof_faces?.length || 0)],
        ['Roof Faces JSON', json(fullSurvey.roof_faces)],

        // Assets
        ['Number of Assets', (fullSurvey.assets?.length || 0)],
        ['Asset Paths', join((fullSurvey.assets || []).map((a: any) => a.storagePath))],
      ];

      const csvContent = fields
        .map(([label, value]) => `${label},"${fmt(value).replace(/"/g, '""')}"`)
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-complete-${survey.id || 'unknown'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'CSV Downloaded',
        description: 'Complete survey data has been exported to CSV',
      });
    } catch (error) {
      console.error('Failed to generate CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate CSV file',
        variant: 'destructive',
      });
    }
  };

  const generatePDF = async (survey: any) => {
    try {
      await PDFService.generateComprehensivePDF(survey.id);
      toast({
        title: "PDF Downloaded",
        description: "Comprehensive survey report with images has been generated",
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SurveyHeader 
        customerName="Survey Submissions"
        currentStep={1}
        totalSteps={1}
        completedSteps={[]}
        isOnline={navigator.onLine}
        isDarkMode={false}
        onThemeToggle={() => {}}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/survey")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Survey
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Survey Submissions
          </h1>
          <p className="text-muted-foreground">
            View and manage all submitted surveys
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading surveys...</p>
            </div>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No surveys found</p>
            <Button onClick={() => navigate("/survey")}>
              Create New Survey
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>MPAN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      {survey.survey_date ? new Date(survey.survey_date).toLocaleDateString() : "No date"}
                    </TableCell>
                    <TableCell>
                      {survey.customer_name || "Unnamed Customer"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{survey.site_address || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          {survey.postcode || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {survey.mpan_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        survey.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : survey.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.status || 'draft'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(survey)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(survey)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateCSV(survey)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          CSV Export
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => generatePDF(survey)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          PDF Report
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(survey)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
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