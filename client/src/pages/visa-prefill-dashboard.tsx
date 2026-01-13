import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { OISCDisclaimer } from "@/components/OISCDisclaimer";
import { ExportDocumentHeader, ExportOISCFooter } from "@/components/OISCDisclaimer";
import { SEOHead } from "@/components/SEOHead";
import { 
  User, Briefcase, GraduationCap, Building2, Wallet, TrendingUp, 
  Lightbulb, Scale, FileCheck, Download, CheckCircle2, AlertCircle,
  ChevronRight, Save, RefreshCw, FileText, Globe, Users, Target, Shield
} from "lucide-react";
import { FOUNDER_DATA, type FounderProfile, getFormattedFounderBio, getExecutiveSummary, getFinancialProjectionsSummary, getRequiredFounderInputs } from "@shared/founderData";
import { Link } from "wouter";

const VISA_SECTIONS = [
  { id: "personal", label: "Personal Details", icon: User, color: "text-blue-500" },
  { id: "education", label: "Education & Qualifications", icon: GraduationCap, color: "text-purple-500" },
  { id: "experience", label: "Professional Experience", icon: Briefcase, color: "text-green-500" },
  { id: "business", label: "Business Information", icon: Building2, color: "text-orange-500" },
  { id: "financial", label: "Financial Viability", icon: Wallet, color: "text-emerald-500" },
  { id: "market", label: "Market Analysis", icon: Globe, color: "text-cyan-500" },
  { id: "innovation", label: "Innovation & IP", icon: Lightbulb, color: "text-yellow-500" },
  { id: "scalability", label: "Scalability & Growth", icon: TrendingUp, color: "text-pink-500" },
  { id: "ukCommitment", label: "UK Commitment", icon: Target, color: "text-red-500" },
  { id: "visa", label: "Visa Specific", icon: FileCheck, color: "text-indigo-500" },
  { id: "evidence", label: "Evidence & References", icon: Users, color: "text-teal-500" },
];

function calculateSectionCompletion(sectionData: any): number {
  if (!sectionData || typeof sectionData !== "object") return 0;
  
  let filled = 0;
  let total = 0;

  const checkValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return value !== 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      return Object.values(value).some(v => checkValue(v));
    }
    return Boolean(value);
  };

  const traverse = (obj: any) => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        traverse(value);
      } else {
        total++;
        if (checkValue(value)) filled++;
      }
    }
  };

  traverse(sectionData);
  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

