import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, TrendingUp, AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema, createArticleSchema } from "@/lib/seo-schemas";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

export default function FinancialProjections() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  
  const [initial, setInitial] = useState(() => {
    const saved = localStorage.getItem('financialProjectionsProgress');
    if (saved) {
      try { return JSON.parse(saved).initial || 50000; } catch { return 50000; }
    }
    return 50000;
  });
  const [monthly, setMonthly] = useState(() => {
    const saved = localStorage.getItem('financialProjectionsProgress');
    if (saved) {
      try { return JSON.parse(saved).monthly || 15000; } catch { return 15000; }
    }
    return 15000;
  });
  const [revenue, setRevenue] = useState(() => {
    const saved = localStorage.getItem('financialProjectionsProgress');
    if (saved) {
      try { return JSON.parse(saved).revenue || 5000; } catch { return 5000; }
    }
    return 5000;
  });
  const [savedDate, setSavedDate] = useState(() => localStorage.getItem('financialProjectionsDate') || "");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const triggerAutoSave = useCallback((newInitial: number, newMonthly: number, newRevenue: number) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem('financialProjectionsProgress', JSON.stringify({ 
        initial: newInitial, 
        monthly: newMonthly, 
        revenue: newRevenue 
      }));
      const date = new Date().toLocaleDateString();
      localStorage.setItem('financialProjectionsDate', date);
      setSavedDate(date);
      setShowAutoSave(true);
      setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const handleInitialChange = (value: number) => {
    setInitial(value);
    triggerAutoSave(value, monthly, revenue);
  };

  const handleMonthlyChange = (value: number) => {
    setMonthly(value);
    triggerAutoSave(initial, value, revenue);
  };

  const handleRevenueChange = (value: number) => {
    setRevenue(value);
    triggerAutoSave(initial, monthly, value);
  };

  const projections = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    cash: Math.max(0, initial - monthly * (i + 1) + revenue * (i + 1)),
    burn: monthly,
    income: revenue
  }));

  const finalCash = initial - monthly * 12 + revenue * 12;
  const runway = monthly > revenue ? Math.round(initial / (monthly - revenue)) : 999;
  const netMonthly = revenue - monthly;
  const breakEvenMonth = revenue > 0 ? Math.ceil(initial / revenue) : 999;
  
  const isViable = finalCash > 0;
  const hasBuffer = finalCash > 20000;
  const isPositive = netMonthly > 0;

  const saveProgress = () => {
    localStorage.setItem('financialProjectionsProgress', JSON.stringify({ initial, monthly, revenue }));
    localStorage.setItem('financialProjectionsDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('financialProjectionsProgress');
    if (saved) {
      const data = JSON.parse(saved);
      setInitial(data.initial);
      setMonthly(data.monthly);
      setRevenue(data.revenue);
      const date = localStorage.getItem('financialProjectionsDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const tips = [];
    if (runway < 6) tips.push("Runway below 6 months - secure additional funding immediately");
    if (netMonthly < 0) tips.push("Monthly burn exceeds revenue - focus on customer acquisition");
    if (initial < 50000) tips.push("Initial capital below £50k minimum - may not meet visa requirements");
    if (revenue < 5000) tips.push("Low monthly revenue - accelerate GTM strategy and sales");
    if (finalCash < 0) tips.push("Negative year-end cash - revise business model urgently");
    if (hasBuffer) tips.push("Strong cash buffer - well-positioned for visa approval");
    return tips.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Finalize 12-month financial projections with conservative assumptions", priority: "Critical" },
      { week: "Week 2", action: "Secure additional funding if runway < 12 months", priority: runway < 12 ? "Critical" : "High" },
      { week: "Week 3", action: "Prepare detailed P&L, balance sheet, and cash flow statements", priority: "High" },
      { week: "Week 4", action: "Review projections with accountant for visa compliance", priority: "Medium" }
    ];
  };

  const handleExportPdf = () => {
    const report = `FINANCIAL PROJECTIONS REPORT
Generated: ${new Date().toLocaleDateString()}
==================================================

INPUTS
------
Initial Capital: £${initial.toLocaleString()}
Monthly Burn: £${monthly.toLocaleString()}
Monthly Revenue: £${revenue.toLocaleString()}

KEY METRICS
-----------
Runway: ${runway} months
Net Monthly: £${netMonthly.toLocaleString()}
Year-End Cash: £${finalCash.toLocaleString()}
Status: ${isViable ? "VIABLE" : "CRITICAL"}

12-MONTH PROJECTIONS
-------------------
${projections.map(p => `Month ${p.month}: £${p.cash.toLocaleString()}`).join('\n')}

RECOMMENDATIONS
--------------
${getRecommendations().join('\n')}

ACTION PLAN
-----------
${generateActionPlan().map(a => `${a.week}: ${a.action} [${a.priority}]`).join('\n')}

© UK Innovator Founder Visa Assistant
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-projections-report.txt';
    a.click();
  };

  const handleExportWord = async () => {
    await generateWord({
      title: 'Financial Projections Report',
      subtitle: '12-Month Financial Projections for UK Innovator Founder Visa',
      filename: `financial-projections-report-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Input Parameters', level: 1 },
        { type: 'table', tableData: {
          headers: ['Parameter', 'Value'],
          rows: [
            ['Initial Capital', `£${initial.toLocaleString()}`],
            ['Monthly Burn', `£${monthly.toLocaleString()}`],
            ['Monthly Revenue', `£${revenue.toLocaleString()}`],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Key Metrics', level: 1 },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Runway', `${runway > 99 ? '∞' : runway} months`],
            ['Net Monthly', `£${Math.abs(netMonthly).toLocaleString()}`],
            ['Year-End Cash', `£${Math.abs(finalCash).toLocaleString()}`],
            ['Status', isViable ? 'VIABLE' : 'CRITICAL'],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: '12-Month Projections', level: 1 },
        { type: 'table', tableData: {
          headers: ['Month', 'Cash Balance'],
          rows: projections.map(p => [`Month ${p.month}`, `£${p.cash.toLocaleString()}`])
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Recommendations', level: 1 },
        { type: 'list', items: getRecommendations() },
        { type: 'divider' },
        { type: 'heading', content: 'Action Plan', level: 1 },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().map(a => [a.week, a.action, a.priority])
        }},
      ],
      metadata: {
        subject: 'Financial Projections for UK Innovator Founder Visa',
        keywords: ['financial projections', 'visa', 'innovation', 'UK'],
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const getSerializedState = () => {
    return { initial, monthly, revenue, savedDate };
  };

  useEffect(() => {
    const handoffKey = 'financial-projections_handoff';
    const handoffData = localStorage.getItem(handoffKey);

    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if ('initial' in payload) setInitial(payload.initial);
        if ('monthly' in payload) setMonthly(payload.monthly);
        if ('revenue' in payload) setRevenue(payload.revenue);
        if ('savedDate' in payload) setSavedDate(payload.savedDate);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      loadProgress();
    }
  }, []);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
    { name: "Financial Projections", url: "https://innovatorfoundervisaassistant.co.uk/tools/financial-projections" }
  ]);

  const articleSchema = createArticleSchema(
    "Financial Projections Tool for UK Innovator Founder Visa",
    "Create 12-month financial projections for your UK Innovator Founder Visa application. Calculate cash runway, burn rate, break-even point, and ensure GOV.UK compliance.",
    "2025-11-24"
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, articleSchema]
  };

  return (
    <>
      <SEOHead
        title="Financial Projections Tool | UK Innovator Founder Visa Compliance"
        description="Generate GOV.UK-compliant 12-month financial projections for your UK Innovator Founder Visa. Calculate cash runway, burn rate, profitability, and demonstrate viability criteria."
        canonical="https://innovatorfoundervisaassistant.co.uk/tools/financial-projections"
        keywords="financial projections UK visa, innovator visa financials, cash flow projections, business viability calculator, startup financial planning"
        schema={combinedSchema}
      />
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Financial Projections</h1>
          <p className="text-muted-foreground mb-6">12-month financial projections for UK visa compliance</p>

          <ToolUtilityBar
            toolId="financial-projections"
            toolName="Financial Projections"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Last saved: {savedDate}</AlertDescription>
            </Alert>
          )}

          {showRecommendations && (
            <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950/30">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Smart Recommendations
              </h3>
              <ul className="space-y-1">
                {getRecommendations().map((r, i) => (
                  <li key={i} className="text-sm">{r}</li>
                ))}
              </ul>
            </Card>
          )}

          {showActionPlan && (
            <Card className="p-4 mb-4 bg-green-50 dark:bg-green-950/30">
              <h3 className="font-bold mb-3">4-Week Action Plan</h3>
              <div className="space-y-2">
                {generateActionPlan().map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-bold text-sm min-w-[70px]">{item.week}</span>
                    <div className="flex-1">
                      <p className="text-sm">{item.action}</p>
                      <span className={`text-xs ${item.priority === 'Critical' ? 'text-red-600' : item.priority === 'High' ? 'text-orange-600' : 'text-blue-600'}`}>
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Input Parameters</h3>
              {showAutoSave && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Save className="h-3 w-3" />
                  <span>Saved</span>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="initial">Initial Capital (£)</Label>
                <Input
                  id="initial"
                  type="number"
                  value={initial}
                  onChange={e => handleInitialChange(Number(e.target.value))}
                  placeholder="50000"
                  data-testid="input-initial-capital"
                />
              </div>
              <div>
                <Label htmlFor="monthly">Monthly Burn (£)</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthly}
                  onChange={e => handleMonthlyChange(Number(e.target.value))}
                  placeholder="15000"
                  data-testid="input-monthly-burn"
                />
              </div>
              <div>
                <Label htmlFor="revenue">Monthly Revenue (£)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={revenue}
                  onChange={e => handleRevenueChange(Number(e.target.value))}
                  placeholder="5000"
                  data-testid="input-monthly-revenue"
                />
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Runway</p>
              <p className="text-3xl font-bold" data-testid="text-runway">
                {runway > 99 ? "∞" : runway}mo
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Net Monthly</p>
              <p className={`text-3xl font-bold ${netMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-monthly">
                £{Math.abs(netMonthly).toLocaleString()}
              </p>
            </Card>
            <Card className={finalCash > 0 ? "p-4 bg-green-50 dark:bg-green-950/30" : "p-4 bg-red-50 dark:bg-red-950/30"}>
              <p className="text-xs text-muted-foreground mb-1">Year-End Cash</p>
              <p className={`text-3xl font-bold ${finalCash > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`} data-testid="text-year-end-cash">
                £{Math.abs(finalCash).toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-bold flex items-center gap-2" data-testid="text-status">
                {isViable ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-red-600" />}
                {isViable ? "Viable" : "Critical"}
              </p>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">12-Month Cash Flow Projection</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Cash (£)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `£${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="cash" stroke="#ffa536" strokeWidth={3} name="Cash Balance" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">Monthly Burn vs Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projections.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${Number(value).toLocaleString()}`} />
                <Bar dataKey="burn" fill="#ef4444" name="Monthly Burn" />
                <Bar dataKey="income" fill="#22c55e" name="Monthly Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  );
}
