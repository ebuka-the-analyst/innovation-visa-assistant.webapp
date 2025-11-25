import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// GOV.UK 2025 Tax Rates and Allowances
const TAX_RATES = {
  corporationTax: 0.19,
  vatStandard: 0.20,
  vatReduced: 0.05,
  dividendBasicRate: 0.0875,
  dividendHigherRate: 0.3375,
  dividendAdditionalRate: 0.3935,
  dividendAllowance: 500,
  capitalGainsTax: 0.20,
  capitalGainsAllowance: 3000,
  employerNI: 0.138,
  employerNIThreshold: 9100,
  employeeNI: 0.12,
  employeeNIThreshold: 12570,
  incomeTaxBasicRate: 0.20,
  incomeTaxHigherRate: 0.40,
  incomeTaxAdditionalRate: 0.45,
  personalAllowance: 12570,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
};

const SEIS_RELIEF = {
  maxInvestment: 250000,
  incomeTaxRelief: 0.50,
  capitalGainsReinvestmentRelief: 0.50,
};

const EIS_RELIEF = {
  maxInvestment: 1000000,
  incomeTaxRelief: 0.30,
};

type TaxScenario = {
  name: string;
  structure: string;
  annualRevenue: number;
  annualCosts: number;
  salaries: number;
  dividends: number;
  capitalGains: number;
  vatRegistered: boolean;
  seisEisInvestment: number;
};