export default function VisaPrefillDashboard() {
  const { toast } = useToast();
  const [founderData, setFounderData] = useState<FounderProfile>(() => {
    const saved = localStorage.getItem("founderProfileData");
    if (saved) {
      try {
        return { ...FOUNDER_DATA, ...JSON.parse(saved) };
      } catch {
        return FOUNDER_DATA;
      }
    }
    return FOUNDER_DATA;
  });
  const [activeSection, setActiveSection] = useState("personal");
  const [isPrefillEnabled, setIsPrefillEnabled] = useState(() => {
    return localStorage.getItem("prefillEnabled") !== "false";
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem("founderProfileData", JSON.stringify(founderData));
    localStorage.setItem("prefillEnabled", String(isPrefillEnabled));
  }, [founderData, isPrefillEnabled]);

  const updateField = (path: string, value: any) => {
    setFounderData(prev => {
      const keys = path.split(".");
      const result = JSON.parse(JSON.stringify(prev));
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return result;
    });
  };

  const overallCompletion = Math.round(
    VISA_SECTIONS.reduce((acc, section) => {
      const sectionData = founderData[section.id as keyof FounderProfile];
      return acc + calculateSectionCompletion(sectionData);
    }, 0) / VISA_SECTIONS.length
  );

  const missingFields = getRequiredFounderInputs();

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("founderProfileData", JSON.stringify(founderData));
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Progress Saved",
        description: "Your visa application data has been saved successfully.",
      });
    }, 500);
  };

  const handleExportBio = () => {
    const header = ExportDocumentHeader(founderData.personal.fullName);
    const bio = getFormattedFounderBio();
    const footer = ExportOISCFooter();
    const content = header + bio + footer;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Founder_Biography_${founderData.personal.lastName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExecutiveSummary = () => {
    const header = ExportDocumentHeader(founderData.personal.fullName);
    const summary = getExecutiveSummary();
    const footer = ExportOISCFooter();
    const content = header + summary + footer;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Executive_Summary_${founderData.personal.lastName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFinancials = () => {
    const header = ExportDocumentHeader(founderData.personal.fullName);
    const financials = getFinancialProjectionsSummary();
    const footer = ExportOISCFooter();
    const content = header + financials + footer;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Financial_Projections_${founderData.personal.lastName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (as on passport)</Label>
          <Input 
            id="fullName"
            value={founderData.personal.fullName}
            onChange={(e) => updateField("personal.fullName", e.target.value)}
            placeholder="Full legal name"
            data-testid="input-fullname"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input 
            id="dateOfBirth"
            type="date"
            value={founderData.personal.dateOfBirth}
            onChange={(e) => updateField("personal.dateOfBirth", e.target.value)}
            data-testid="input-dob"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input 
            id="nationality"
            value={founderData.personal.nationality}
            onChange={(e) => updateField("personal.nationality", e.target.value)}
            placeholder="e.g., Nigerian"
            data-testid="input-nationality"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visaStatus">Current Visa Status</Label>
          <Input 
            id="visaStatus"
            value={founderData.personal.currentVisaStatus}
            onChange={(e) => updateField("personal.currentVisaStatus", e.target.value)}
            placeholder="e.g., Post-Study Work (PSW) Visa"
            data-testid="input-visa-status"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visaExpiry">Visa Expiry Date</Label>
          <Input 
            id="visaExpiry"
            type="date"
            value={founderData.personal.visaExpiryDate}
            onChange={(e) => updateField("personal.visaExpiryDate", e.target.value)}
            data-testid="input-visa-expiry"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ukEntry">UK Entry Date</Label>
          <Input 
            id="ukEntry"
            value={founderData.personal.ukEntryDate}
            onChange={(e) => updateField("personal.ukEntryDate", e.target.value)}
            placeholder="e.g., 28 September 2022"
            data-testid="input-uk-entry"
          />
        </div>
      </div>
      
      <Separator className="my-4" />
      <h4 className="font-medium">Contact Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Current Address</Label>
          <Input 
            id="address"
            value={founderData.personal.currentAddress}
            onChange={(e) => updateField("personal.currentAddress", e.target.value)}
            placeholder="Street address"
            data-testid="input-address"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city"
            value={founderData.personal.city}
            onChange={(e) => updateField("personal.city", e.target.value)}
            placeholder="e.g., Leeds"
            data-testid="input-city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input 
            id="postcode"
            value={founderData.personal.postcode}
            onChange={(e) => updateField("personal.postcode", e.target.value)}
            placeholder="e.g., LS4 2NT"
            data-testid="input-postcode"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email"
            type="email"
            value={founderData.personal.email}
            onChange={(e) => updateField("personal.email", e.target.value)}
            placeholder="your@email.com"
            data-testid="input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            value={founderData.personal.phone}
            onChange={(e) => updateField("personal.phone", e.target.value)}
            placeholder="+44 7xxx xxxxxx"
            data-testid="input-phone"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedIn">LinkedIn Profile</Label>
          <Input 
            id="linkedIn"
            value={founderData.personal.linkedIn}
            onChange={(e) => updateField("personal.linkedIn", e.target.value)}
            placeholder="https://linkedin.com/in/your-profile"
            data-testid="input-linkedin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Profile</Label>
          <Input 
            id="github"
            value={founderData.personal.github}
            onChange={(e) => updateField("personal.github", e.target.value)}
            placeholder="https://github.com/username"
            data-testid="input-github"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio Website</Label>
          <Input 
            id="portfolio"
            value={founderData.personal.portfolio}
            onChange={(e) => updateField("personal.portfolio", e.target.value)}
            placeholder="https://your-portfolio.com"
            data-testid="input-portfolio"
          />
        </div>
      </div>
    </div>
  );

  const renderFinancialSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="savings">Personal Savings Available (GBP)</Label>
          <Input 
            id="savings"
            type="number"
            value={founderData.financial.personalSavings}
            onChange={(e) => updateField("financial.personalSavings", parseInt(e.target.value) || 0)}
            placeholder="e.g., 8000"
            data-testid="input-savings"
          />
          <p className="text-xs text-muted-foreground">
            Minimum requirement: £1,270 (maintenance funds for 28 days)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="investment">Investment to Date (GBP)</Label>
          <Input 
            id="investment"
            type="number"
            value={founderData.financial.investmentToDate}
            onChange={(e) => updateField("financial.investmentToDate", parseInt(e.target.value) || 0)}
            placeholder="e.g., 1000"
            data-testid="input-investment"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyCosts">Monthly Operating Costs (GBP)</Label>
          <Input 
            id="monthlyCosts"
            type="number"
            value={founderData.financial.monthlyOperatingCosts}
            onChange={(e) => updateField("financial.monthlyOperatingCosts", parseInt(e.target.value) || 0)}
            placeholder="e.g., 5000"
            data-testid="input-monthly-costs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breakeven">Break-even Point</Label>
          <Input 
            id="breakeven"
            value={founderData.financial.breakEvenPoint}
            onChange={(e) => updateField("financial.breakEvenPoint", e.target.value)}
            placeholder="e.g., Month 6 (125 paying customers)"
            data-testid="input-breakeven"
          />
        </div>
      </div>

      <Separator className="my-4" />
      <h4 className="font-medium">Revenue Projections (3-Year)</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year1Revenue">Year 1 Revenue (GBP)</Label>
          <Input 
            id="year1Revenue"
            type="number"
            value={founderData.financial.year1Revenue}
            onChange={(e) => updateField("financial.year1Revenue", parseInt(e.target.value) || 0)}
            placeholder="e.g., 180000"
            data-testid="input-year1-revenue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year2Revenue">Year 2 Revenue (GBP)</Label>
          <Input 
            id="year2Revenue"
            type="number"
            value={founderData.financial.year2Revenue}
            onChange={(e) => updateField("financial.year2Revenue", parseInt(e.target.value) || 0)}
            placeholder="e.g., 600000"
            data-testid="input-year2-revenue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year3Revenue">Year 3 Revenue (GBP)</Label>
          <Input 
            id="year3Revenue"
            type="number"
            value={founderData.financial.year3Revenue}
            onChange={(e) => updateField("financial.year3Revenue", parseInt(e.target.value) || 0)}
            placeholder="e.g., 1200000"
            data-testid="input-year3-revenue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year1Costs">Year 1 Costs (GBP)</Label>
          <Input 
            id="year1Costs"
            type="number"
            value={founderData.financial.year1Costs}
            onChange={(e) => updateField("financial.year1Costs", parseInt(e.target.value) || 0)}
            placeholder="e.g., 146000"
            data-testid="input-year1-costs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year2Costs">Year 2 Costs (GBP)</Label>
          <Input 
            id="year2Costs"
            type="number"
            value={founderData.financial.year2Costs}
            onChange={(e) => updateField("financial.year2Costs", parseInt(e.target.value) || 0)}
            placeholder="e.g., 357000"
            data-testid="input-year2-costs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year3Costs">Year 3 Costs (GBP)</Label>
          <Input 
            id="year3Costs"
            type="number"
            value={founderData.financial.year3Costs}
            onChange={(e) => updateField("financial.year3Costs", parseInt(e.target.value) || 0)}
            placeholder="e.g., 699000"
            data-testid="input-year3-costs"
          />
        </div>
      </div>

      <Separator className="my-4" />
      <h4 className="font-medium">Funding Strategy</h4>
      <Textarea 
        value={founderData.financial.fundingStrategy}
        onChange={(e) => updateField("financial.fundingStrategy", e.target.value)}
        placeholder="Describe your funding strategy..."
        className="min-h-[100px]"
        data-testid="input-funding-strategy"
      />
    </div>
  );

  const renderVisaSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endorsingBody">Endorsing Body</Label>
          <Input 
            id="endorsingBody"
            value={founderData.visa.endorsingBody}
            onChange={(e) => updateField("visa.endorsingBody", e.target.value)}
            placeholder="e.g., Tech Nation"
            data-testid="input-endorsing-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maintenanceFunds">Maintenance Funds (GBP)</Label>
          <Input 
            id="maintenanceFunds"
            type="number"
            value={founderData.visa.maintenanceFunds}
            onChange={(e) => updateField("visa.maintenanceFunds", parseInt(e.target.value) || 0)}
            placeholder="Minimum £1,270"
            data-testid="input-maintenance-funds"
          />
          <p className="text-xs text-muted-foreground">
            Must hold £1,270 minimum for 28 consecutive days
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dependents">Number of Dependents</Label>
          <Input 
            id="dependents"
            type="number"
            value={founderData.visa.dependents}
            onChange={(e) => updateField("visa.dependents", parseInt(e.target.value) || 0)}
            placeholder="0"
            data-testid="input-dependents"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endorsingBodyReason">Why This Endorsing Body?</Label>
        <Textarea 
          id="endorsingBodyReason"
          value={founderData.visa.endorsingBodyReason}
          onChange={(e) => updateField("visa.endorsingBodyReason", e.target.value)}
          placeholder="Explain why you chose this endorsing body..."
          className="min-h-[100px]"
          data-testid="input-endorsing-reason"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="backupPlan">Backup Plan (if visa rejected)</Label>
        <Textarea 
          id="backupPlan"
          value={founderData.visa.backupPlan}
          onChange={(e) => updateField("visa.backupPlan", e.target.value)}
          placeholder="Describe your contingency plan..."
          className="min-h-[100px]"
          data-testid="input-backup-plan"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalCommitment">Personal Commitment Statement</Label>
        <Textarea 
          id="personalCommitment"
          value={founderData.visa.personalCommitment}
          onChange={(e) => updateField("visa.personalCommitment", e.target.value)}
          placeholder="Why is this business your calling? What sacrifices are you willing to make?"
          className="min-h-[100px]"
          data-testid="input-personal-commitment"
        />
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "personal":
        return renderPersonalSection();
      case "financial":
        return renderFinancialSection();
      case "visa":
        return renderVisaSection();
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Section editing coming soon. Use individual tools for detailed input.</p>
            <Link href="/tools-hub">
              <Button variant="outline" className="mt-4" data-testid="button-go-to-tools">
                Go to Tools Hub
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <>
      <SEOHead
        title="Visa Application Prefill Dashboard | UK Innovator Founder Visa Assistant"
        description="Prefill your Innovator Founder Visa application with verified data. 100% compliant, submission-ready documents."
        keywords="innovator founder visa application, visa prefill, uk visa application"
      />
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <OISCDisclaimer variant="full" className="mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-xl font-bold">Visa Application Prefill Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Complete your founder profile to prefill all visa application tools
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="prefill-toggle"
                checked={isPrefillEnabled}
                onCheckedChange={setIsPrefillEnabled}
                data-testid="switch-prefill-toggle"
              />
              <Label htmlFor="prefill-toggle" className="text-sm">
                Auto-prefill tools
              </Label>
            </div>
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-progress">
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Progress
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Overall Progress</CardTitle>
              <CardDescription>Your visa application readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xl font-bold">{overallCompletion}%</span>
                  <Progress value={overallCompletion} className="mt-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Section Progress</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {VISA_SECTIONS.map((section) => {
                        const sectionData = founderData[section.id as keyof FounderProfile];
                        const completion = calculateSectionCompletion(sectionData);
                        const Icon = section.icon;
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors hover:bg-accent ${
                              activeSection === section.id ? "bg-accent" : ""
                            }`}
                            data-testid={`button-section-${section.id}`}
                          >
                            <Icon className={`w-4 h-4 ${section.color}`} />
                            <span className="flex-1 text-sm truncate">{section.label}</span>
                            <Badge variant={completion === 100 ? "default" : "secondary"} className="text-xs">
                              {completion}%
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
                
                {missingFields.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Missing Information
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {missingFields.slice(0, 5).map((field, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-amber-500 rounded-full" />
                            {field}
                          </li>
                        ))}
                        {missingFields.length > 5 && (
                          <li className="text-amber-600">+{missingFields.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {VISA_SECTIONS.find(s => s.id === activeSection)?.icon && (
                    <div className={`p-2 rounded-lg bg-accent`}>
                      {(() => {
                        const section = VISA_SECTIONS.find(s => s.id === activeSection);
                        if (!section) return null;
                        const Icon = section.icon;
                        return <Icon className={`w-5 h-5 ${section.color}`} />;
                      })()}
                    </div>
                  )}
                  <div>
                    <CardTitle>
                      {VISA_SECTIONS.find(s => s.id === activeSection)?.label}
                    </CardTitle>
                    <CardDescription>
                      Edit your {activeSection} information
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  {calculateSectionCompletion(founderData[activeSection as keyof FounderProfile])}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {renderSectionContent()}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Submission-Ready Documents
            </CardTitle>
            <CardDescription>
              Download professionally formatted documents with OISC compliance disclaimers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={handleExportBio}
                className="h-auto py-4 flex flex-col items-center gap-2"
                data-testid="button-export-bio"
              >
                <User className="w-8 h-8 text-blue-500" />
                <span className="font-medium">Founder Biography</span>
                <span className="text-xs text-muted-foreground">Professional bio for endorsement</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportExecutiveSummary}
                className="h-auto py-4 flex flex-col items-center gap-2"
                data-testid="button-export-summary"
              >
                <FileText className="w-8 h-8 text-green-500" />
                <span className="font-medium">Executive Summary</span>
                <span className="text-xs text-muted-foreground">Business overview document</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportFinancials}
                className="h-auto py-4 flex flex-col items-center gap-2"
                data-testid="button-export-financials"
              >
                <Wallet className="w-8 h-8 text-emerald-500" />
                <span className="font-medium">Financial Projections</span>
                <span className="text-xs text-muted-foreground">3-year financial forecast</span>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                All exports include OISC compliance disclaimers and are formatted for submission without platform branding.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to Complete Your Application?</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the prefilled data in our 109+ professional tools
                  </p>
                </div>
              </div>
              <Link href="/tools-hub">
                <Button size="lg" data-testid="button-go-to-tools-cta">
                  Go to Tools Hub
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
