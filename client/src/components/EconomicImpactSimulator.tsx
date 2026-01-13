import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp,
  Users,
  PoundSterling,
  Building2,
  BarChart3,
  Sparkles,
  Download,
  RefreshCw,
  Target,
  Briefcase,
  GraduationCap,
  Globe,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

interface EconomicMetrics {
  directJobs: number;
  indirectJobs: number;
  totalJobs: number;
  gdpContribution: number;
  taxRevenue: number;
  exportPotential: number;
  innovationIndex: number;
  skillsTransfer: number;
  supplyChainImpact: number;
}

interface SimulationParams {
  initialInvestment: number;
  year1Revenue: number;
  year3Revenue: number;
  year5Revenue: number;
  directHires: number;
  averageSalary: number;
  isHighTech: boolean;
  hasExportPotential: boolean;
  isRnDIntensive: boolean;
}

const UK_ECONOMIC_MULTIPLIERS = {
  jobMultiplier: 2.5,
  gdpMultiplier: 1.8,
  taxRate: 0.25,
  vatRate: 0.20,
  niEmployerRate: 0.138,
  incomeTaxAvg: 0.25,
  highTechBonus: 1.3,
  exportBonus: 1.2,
  rndBonus: 1.4
};

export function EconomicImpactSimulator() {
  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 50000,
    year1Revenue: 100000,
    year3Revenue: 500000,
    year5Revenue: 2000000,
    directHires: 5,
    averageSalary: 35000,
    isHighTech: true,
    hasExportPotential: true,
    isRnDIntensive: false
  });

  const [metrics, setMetrics] = useState<EconomicMetrics>({
    directJobs: 0,
    indirectJobs: 0,
    totalJobs: 0,
    gdpContribution: 0,
    taxRevenue: 0,
    exportPotential: 0,
    innovationIndex: 0,
    skillsTransfer: 0,
    supplyChainImpact: 0
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [visaReadiness, setVisaReadiness] = useState(0);

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      let multiplier = 1;
      if (params.isHighTech) multiplier *= UK_ECONOMIC_MULTIPLIERS.highTechBonus;
      if (params.hasExportPotential) multiplier *= UK_ECONOMIC_MULTIPLIERS.exportBonus;
      if (params.isRnDIntensive) multiplier *= UK_ECONOMIC_MULTIPLIERS.rndBonus;

      const directJobs = params.directHires;
      const indirectJobs = Math.round(directJobs * UK_ECONOMIC_MULTIPLIERS.jobMultiplier);
      const totalJobs = directJobs + indirectJobs;

      const totalPayroll = params.directHires * params.averageSalary;
      const employerNI = totalPayroll * UK_ECONOMIC_MULTIPLIERS.niEmployerRate;
      const employeeIncomeTax = totalPayroll * UK_ECONOMIC_MULTIPLIERS.incomeTaxAvg;
      const corporationTax = params.year5Revenue * 0.15 * UK_ECONOMIC_MULTIPLIERS.taxRate;
      const vatContribution = params.year5Revenue * 0.1 * UK_ECONOMIC_MULTIPLIERS.vatRate;
      const taxRevenue = Math.round(employerNI + employeeIncomeTax + corporationTax + vatContribution);

      const gdpContribution = Math.round(params.year5Revenue * UK_ECONOMIC_MULTIPLIERS.gdpMultiplier * multiplier);

      const exportPotential = params.hasExportPotential ? Math.round(params.year5Revenue * 0.3) : 0;

      const innovationIndex = Math.min(100, Math.round(
        (params.isHighTech ? 30 : 0) +
        (params.isRnDIntensive ? 25 : 0) +
        (params.hasExportPotential ? 15 : 0) +
        Math.min(30, params.year5Revenue / 100000)
      ));

      const skillsTransfer = Math.min(100, Math.round(
        (params.directHires * 5) +
        (params.isHighTech ? 20 : 0) +
        (params.averageSalary > 40000 ? 15 : 0)
      ));

      const supplyChainImpact = Math.round(params.year5Revenue * 0.4);

      setMetrics({
        directJobs,
        indirectJobs,
        totalJobs,
        gdpContribution,
        taxRevenue,
        exportPotential,
        innovationIndex,
        skillsTransfer,
        supplyChainImpact
      });

      let readiness = 0;
      if (directJobs >= 5) readiness += 25;
      else if (directJobs >= 2) readiness += 15;
      
      if (params.averageSalary >= 25000) readiness += 20;
      else if (params.averageSalary >= 20000) readiness += 10;
      
      if (innovationIndex >= 60) readiness += 25;
      else if (innovationIndex >= 40) readiness += 15;
      
      if (gdpContribution >= 1000000) readiness += 20;
      else if (gdpContribution >= 500000) readiness += 10;
      
      if (taxRevenue >= 50000) readiness += 10;

      setVisaReadiness(Math.min(100, readiness));
      setIsSimulating(false);
    }, 1500);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`;
    }
    return `£${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">UK Economic Impact Simulator</h2>
            <p className="text-muted-foreground">
              Calculate your business's contribution to the UK economy
            </p>
          </div>
          <div className="ml-auto">
            <Badge className={`text-lg px-4 py-2 ${
              visaReadiness >= 80 ? 'bg-green-500' : 
              visaReadiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              <Award className="h-4 w-4 mr-2" />
              Visa Readiness: {visaReadiness}%
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Simulation Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Initial Investment</Label>
                <div className="flex items-center gap-2">
                  <PoundSterling className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={params.initialInvestment}
                    onChange={(e) => setParams(p => ({ ...p, initialInvestment: parseInt(e.target.value) || 0 }))}
                    data-testid="input-initial-investment"
                  />
                </div>
              </div>

              <div>
                <Label>Year 1 Revenue Projection</Label>
                <Input
                  type="number"
                  value={params.year1Revenue}
                  onChange={(e) => setParams(p => ({ ...p, year1Revenue: parseInt(e.target.value) || 0 }))}
                  data-testid="input-year1-revenue"
                />
              </div>

              <div>
                <Label>Year 3 Revenue Projection</Label>
                <Input
                  type="number"
                  value={params.year3Revenue}
                  onChange={(e) => setParams(p => ({ ...p, year3Revenue: parseInt(e.target.value) || 0 }))}
                  data-testid="input-year3-revenue"
                />
              </div>

              <div>
                <Label>Year 5 Revenue Projection</Label>
                <Input
                  type="number"
                  value={params.year5Revenue}
                  onChange={(e) => setParams(p => ({ ...p, year5Revenue: parseInt(e.target.value) || 0 }))}
                  data-testid="input-year5-revenue"
                />
              </div>

              <div>
                <Label>Direct Hires (UK Jobs Created)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[params.directHires]}
                    onValueChange={(value) => setParams(p => ({ ...p, directHires: value[0] }))}
                    max={50}
                    min={1}
                    step={1}
                    className="flex-1"
                    data-testid="slider-direct-hires"
                  />
                  <Badge variant="outline" className="min-w-[50px] justify-center">
                    {params.directHires}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Average Salary (£)</Label>
                <Input
                  type="number"
                  value={params.averageSalary}
                  onChange={(e) => setParams(p => ({ ...p, averageSalary: parseInt(e.target.value) || 0 }))}
                  data-testid="input-average-salary"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="highTech"
                    checked={params.isHighTech}
                    onChange={(e) => setParams(p => ({ ...p, isHighTech: e.target.checked }))}
                    className="rounded"
                    data-testid="checkbox-high-tech"
                  />
                  <Label htmlFor="highTech" className="cursor-pointer">High-Tech/Innovation Sector</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="export"
                    checked={params.hasExportPotential}
                    onChange={(e) => setParams(p => ({ ...p, hasExportPotential: e.target.checked }))}
                    className="rounded"
                    data-testid="checkbox-export"
                  />
                  <Label htmlFor="export" className="cursor-pointer">Export Potential</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rnd"
                    checked={params.isRnDIntensive}
                    onChange={(e) => setParams(p => ({ ...p, isRnDIntensive: e.target.checked }))}
                    className="rounded"
                    data-testid="checkbox-rnd"
                  />
                  <Label htmlFor="rnd" className="cursor-pointer">R&D Intensive</Label>
                </div>
              </div>

              <Button 
                onClick={runSimulation} 
                className="w-full"
                disabled={isSimulating}
                data-testid="button-run-simulation"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Total UK Jobs Created</span>
                </div>
                <p className="text-xl font-bold">{metrics.totalJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.directJobs} direct + {metrics.indirectJobs} indirect
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">GDP Contribution</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(metrics.gdpContribution)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Projected 5-year impact
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <PoundSterling className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Annual Tax Revenue</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(metrics.taxRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Corp tax + NI + PAYE + VAT
                </p>
              </Card>
            </motion.div>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Economic Impact Breakdown
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    Innovation Index
                  </span>
                  <span className="font-medium">{metrics.innovationIndex}/100</span>
                </div>
                <Progress value={metrics.innovationIndex} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    Skills Transfer Impact
                  </span>
                  <span className="font-medium">{metrics.skillsTransfer}/100</span>
                </div>
                <Progress value={metrics.skillsTransfer} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    Export Potential
                  </span>
                  <span className="font-medium">{formatCurrency(metrics.exportPotential)}</span>
                </div>
                <Progress value={Math.min(100, (metrics.exportPotential / 500000) * 100)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    Supply Chain Impact
                  </span>
                  <span className="font-medium">{formatCurrency(metrics.supplyChainImpact)}</span>
                </div>
                <Progress value={Math.min(100, (metrics.supplyChainImpact / 1000000) * 100)} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              ILR Job Creation Requirements
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${
                metrics.directJobs >= 5 && params.averageSalary >= 25000 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-muted/50 border-border'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Option A: 5 Jobs at £25K+</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Create 5+ jobs with salaries of £25,000 or above
                </p>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min(100, (metrics.directJobs / 5) * 100)} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm font-medium">
                    {metrics.directJobs >= 5 && params.averageSalary >= 25000 ? '✓' : `${metrics.directJobs}/5`}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                metrics.directJobs >= 10 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-muted/50 border-border'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Option B: 10 Jobs (Any Salary)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Create 10+ jobs at any salary level
                </p>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.min(100, (metrics.directJobs / 10) * 100)} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm font-medium">
                    {metrics.directJobs >= 10 ? '✓' : `${metrics.directJobs}/10`}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" data-testid="button-download-report">
              <Download className="h-4 w-4 mr-2" />
              Download Economic Impact Report
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500" data-testid="button-add-to-plan">
              <Target className="h-4 w-4 mr-2" />
              Add to Business Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EconomicImpactSimulator;