export default function TaxPlanning() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedDate, setSavedDate] = useState('');

  // Tax scenario inputs
  const [annualRevenue, setAnnualRevenue] = useState(250000);
  const [annualCosts, setAnnualCosts] = useState(100000);
  const [salaries, setSalaries] = useState(50000);
  const [dividends, setDividends] = useState(30000);
  const [capitalGains, setCapitalGains] = useState(0);
  const [vatRegistered, setVatRegistered] = useState(true);
  const [seisEisInvestment, setSeisEisInvestment] = useState(0);
  const [structure, setStructure] = useState<'limited' | 'sole-trader'>('limited');

  // Calculate tax liabilities
  const calculateTaxes = () => {
    const profit = annualRevenue - annualCosts;
    
    // Corporation Tax (Limited Company only)
    const corporationTax = structure === 'limited' 
      ? Math.max(0, profit - salaries) * TAX_RATES.corporationTax 
      : 0;

    // VAT
    const vatOnSales = vatRegistered ? annualRevenue * TAX_RATES.vatStandard : 0;
    const vatOnPurchases = vatRegistered ? annualCosts * TAX_RATES.vatStandard : 0;
    const netVAT = vatOnSales - vatOnPurchases;

    // Employer NI
    const employerNI = Math.max(0, salaries - TAX_RATES.employerNIThreshold) * TAX_RATES.employerNI;

    // Employee NI (on salaries)
    const employeeNI = Math.max(0, salaries - TAX_RATES.employeeNIThreshold) * TAX_RATES.employeeNI;

    // Income Tax on Salaries
    const taxableIncome = Math.max(0, salaries - TAX_RATES.personalAllowance);
    let incomeTax = 0;
    if (taxableIncome <= TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance) {
      incomeTax = taxableIncome * TAX_RATES.incomeTaxBasicRate;
    } else if (taxableIncome <= TAX_RATES.higherRateLimit - TAX_RATES.personalAllowance) {
      const basicPortion = TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance;
      const higherPortion = taxableIncome - basicPortion;
      incomeTax = basicPortion * TAX_RATES.incomeTaxBasicRate + higherPortion * TAX_RATES.incomeTaxHigherRate;
    } else {
      const basicPortion = TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance;
      const higherPortion = TAX_RATES.higherRateLimit - TAX_RATES.basicRateLimit;
      const additionalPortion = taxableIncome - (TAX_RATES.higherRateLimit - TAX_RATES.personalAllowance);
      incomeTax = basicPortion * TAX_RATES.incomeTaxBasicRate + 
                  higherPortion * TAX_RATES.incomeTaxHigherRate + 
                  additionalPortion * TAX_RATES.incomeTaxAdditionalRate;
    }

    // Dividend Tax
    const taxableDividends = Math.max(0, dividends - TAX_RATES.dividendAllowance);
    let dividendTax = 0;
    const incomeWithDividends = taxableIncome + taxableDividends;
    if (incomeWithDividends <= TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance) {
      dividendTax = taxableDividends * TAX_RATES.dividendBasicRate;
    } else if (incomeWithDividends <= TAX_RATES.higherRateLimit - TAX_RATES.personalAllowance) {
      const basicDividendPortion = Math.min(taxableDividends, 
        TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance - taxableIncome);
      const higherDividendPortion = taxableDividends - basicDividendPortion;
      dividendTax = basicDividendPortion * TAX_RATES.dividendBasicRate + 
                    higherDividendPortion * TAX_RATES.dividendHigherRate;
    } else {
      const basicDividendPortion = Math.max(0, 
        Math.min(taxableDividends, TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance - taxableIncome));
      const higherDividendPortion = Math.max(0, 
        Math.min(taxableDividends - basicDividendPortion, 
          TAX_RATES.higherRateLimit - TAX_RATES.basicRateLimit));
      const additionalDividendPortion = Math.max(0, 
        taxableDividends - basicDividendPortion - higherDividendPortion);
      dividendTax = basicDividendPortion * TAX_RATES.dividendBasicRate + 
                    higherDividendPortion * TAX_RATES.dividendHigherRate +
                    additionalDividendPortion * TAX_RATES.dividendAdditionalRate;
    }

    // Capital Gains Tax
    const taxableCapitalGains = Math.max(0, capitalGains - TAX_RATES.capitalGainsAllowance);
    const capitalGainsTax = taxableCapitalGains * TAX_RATES.capitalGainsTax;

    // SEIS/EIS Relief
    const seisReliefAmount = Math.min(seisEisInvestment, SEIS_RELIEF.maxInvestment) * SEIS_RELIEF.incomeTaxRelief;
    const eisReliefAmount = seisEisInvestment > SEIS_RELIEF.maxInvestment 
      ? Math.min(seisEisInvestment - SEIS_RELIEF.maxInvestment, EIS_RELIEF.maxInvestment) * EIS_RELIEF.incomeTaxRelief 
      : 0;
    const totalTaxRelief = seisReliefAmount + eisReliefAmount;

    const totalTax = corporationTax + netVAT + employerNI + employeeNI + 
                     incomeTax + dividendTax + capitalGainsTax - totalTaxRelief;

    const effectiveRate = annualRevenue > 0 ? (totalTax / annualRevenue) * 100 : 0;

    return {
      corporationTax,
      netVAT,
      employerNI,
      employeeNI,
      incomeTax,
      dividendTax,
      capitalGainsTax,
      totalTaxRelief,
      totalTax,
      effectiveRate,
      netProfit: profit - totalTax,
    };
  };

  const taxes = calculateTaxes();

  // Quarterly estimates
  const quarterlyData = [
    { quarter: 'Q1', tax: taxes.totalTax / 4, vat: taxes.netVAT / 4, paye: (taxes.incomeTax + taxes.employeeNI) / 4 },
    { quarter: 'Q2', tax: taxes.totalTax / 4, vat: taxes.netVAT / 4, paye: (taxes.incomeTax + taxes.employeeNI) / 4 },
    { quarter: 'Q3', tax: taxes.totalTax / 4, vat: taxes.netVAT / 4, paye: (taxes.incomeTax + taxes.employeeNI) / 4 },
    { quarter: 'Q4', tax: taxes.totalTax / 4, vat: taxes.netVAT / 4, paye: (taxes.incomeTax + taxes.employeeNI) / 4 },
  ];

  // Tax breakdown for pie chart
  const taxBreakdown = [
    { name: 'Corporation Tax', value: taxes.corporationTax, color: '#3b82f6' },
    { name: 'VAT (Net)', value: Math.max(0, taxes.netVAT), color: '#10b981' },
    { name: 'Employer NI', value: taxes.employerNI, color: '#f59e0b' },
    { name: 'Employee NI', value: taxes.employeeNI, color: '#8b5cf6' },
    { name: 'Income Tax', value: taxes.incomeTax, color: '#ec4899' },
    { name: 'Dividend Tax', value: taxes.dividendTax, color: '#06b6d4' },
    { name: 'Capital Gains Tax', value: taxes.capitalGainsTax, color: '#f97316' },
  ].filter(item => item.value > 0);

  // Cash flow impact over 12 months
  const cashFlowData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthlyRevenue = annualRevenue / 12;
    const monthlyCosts = annualCosts / 12;
    const monthlyTax = taxes.totalTax / 12;
    const netCashFlow = monthlyRevenue - monthlyCosts - monthlyTax;
    const cumulativeCash = netCashFlow * (i + 1);
    
    return {
      month: `M${month}`,
      revenue: monthlyRevenue,
      costs: monthlyCosts,
      tax: monthlyTax,
      netCash: netCashFlow,
      cumulative: cumulativeCash,
    };
  });

  // Tax scenarios comparison
  const scenariosData = [
    {
      name: 'Low Salary\nHigh Dividend',
      salary: 12570,
      dividend: 50000,
      tax: calculateScenarioTax(12570, 50000),
    },
    {
      name: 'Balanced',
      salary: 30000,
      dividend: 30000,
      tax: calculateScenarioTax(30000, 30000),
    },
    {
      name: 'High Salary\nLow Dividend',
      salary: 50000,
      dividend: 12570,
      tax: calculateScenarioTax(50000, 12570),
    },
  ];

  function calculateScenarioTax(salary: number, dividend: number) {
    const profit = annualRevenue - annualCosts;
    const corpTax = structure === 'limited' ? Math.max(0, profit - salary) * TAX_RATES.corporationTax : 0;
    const empNI = Math.max(0, salary - TAX_RATES.employerNIThreshold) * TAX_RATES.employerNI;
    const eeNI = Math.max(0, salary - TAX_RATES.employeeNIThreshold) * TAX_RATES.employeeNI;
    
    const taxableIncome = Math.max(0, salary - TAX_RATES.personalAllowance);
    let incTax = 0;
    if (taxableIncome <= TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance) {
      incTax = taxableIncome * TAX_RATES.incomeTaxBasicRate;
    } else {
      const basicPortion = TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance;
      const higherPortion = taxableIncome - basicPortion;
      incTax = basicPortion * TAX_RATES.incomeTaxBasicRate + higherPortion * TAX_RATES.incomeTaxHigherRate;
    }

    const taxableDividends = Math.max(0, dividend - TAX_RATES.dividendAllowance);
    let divTax = 0;
    if (taxableIncome + taxableDividends <= TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance) {
      divTax = taxableDividends * TAX_RATES.dividendBasicRate;
    } else {
      const basicDivPortion = Math.max(0, 
        Math.min(taxableDividends, TAX_RATES.basicRateLimit - TAX_RATES.personalAllowance - taxableIncome));
      const higherDivPortion = taxableDividends - basicDivPortion;
      divTax = basicDivPortion * TAX_RATES.dividendBasicRate + higherDivPortion * TAX_RATES.dividendHigherRate;
    }

    return corpTax + empNI + eeNI + incTax + divTax;
  }

  const getSerializedState = () => {
    return {
      annualRevenue,
      annualCosts,
      salaries,
      dividends,
      capitalGains,
      vatRegistered,
      seisEisInvestment,
      structure,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB'),
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('annualRevenue' in state) setAnnualRevenue(state.annualRevenue);
    if ('annualCosts' in state) setAnnualCosts(state.annualCosts);
    if ('salaries' in state) setSalaries(state.salaries);
    if ('dividends' in state) setDividends(state.dividends);
    if ('capitalGains' in state) setCapitalGains(state.capitalGains);
    if ('vatRegistered' in state) setVatRegistered(state.vatRegistered);
    if ('seisEisInvestment' in state) setSeisEisInvestment(state.seisEisInvestment);
    if ('structure' in state) setStructure(state.structure);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('tax-planning-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('tax-planning-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('tax-planning-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (structure === 'limited' && salaries < TAX_RATES.personalAllowance) {
      tips.push("Consider paying yourself at least the personal allowance (£12,570) as salary to maximize tax-free income and build NI credits for state pension");
    }
    
    if (structure === 'limited' && salaries > 50000 && dividends > 20000) {
      tips.push("High salary reduces dividend tax efficiency. Consider lowering salary to £50,270 and increasing dividends for potential tax savings");
    }
    
    if (taxes.effectiveRate > 35) {
      tips.push("Effective tax rate exceeds 35%. Review expense claims, R&D tax credits, and tax-efficient structures to reduce liability");
    }
    
    if (annualRevenue > 85000 && !vatRegistered) {
      tips.push("VAT registration is mandatory above £85,000 turnover. Register now to avoid penalties and potential backdated VAT charges");
    }
    
    if (seisEisInvestment === 0 && structure === 'limited') {
      tips.push("SEIS/EIS investments offer 50%/30% income tax relief plus additional CGT benefits. Consider for startup funding while reducing personal tax");
    }
    
    if (taxes.corporationTax > 20000) {
      tips.push("Significant corporation tax liability. Explore capital allowances, R&D tax credits (up to 27% for SMEs), and pension contributions to reduce");
    }
    
    if (dividends > 0 && taxes.dividendTax > 5000) {
      tips.push("Dividend tax exceeds £5,000. Consider timing dividends across tax years or using ISA/pension contributions to shield income");
    }
    
    if (capitalGains > 0 && capitalGains < TAX_RATES.capitalGainsAllowance * 2) {
      tips.push("Utilize your annual CGT allowance (£3,000). Consider timing asset disposals across tax years to maximize tax-free gains");
    }

    if (taxes.employerNI > 10000) {
      tips.push("High employer NI burden. Consider pension contributions (employer NI exempt) or benefits-in-kind strategies to optimize compensation structure");
    }

    if (structure === 'sole-trader' && annualRevenue > 100000) {
      tips.push("As a sole trader with £100k+ revenue, incorporating as a limited company could save significant tax through dividend income and corporation tax efficiency");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Review GOV.UK guidance on Corporation Tax (CT600 filing), VAT (MTD compliance), and PAYE obligations for 2025/26 tax year", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Set up quarterly tax calendar: VAT returns (if registered), PAYE submissions, Corporation Tax payment dates", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Register for Making Tax Digital (MTD) for VAT if applicable, and set up compatible accounting software (Xero, QuickBooks, FreeAgent)", 
        priority: "High" 
      },
      { 
        week: "Week 2-3", 
        action: "Review all eligible business expenses and capital allowances. Ensure receipts and invoices are digitally organized for HMRC compliance", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Calculate optimal salary/dividend split for directors. Run scenarios to minimize combined tax (Corporation Tax + Income Tax + NI + Dividend Tax)", 
        priority: "Critical" 
      },
      { 
        week: "Week 3-4", 
        action: "Explore R&D tax credit eligibility (up to 27% SME scheme) and prepare technical narratives for qualifying development activities", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Review SEIS/EIS investment opportunities for income tax relief. Ensure certificates are obtained for 50%/30% tax relief claims", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Book consultation with qualified UK tax advisor or accountant to review structure and confirm compliance with current HMRC regulations", 
        priority: "High" 
      },
    ];
  };

  const handleExport = () => {
    const report = `UK STARTUP TAX PLANNING & COMPLIANCE REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

BUSINESS STRUCTURE & FINANCIAL OVERVIEW
${'-'.repeat(80)}
Business Structure: ${structure === 'limited' ? 'Limited Company' : 'Sole Trader'}
Annual Revenue: £${annualRevenue.toLocaleString()}
Annual Costs: £${annualCosts.toLocaleString()}
Gross Profit: £${(annualRevenue - annualCosts).toLocaleString()}
Salaries/Drawings: £${salaries.toLocaleString()}
Dividends (Ltd Co): £${dividends.toLocaleString()}
Capital Gains: £${capitalGains.toLocaleString()}
VAT Registered: ${vatRegistered ? 'YES' : 'NO'}
SEIS/EIS Investment: £${seisEisInvestment.toLocaleString()}

TAX LIABILITY BREAKDOWN (2025/26 TAX YEAR)
${'-'.repeat(80)}
Corporation Tax (19%): £${taxes.corporationTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Net VAT Payable: £${Math.max(0, taxes.netVAT).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Employer National Insurance (13.8%): £${taxes.employerNI.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Employee National Insurance (12%): £${taxes.employeeNI.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Income Tax (PAYE): £${taxes.incomeTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Dividend Tax: £${taxes.dividendTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Capital Gains Tax (20%): £${taxes.capitalGainsTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
${'-'.repeat(80)}
SEIS/EIS Tax Relief: -£${taxes.totalTaxRelief.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
${'-'.repeat(80)}
TOTAL TAX LIABILITY: £${taxes.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Effective Tax Rate: ${taxes.effectiveRate.toFixed(2)}%
Net Profit After Tax: £${taxes.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}

QUARTERLY TAX ESTIMATES
${'-'.repeat(80)}
${quarterlyData.map((q, i) => `${q.quarter}: Total £${q.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} | VAT £${q.vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} | PAYE/NI £${q.paye.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`).join('\n')}

2025/26 TAX RATES & ALLOWANCES APPLIED
${'-'.repeat(80)}
Corporation Tax Rate: 19%
VAT Standard Rate: 20%
Income Tax Personal Allowance: £${TAX_RATES.personalAllowance.toLocaleString()}
Income Tax Basic Rate: 20% (up to £${TAX_RATES.basicRateLimit.toLocaleString()})
Income Tax Higher Rate: 40% (£${TAX_RATES.basicRateLimit.toLocaleString()} - £${TAX_RATES.higherRateLimit.toLocaleString()})
Income Tax Additional Rate: 45% (above £${TAX_RATES.higherRateLimit.toLocaleString()})
Dividend Allowance: £${TAX_RATES.dividendAllowance.toLocaleString()}
Dividend Basic Rate: 8.75%
Dividend Higher Rate: 33.75%
Dividend Additional Rate: 39.35%
Capital Gains Tax Allowance: £${TAX_RATES.capitalGainsAllowance.toLocaleString()}
Capital Gains Tax Rate: 20%
Employer NI: 13.8% (above £${TAX_RATES.employerNIThreshold.toLocaleString()})
Employee NI: 12% (above £${TAX_RATES.employeeNIThreshold.toLocaleString()})

SEIS/EIS RELIEF STRUCTURE
${'-'.repeat(80)}
SEIS Max Investment: £${SEIS_RELIEF.maxInvestment.toLocaleString()}
SEIS Income Tax Relief: 50%
SEIS CGT Reinvestment Relief: 50%
EIS Max Investment: £${EIS_RELIEF.maxInvestment.toLocaleString()}
EIS Income Tax Relief: 30%

TAX-EFFICIENT STRUCTURE RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK TAX COMPLIANCE ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}:\n${item.action}\n`).join('\n')}

SALARY VS DIVIDEND SCENARIOS (TAX COMPARISON)
${'-'.repeat(80)}
Low Salary (£12,570) / High Dividend (£50,000): Total Tax £${scenariosData[0].tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Balanced (£30,000 / £30,000): Total Tax £${scenariosData[1].tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
High Salary (£50,000) / Low Dividend (£12,570): Total Tax £${scenariosData[2].tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}

IMPORTANT COMPLIANCE NOTES
${'-'.repeat(80)}
- Corporation Tax is due 9 months and 1 day after accounting period end
- VAT returns are quarterly (or monthly if opted in) - MTD mandatory
- PAYE/NI must be paid monthly via Real Time Information (RTI) submissions
- Self Assessment deadline: 31 January following tax year end
- Maintain digital records for minimum 6 years (HMRC audit requirement)
- Consider quarterly tax provisions to avoid cash flow strain at year-end
- R&D tax credits available at 27% for SMEs on qualifying development costs
- Annual Investment Allowance (AIA) offers 100% capital allowance up to £1m
- Employer NI Employment Allowance: £5,000 per year for eligible companies

PROFESSIONAL RECOMMENDATIONS
${'-'.repeat(80)}
This report provides indicative tax calculations based on 2025/26 GOV.UK published 
rates. Tax laws are complex and individual circumstances vary significantly.

STRONGLY RECOMMENDED:
1. Engage a qualified UK Chartered Accountant or tax advisor for formal tax planning
2. Verify all calculations with HMRC guidance at gov.uk/topic/business-tax
3. Consider tax-efficient pension contributions (employer contributions are tax-free)
4. Review capital allowances and R&D tax credit eligibility annually
5. Maintain comprehensive expense records and VAT invoices for full tax relief

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
Tax Planning Tool - © 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This tool provides estimates for educational purposes. It does not 
constitute professional tax advice. Always consult with a qualified tax professional 
for personalized guidance and HMRC compliance verification.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uk-tax-planning-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-tax-planning">UK Tax Planning</h1>
            <p className="text-lg text-muted-foreground">Calculate annual tax liability, quarterly estimates, and tax-efficient structures for UK startups</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="tax-planning"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Tax Planning"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-tax-planning">
              <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Liability Summary</CardTitle>
                  <CardDescription>2025/26 Tax Year - GOV.UK Rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Tax Liability</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-tax">£{taxes.totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Effective Tax Rate</p>
                          <p className="text-3xl font-bold" data-testid="text-effective-rate">{taxes.effectiveRate.toFixed(2)}%</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-net-profit">£{taxes.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Tax Relief</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-tax-relief">£{taxes.totalTaxRelief.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Business Details</h3>
                      
                      <div>
                        <Label htmlFor="structure">Business Structure</Label>
                        <select
                          id="structure"
                          value={structure}
                          onChange={(e) => setStructure(e.target.value as 'limited' | 'sole-trader')}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          data-testid="select-structure"
                        >
                          <option value="limited">Limited Company</option>
                          <option value="sole-trader">Sole Trader</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="annual-revenue">Annual Revenue (£)</Label>
                        <Input
                          id="annual-revenue"
                          type="number"
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(parseFloat(e.target.value) || 0)}
                          data-testid="input-annual-revenue"
                        />
                      </div>

                      <div>
                        <Label htmlFor="annual-costs">Annual Costs (£)</Label>
                        <Input
                          id="annual-costs"
                          type="number"
                          value={annualCosts}
                          onChange={(e) => setAnnualCosts(parseFloat(e.target.value) || 0)}
                          data-testid="input-annual-costs"
                        />
                      </div>

                      <div>
                        <Label htmlFor="salaries">Salaries/Director Pay (£)</Label>
                        <Input
                          id="salaries"
                          type="number"
                          value={salaries}
                          onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)}
                          data-testid="input-salaries"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Income & Relief</h3>
                      
                      <div>
                        <Label htmlFor="dividends">Dividends (Ltd Co) (£)</Label>
                        <Input
                          id="dividends"
                          type="number"
                          value={dividends}
                          onChange={(e) => setDividends(parseFloat(e.target.value) || 0)}
                          disabled={structure === 'sole-trader'}
                          data-testid="input-dividends"
                        />
                      </div>

                      <div>
                        <Label htmlFor="capital-gains">Capital Gains (£)</Label>
                        <Input
                          id="capital-gains"
                          type="number"
                          value={capitalGains}
                          onChange={(e) => setCapitalGains(parseFloat(e.target.value) || 0)}
                          data-testid="input-capital-gains"
                        />
                      </div>

                      <div>
                        <Label htmlFor="seis-eis">SEIS/EIS Investment (£)</Label>
                        <Input
                          id="seis-eis"
                          type="number"
                          value={seisEisInvestment}
                          onChange={(e) => setSeisEisInvestment(parseFloat(e.target.value) || 0)}
                          data-testid="input-seis-eis"
                        />
                        <p className="text-xs text-muted-foreground mt-1">50% relief (SEIS up to £250k), 30% relief (EIS up to £1m)</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="vat-registered"
                          type="checkbox"
                          checked={vatRegistered}
                          onChange={(e) => setVatRegistered(e.target.checked)}
                          className="h-4 w-4"
                          data-testid="checkbox-vat-registered"
                        />
                        <Label htmlFor="vat-registered" className="cursor-pointer">VAT Registered (mandatory if revenue £85k+)</Label>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Calculations use 2025/26 GOV.UK tax rates: Corporation Tax 19%, VAT 20%, Personal Allowance £12,570, NI thresholds £9,100 (employer) / £12,570 (employee)
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Tax Breakdown</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {structure === 'limited' && (
                        <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                          <span>Corporation Tax (19%)</span>
                          <span className="font-semibold" data-testid="text-corporation-tax">£{taxes.corporationTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      )}
                      {vatRegistered && (
                        <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                          <span>Net VAT Payable</span>
                          <span className="font-semibold" data-testid="text-vat">£{Math.max(0, taxes.netVAT).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                        <span>Employer NI (13.8%)</span>
                        <span className="font-semibold" data-testid="text-employer-ni">£{taxes.employerNI.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                        <span>Employee NI (12%)</span>
                        <span className="font-semibold" data-testid="text-employee-ni">£{taxes.employeeNI.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                        <span>Income Tax (PAYE)</span>
                        <span className="font-semibold" data-testid="text-income-tax">£{taxes.incomeTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      {structure === 'limited' && dividends > 0 && (
                        <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                          <span>Dividend Tax</span>
                          <span className="font-semibold" data-testid="text-dividend-tax">£{taxes.dividendTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      )}
                      {capitalGains > 0 && (
                        <div className="flex justify-between p-3 bg-accent/10 rounded-lg">
                          <span>Capital Gains Tax (20%)</span>
                          <span className="font-semibold" data-testid="text-cgt">£{taxes.capitalGainsTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Tax Estimates</CardTitle>
                  <CardDescription>Plan your cash flow with quarterly tax provisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {quarterlyData.map((q, index) => (
                      <Card key={index} className="bg-accent/5">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold" data-testid={`text-quarter-${index}`}>{q.quarter}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Tax</span>
                                <span className="font-medium">£{q.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">VAT</span>
                                <span className="font-medium">£{q.vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">PAYE/NI</span>
                                <span className="font-medium">£{q.paye.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Breakdown</CardTitle>
                    <CardDescription>Distribution of tax liabilities by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {taxBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={taxBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                          >
                            {taxBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Enter business details to see tax breakdown</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Salary vs Dividend Scenarios</CardTitle>
                    <CardDescription>Tax comparison for different compensation structures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {structure === 'limited' ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scenariosData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                          <Legend />
                          <Bar dataKey="tax" fill="#3b82f6" name="Total Tax" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <p>Only applicable to Limited Companies</p>
                        <p className="text-sm mt-2">Change structure to "Limited Company" to see scenarios</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>12-Month Cash Flow Impact</CardTitle>
                  <CardDescription>Net cash flow after tax obligations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
                      <Line type="monotone" dataKey="tax" stroke="#f59e0b" strokeWidth={2} name="Tax" />
                      <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={3} name="Cumulative Cash" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2025/26 Tax Rates & Allowances</CardTitle>
                  <CardDescription>GOV.UK published rates for current tax year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Corporation & Business Tax</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Corporation Tax</span>
                          <Badge variant="secondary">19%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VAT Standard Rate</span>
                          <Badge variant="secondary">20%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VAT Threshold</span>
                          <span className="font-medium">£85,000</span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm pt-4">National Insurance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employer NI</span>
                          <Badge variant="secondary">13.8%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employer NI Threshold</span>
                          <span className="font-medium">£9,100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employee NI</span>
                          <Badge variant="secondary">12%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employee NI Threshold</span>
                          <span className="font-medium">£12,570</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Income Tax</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Personal Allowance</span>
                          <span className="font-medium">£12,570</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Basic Rate (20%)</span>
                          <span className="font-medium">up to £50,270</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Higher Rate (40%)</span>
                          <span className="font-medium">£50,271 - £125,140</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Additional Rate (45%)</span>
                          <span className="font-medium">above £125,140</span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm pt-4">Dividend & Capital Gains</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Allowance</span>
                          <span className="font-medium">£500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Basic Rate</span>
                          <Badge variant="secondary">8.75%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Higher Rate</span>
                          <Badge variant="secondary">33.75%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Additional Rate</span>
                          <Badge variant="secondary">39.35%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CGT Allowance</span>
                          <span className="font-medium">£3,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CGT Rate</span>
                          <Badge variant="secondary">20%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEIS/EIS Tax Relief Structure</CardTitle>
                  <CardDescription>Startup investment tax incentives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">SEIS (Seed Enterprise Investment Scheme)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maximum Investment</span>
                          <span className="font-medium">£250,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Income Tax Relief</span>
                          <Badge variant="secondary">50%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CGT Reinvestment Relief</span>
                          <Badge variant="secondary">50%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Tax Relief</span>
                          <span className="font-medium text-green-600 dark:text-green-400">£125,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">EIS (Enterprise Investment Scheme)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maximum Investment</span>
                          <span className="font-medium">£1,000,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Income Tax Relief</span>
                          <Badge variant="secondary">30%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CGT Exemption</span>
                          <Badge variant="secondary">100% (if held 3+ years)</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Tax Relief</span>
                          <span className="font-medium text-green-600 dark:text-green-400">£300,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart Tax Planning Recommendations
                  </CardTitle>
                  <CardDescription>Context-aware guidance based on your tax profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Tax Efficiency Strategies</CardTitle>
                  <CardDescription>Advanced planning for UK startups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">R&D Tax Credits (SME Scheme)</p>
                        <p className="text-sm text-muted-foreground">Claim up to 27% tax relief on qualifying research and development costs. Includes software development, product innovation, and technical problem-solving</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Capital Allowances (AIA)</p>
                        <p className="text-sm text-muted-foreground">Annual Investment Allowance provides 100% tax relief on qualifying capital expenditure up to £1 million per year</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Employer Pension Contributions</p>
                        <p className="text-sm text-muted-foreground">Employer pension contributions are tax-deductible, exempt from NI, and reduce corporation tax. More efficient than salary for directors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Patent Box Regime</p>
                        <p className="text-sm text-muted-foreground">Reduced 10% corporation tax rate on profits attributable to patented inventions and innovations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Employment Allowance</p>
                        <p className="text-sm text-muted-foreground">Eligible employers can reduce employer NI by up to £5,000 per year</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Flat Rate VAT Scheme</p>
                        <p className="text-sm text-muted-foreground">Simplified VAT accounting for businesses with turnover under £150k. Can reduce admin burden and potentially lower VAT liability</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Tax Compliance Action Plan</CardTitle>
                  <CardDescription>Structured timeline for UK tax setup and optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4 py-2" data-testid={`action-${index}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}>
                            {item.priority}
                          </Badge>
                          <span className="font-semibold text-sm">{item.week}</span>
                        </div>
                        <p className="text-sm">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Compliance Deadlines</CardTitle>
                  <CardDescription>HMRC filing and payment dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Corporation Tax</p>
                        <p className="text-sm text-muted-foreground">Due 9 months and 1 day after accounting period end. E.g., year end 31 March → pay by 1 January</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">VAT Returns</p>
                        <p className="text-sm text-muted-foreground">Quarterly returns due 1 month and 7 days after quarter end. Must use Making Tax Digital (MTD) compliant software</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">PAYE/NI (RTI)</p>
                        <p className="text-sm text-muted-foreground">Monthly Real Time Information submissions required on or before payday. Payment due 22nd of following month (19th if paying by post)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Self Assessment</p>
                        <p className="text-sm text-muted-foreground">Tax return deadline: 31 January following tax year. Payment on account may be required if tax liability exceeds £1,000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-9500/10 rounded-lg">
                      <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Annual Accounts</p>
                        <p className="text-sm text-muted-foreground">Companies House filing due 9 months after year end. Smaller companies can file abbreviated accounts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This tool provides estimates for planning purposes. Tax laws are complex and individual circumstances vary. Always consult with a qualified UK Chartered Accountant or tax advisor for personalized guidance and HMRC compliance verification.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
