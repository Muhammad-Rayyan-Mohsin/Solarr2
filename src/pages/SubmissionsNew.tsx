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
import { Eye, Edit, Download, FileText, ArrowLeft } from "lucide-react";

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

  const generateCSV = (survey: any) => {
    try {
      // Only use fields available in surveys_list view
      const fields = [
        ["Survey Date", survey.survey_date],
        ["Customer Name", survey.customer_name],
        ["Site Address", survey.site_address],
        ["Postcode", survey.postcode],
        ["MPAN Number", survey.mpan_number],
        ["Status", survey.status],
        ["Created At", survey.created_at],
      ];

      const csvContent = fields
        .map(([label, value]) => `${label},"${value || ""}"`)
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-${survey.id || "unknown"}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV Downloaded",
        description: "Survey data has been exported to CSV",
      });
    } catch (error) {
      console.error("Failed to generate CSV:", error);
      toast({
        title: "Error",
        description: "Failed to generate CSV file",
        variant: "destructive",
      });
    }
  };

  const generateFullCSV = async (survey: any) => {
    try {
      const fullSurvey = await SupabaseService.getFullSurvey(survey.id);
      
      // Create comprehensive CSV with all survey data
      const fields = [
        // Basic info
        ["Survey ID", fullSurvey.id],
        ["Survey Date", fullSurvey.surveyDate],
        ["Status", fullSurvey.status],
        ["Customer Name", fullSurvey.customerName],
        ["Site Address", fullSurvey.siteAddress],
        ["Postcode", fullSurvey.postcode],
        ["Phone", fullSurvey.phone],
        ["Email", fullSurvey.email],
        
        // Surveyor info
        ["Surveyor Name", fullSurvey.surveyorInfo?.name],
        ["Surveyor Phone", fullSurvey.surveyorInfo?.telephone],
        ["Surveyor Email", fullSurvey.surveyorInfo?.email],
        
        // Electricity baseline
        ["Annual Consumption", fullSurvey.electricity_baseline?.annual_consumption],
        ["MPAN Number", fullSurvey.electricity_baseline?.mpan_number],
        ["Electricity Provider", fullSurvey.electricity_baseline?.electricity_provider],
        ["Network Operator", fullSurvey.electricity_baseline?.network_operator],
        ["Daytime Import Rate", fullSurvey.electricity_baseline?.daytime_import_rate],
        ["Nighttime Import Rate", fullSurvey.electricity_baseline?.nighttime_import_rate],
        ["Standing Charge", fullSurvey.electricity_baseline?.standing_charge],
        ["Tariff Type", fullSurvey.electricity_baseline?.tariff_type],
        ["Smart Meter Present", fullSurvey.electricity_baseline?.smart_meter_present],
        ["SEG Tariff Available", fullSurvey.electricity_baseline?.seg_tariff_available],
        ["Smart Tariff Available", fullSurvey.electricity_baseline?.smart_tariff_available],
        
        // Property overview
        ["Property Type", fullSurvey.property_overview?.property_type],
        ["Property Age", fullSurvey.property_overview?.property_age],
        ["Listed Building", fullSurvey.property_overview?.listed_building],
        ["Conservation Area", fullSurvey.property_overview?.conservation_area],
        ["New Build", fullSurvey.property_overview?.new_build],
        ["Shared Roof", fullSurvey.property_overview?.shared_roof],
        ["Scaffold Access", fullSurvey.property_overview?.scaffold_access],
        ["Storage Area", fullSurvey.property_overview?.storage_area],
        ["Restricted Parking", fullSurvey.property_overview?.restricted_parking],
        
        // Roof faces count
        ["Number of Roof Faces", fullSurvey.roof_faces?.length || 0],
        
        // Customer preferences
        ["Preferred Contact Method", fullSurvey.customer_preferences?.preferred_contact_method],
        ["Installation Start Date", fullSurvey.customer_preferences?.installation_start_date],
        ["Installation End Date", fullSurvey.customer_preferences?.installation_end_date],
        ["Budget Range", fullSurvey.customer_preferences?.budget_range],
        ["Interested in EV Charger", fullSurvey.customer_preferences?.interested_in_ev_charger],
        ["Interested in Energy Monitoring", fullSurvey.customer_preferences?.interested_in_energy_monitoring],
        ["Additional Notes", fullSurvey.customer_preferences?.additional_notes],
        
        // Assets count
        ["Number of Assets", fullSurvey.assets?.length || 0],
      ];

      const csvContent = fields
        .map(([label, value]) => `${label},"${value || ""}"`)
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-full-${survey.id || "unknown"}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Full CSV Downloaded",
        description: "Complete survey data has been exported to CSV",
      });
    } catch (error) {
      console.error("Failed to generate full CSV:", error);
      toast({
        title: "Error",
        description: "Failed to generate full CSV file",
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
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
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
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No surveys found
            </h3>
            <p className="text-muted-foreground mb-4">
              No surveys have been submitted yet.
            </p>
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
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateFullCSV(survey)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Full CSV
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
