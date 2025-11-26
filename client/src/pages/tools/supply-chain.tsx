import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Package, Truck, Factory, Shield, MapPin } from "lucide-react";
import {
  ScatterChart, Scatter, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

type SupplierType = 'primary' | 'secondary' | 'tertiary' | 'backup';
type SupplierLocation = 'uk' | 'eu' | 'asia' | 'americas' | 'other';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

type Supplier = {
  id: string;
  name: string;
  type: SupplierType;
  location: SupplierLocation;
  leadTime: number;
  reliability: number;
  riskLevel: RiskLevel;
  costPerUnit: number;
  minOrder: number;
  description: string;
  ukCompliant: boolean;
};

type InventoryItem = {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  weeklyCost: number;
};

type LogisticsRoute = {
  id: string;
  origin: string;
  destination: string;
  method: 'air' | 'sea' | 'road' | 'rail';
  avgDays: number;
  costPerShipment: number;
};

const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  backup: 'Backup'
};

const LOCATION_LABELS: Record<SupplierLocation, string> = {
  uk: 'UK',
  eu: 'EU',
  asia: 'Asia',
  americas: 'Americas',
  other: 'Other'
};

const LOCATION_COLORS: Record<SupplierLocation, string> = {
  uk: '#10b981',
  eu: '#3b82f6',
  asia: '#f59e0b',
  americas: '#8b5cf6',
  other: '#6b7280'
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

const METHOD_COLORS = {
  air: '#3b82f6',
  sea: '#10b981',
  road: '#f59e0b',
  rail: '#8b5cf6'
};

export default function SupplyChain() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: '',
      type: 'primary',
      location: 'uk',
      leadTime: 7,
      reliability: 85,
      riskLevel: 'low',
      costPerUnit: 0,
      minOrder: 100,
      description: '',
      ukCompliant: true
    }
  ]);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: '',
      currentStock: 0,
      reorderPoint: 0,
      maxStock: 0,
      weeklyCost: 0
    }
  ]);
  const [logistics, setLogistics] = useState<LogisticsRoute[]>([
    {
      id: '1',
      origin: '',
      destination: '',
      method: 'road',
      avgDays: 1,
      costPerShipment: 0
    }
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const addSupplier = () => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: '',
      type: 'primary',
      location: 'uk',
      leadTime: 7,
      reliability: 85,
      riskLevel: 'low',
      costPerUnit: 0,
      minOrder: 100,
      description: '',
      ukCompliant: true
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, field: keyof Supplier, value: any) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSupplier = (id: string) => {
    if (suppliers.length > 1) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: '',
      currentStock: 0,
      reorderPoint: 0,
      maxStock: 0,
      weeklyCost: 0
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (id: string, field: keyof InventoryItem, value: any) => {
    setInventory(inventory.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeInventoryItem = (id: string) => {
    if (inventory.length > 1) {
      setInventory(inventory.filter(i => i.id !== id));
    }
  };

  const addLogisticsRoute = () => {
    const newRoute: LogisticsRoute = {
      id: Date.now().toString(),
      origin: '',
      destination: '',
      method: 'road',
      avgDays: 1,
      costPerShipment: 0
    };
    setLogistics([...logistics, newRoute]);
  };

  const updateLogisticsRoute = (id: string, field: keyof LogisticsRoute, value: any) => {
    setLogistics(logistics.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLogisticsRoute = (id: string) => {
    if (logistics.length > 1) {
      setLogistics(logistics.filter(l => l.id !== id));
    }
  };

  const ukSuppliers = suppliers.filter(s => s.location === 'uk').length;
  const ukCompliantSuppliers = suppliers.filter(s => s.ukCompliant).length;
  const avgReliability = suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, s) => sum + s.reliability, 0) / suppliers.length)
    : 0;
  const avgLeadTime = suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, s) => sum + s.leadTime, 0) / suppliers.length)
    : 0;
  const highRiskSuppliers = suppliers.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
  
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.currentStock * i.weeklyCost), 0);
  const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderPoint).length;
  const overStockItems = inventory.filter(i => i.currentStock >= i.maxStock * 0.9).length;
  
  const totalLogisticsCost = logistics.reduce((sum, l) => sum + l.costPerShipment, 0);
  const avgDeliveryTime = logistics.length > 0
    ? Math.round(logistics.reduce((sum, l) => sum + l.avgDays, 0) / logistics.length)
    : 0;

  const resilienceScore = Math.round(
    (ukCompliantSuppliers / Math.max(suppliers.length, 1) * 30) +
    (avgReliability / 100 * 25) +
    ((100 - (highRiskSuppliers / Math.max(suppliers.length, 1) * 100)) / 100 * 20) +
    ((inventory.length - lowStockItems) / Math.max(inventory.length, 1) * 15) +
    (logistics.length >= 2 ? 10 : logistics.length * 5)
  );

  const suppliersByLocation = Object.keys(LOCATION_LABELS).map(loc => ({
    name: LOCATION_LABELS[loc as SupplierLocation],
    value: suppliers.filter(s => s.location === loc).length,
    color: LOCATION_COLORS[loc as SupplierLocation]
  })).filter(d => d.value > 0);

  const supplierRiskMatrix = suppliers.map(s => ({
    x: s.leadTime,
    y: 100 - s.reliability,
    name: s.name || 'Unnamed',
    location: LOCATION_LABELS[s.location],
    riskLevel: s.riskLevel,
    fill: RISK_COLORS[s.riskLevel]
  }));

  const supplierPerformanceData = suppliers.map(s => ({
    name: s.name || 'Unnamed',
    reliability: s.reliability,
    leadTime: s.leadTime,
    ukCompliant: s.ukCompliant ? 100 : 0
  }));

  const inventoryStatus = inventory.map(i => {
    const stockLevel = i.maxStock > 0 ? (i.currentStock / i.maxStock) * 100 : 0;
    let status: 'critical' | 'low' | 'optimal' | 'high' = 'optimal';
    let statusColor = '#10b981';
    
    if (i.currentStock <= i.reorderPoint) {
      status = 'critical';
      statusColor = '#dc2626';
    } else if (i.currentStock <= i.reorderPoint * 1.5) {
      status = 'low';
      statusColor = '#f59e0b';
    } else if (i.currentStock >= i.maxStock * 0.9) {
      status = 'high';
      statusColor = '#3b82f6';
    }
    
    return {
      name: i.name || 'Unnamed',
      current: i.currentStock,
      reorder: i.reorderPoint,
      max: i.maxStock,
      stockLevel,
      status,
      statusColor,
      value: i.currentStock * i.weeklyCost
    };
  });

  const logisticsByMethod = [
    { 
      method: 'Air', 
      count: logistics.filter(l => l.method === 'air').length, 
      avgCost: logistics.filter(l => l.method === 'air').reduce((sum, l) => sum + l.costPerShipment, 0) / Math.max(logistics.filter(l => l.method === 'air').length, 1),
      avgDays: logistics.filter(l => l.method === 'air').reduce((sum, l) => sum + l.avgDays, 0) / Math.max(logistics.filter(l => l.method === 'air').length, 1),
      color: METHOD_COLORS.air
    },
    { 
      method: 'Sea', 
      count: logistics.filter(l => l.method === 'sea').length, 
      avgCost: logistics.filter(l => l.method === 'sea').reduce((sum, l) => sum + l.costPerShipment, 0) / Math.max(logistics.filter(l => l.method === 'sea').length, 1),
      avgDays: logistics.filter(l => l.method === 'sea').reduce((sum, l) => sum + l.avgDays, 0) / Math.max(logistics.filter(l => l.method === 'sea').length, 1),
      color: METHOD_COLORS.sea
    },
    { 
      method: 'Road', 
      count: logistics.filter(l => l.method === 'road').length, 
      avgCost: logistics.filter(l => l.method === 'road').reduce((sum, l) => sum + l.costPerShipment, 0) / Math.max(logistics.filter(l => l.method === 'road').length, 1),
      avgDays: logistics.filter(l => l.method === 'road').reduce((sum, l) => sum + l.avgDays, 0) / Math.max(logistics.filter(l => l.method === 'road').length, 1),
      color: METHOD_COLORS.road
    },
    { 
      method: 'Rail', 
      count: logistics.filter(l => l.method === 'rail').length, 
      avgCost: logistics.filter(l => l.method === 'rail').reduce((sum, l) => sum + l.costPerShipment, 0) / Math.max(logistics.filter(l => l.method === 'rail').length, 1),
      avgDays: logistics.filter(l => l.method === 'rail').reduce((sum, l) => sum + l.avgDays, 0) / Math.max(logistics.filter(l => l.method === 'rail').length, 1),
      color: METHOD_COLORS.rail
    }
  ].filter(m => m.count > 0);

  const suppliersByType = Object.keys(SUPPLIER_TYPE_LABELS).map(type => ({
    type: SUPPLIER_TYPE_LABELS[type as SupplierType],
    count: suppliers.filter(s => s.type === type).length,
  })).filter(d => d.count > 0);

  const getSerializedState = () => {
    return {
      suppliers,
      inventory,
      logistics,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('suppliers' in state) setSuppliers(state.suppliers);
    if ('inventory' in state) setInventory(state.inventory);
    if ('logistics' in state) setLogistics(state.logistics);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('supply-chain-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('supply-chain-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('supply-chain-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (ukSuppliers === 0) {
      tips.push("UK Visa Critical Requirement: Include at least one UK-based supplier to demonstrate local economic contribution and reduce post-Brexit import complexity. Endorsing bodies specifically look for UK supply chain integration.");
    }
    
    if (ukCompliantSuppliers < suppliers.length * 0.7) {
      tips.push("Only " + ukCompliantSuppliers + " of " + suppliers.length + " suppliers are UK compliant. Endorsing bodies expect majority compliance with UK trade and quality standards. Consider replacing non-compliant suppliers or obtaining necessary certifications.");
    }
    
    if (highRiskSuppliers > 0) {
      tips.push("You have " + highRiskSuppliers + " high-risk supplier(s). UK investors and endorsing bodies expect comprehensive risk mitigation strategies for supply chain vulnerabilities. Document specific backup plans for each high-risk supplier.");
    }
    
    if (avgLeadTime > 30) {
      tips.push("Average lead time of " + avgLeadTime + " days exceeds best practice benchmarks. Consider diversifying suppliers, establishing UK-based inventory warehousing, or negotiating expedited delivery terms to improve operational agility.");
    }
    
    if (suppliers.length < 3) {
      tips.push("Limited supplier diversity creates single-point failure risk. UK business plans should demonstrate resilient supply chain with multiple sourcing options. Aim for at least 3-5 suppliers across different categories.");
    }
    
    if (lowStockItems > inventory.length * 0.3) {
      tips.push("Critical inventory warning: " + lowStockItems + " items below reorder point. This operational gap may raise concerns with endorsing bodies about business readiness and working capital management. Review inventory policies immediately.");
    }
    
    if (logistics.length === 0) {
      tips.push("No logistics routes defined. UK visa applications must demonstrate clear understanding of product delivery and distribution channels. Document specific carriers, routes, and delivery SLAs.");
    }
    
    if (!suppliers.some(s => s.type === 'backup')) {
      tips.push("No backup suppliers identified. Business continuity planning requires alternative sourcing strategies for critical components. Endorsers expect documented contingency arrangements for supply chain disruptions.");
    }
    
    if (resilienceScore >= 75) {
      tips.push("Strong supply chain resilience score of " + resilienceScore + "%. Document this operational capability prominently in your business plan for visa endorsement. Include supply chain diagrams and supplier agreements as supporting evidence.");
    }
    
    if (totalInventoryValue > 50000) {
      tips.push("Inventory value of £" + totalInventoryValue.toLocaleString() + " represents significant capital allocation. Ensure this aligns with your investment plan and demonstrate how inventory turnover supports revenue projections.");
    }
    
    tips.push("UK Post-Brexit Compliance: All EU suppliers must now comply with UK customs and regulatory standards. Verify CE/UKCA marking compliance, obtain EORI numbers, and factor customs clearance into lead times (typically 2-5 additional days).");
    
    tips.push("For Innovator Founder Visa: Supply chain documentation should demonstrate scalability potential, cost efficiency optimization, and clear alignment with your 12-month growth projections and job creation plans.");

    tips.push("Consider establishing relationships with UK-based warehousing and fulfillment providers (e.g., Amazon FBA UK, Royal Mail distribution centers) to demonstrate operational commitment to the UK market and reduce delivery times.");

    tips.push("Document all supplier agreements in writing with clear terms - letters of intent, MOUs, or formal contracts strengthen your business plan credibility with endorsing bodies. Include payment terms, quality standards, and dispute resolution clauses.");

    tips.push("Include comprehensive supply chain costs (procurement, logistics, inventory holding, insurance, customs duties) in your detailed financial projections to demonstrate thorough operational planning and financial acumen.");

    if (avgReliability < 85) {
      tips.push("Average supplier reliability of " + avgReliability + "% is below industry best practice (>90%). Work with suppliers to improve on-time delivery performance or consider more reliable alternatives to reduce operational risk.");
    }

    if (overStockItems > 0) {
      tips.push("Warning: " + overStockItems + " inventory item(s) approaching maximum capacity. Excess inventory ties up working capital and may indicate demand forecasting issues. Review sales projections and adjust procurement accordingly.");
    }

    if (!logistics.some(l => l.destination.toLowerCase().includes('uk') || l.destination.toLowerCase().includes('london'))) {
      tips.push("No UK destination logistics routes identified. Your supply chain plan should explicitly show how products reach UK customers. Include specific UK delivery hubs and last-mile delivery arrangements.");
    }

    if (suppliers.filter(s => s.location === 'asia').length > suppliers.length * 0.7) {
      tips.push("Over 70% of suppliers are Asia-based. While cost-effective, this creates geographic concentration risk and longer lead times. Consider nearshoring options in UK/EU to demonstrate supply chain resilience and Brexit adaptation.");
    }

    tips.push("UK Home Office Expectation: Your supply chain should support the 'genuine, credible, and viable' business test. Ensure all supplier relationships, costs, and logistics arrangements are realistic, documented, and aligned with your revenue model.");
    
    return tips.slice(0, 20);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Conduct comprehensive supplier audit and verify UK compliance certifications (UKCA marking, trade licenses, insurance certificates)",
        priority: "Critical",
        ukRequirement: "Home Office expects evidence of lawful business operations and regulatory compliance. Document all certification checks."
      },
      { 
        week: "Week 1-2", 
        action: "Map complete supply chain from raw materials to end customer, identifying all dependencies, critical paths, and potential bottlenecks",
        priority: "Critical",
        ukRequirement: "Business plan must demonstrate operational feasibility and deep market understanding. Include visual supply chain diagrams."
      },
      { 
        week: "Week 2", 
        action: "Establish relationships with at least one UK-based supplier and obtain written supply agreements or letters of intent",
        priority: "High",
        ukRequirement: "Local supplier engagement demonstrates UK economic contribution for visa assessment. UK suppliers also reduce Brexit-related complications."
      },
      { 
        week: "Week 2-3", 
        action: "Develop detailed risk mitigation strategies for each high-risk supplier including backup sourcing options, inventory buffers, and contingency timelines",
        priority: "Critical",
        ukRequirement: "Endorsing bodies require evidence of business continuity planning and sophisticated risk management. Show you've considered multiple failure scenarios."
      },
      { 
        week: "Week 3", 
        action: "Optimize inventory levels based on 12-month demand forecasting and establish automated reorder point systems with supplier EDI integration",
        priority: "High",
        ukRequirement: "Operational efficiency demonstrates management capability to UK assessors. Link inventory levels to your financial projections."
      },
      { 
        week: "Week 3-4", 
        action: "Negotiate formal logistics agreements with UK carriers and establish UK customs broker relationships for all international shipments",
        priority: "High",
        ukRequirement: "Post-Brexit customs compliance is mandatory for non-UK sourcing. Budget for customs duties (typically 0-12% depending on product category)."
      },
      { 
        week: "Week 4", 
        action: "Document comprehensive supply chain costs, lead times, quality metrics, and profit margins in detailed financial projections spreadsheet",
        priority: "Critical",
        ukRequirement: "Financial viability assessment requires granular cost structure understanding. Show clear path from £50k investment to profitable operations."
      },
      { 
        week: "Week 4", 
        action: "Create professional supply chain visualization diagram showing all suppliers, routes, warehousing, and contingency plans with UK focus highlighted",
        priority: "High",
        ukRequirement: "Visual documentation strengthens business plan credibility for endorsement review. Use tools like Lucidchart or draw.io for professional presentation."
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - SUPPLY CHAIN RESILIENCE ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(85)}

EXECUTIVE SUMMARY
${'-'.repeat(85)}
Supply Chain Resilience Score: ${resilienceScore}%
Overall Assessment: ${resilienceScore >= 75 ? 'STRONG - Demonstrates robust operational capability' :
  resilienceScore >= 50 ? 'MODERATE - Improvements needed for visa endorsement' :
  'WEAK - Significant vulnerabilities require immediate attention'}

SUPPLIER NETWORK METRICS
${'-'.repeat(85)}
Total Suppliers: ${suppliers.length}
UK-Based Suppliers: ${ukSuppliers} (${Math.round((ukSuppliers / Math.max(suppliers.length, 1)) * 100)}%)
UK Compliant Suppliers: ${ukCompliantSuppliers} (${Math.round((ukCompliantSuppliers / Math.max(suppliers.length, 1)) * 100)}%)
High-Risk Suppliers: ${highRiskSuppliers}
Average Supplier Reliability: ${avgReliability}%
Average Lead Time: ${avgLeadTime} days

INVENTORY MANAGEMENT STATUS
${'-'.repeat(85)}
Total Inventory Items: ${inventory.length}
Total Inventory Value: £${totalInventoryValue.toLocaleString()}
Items Below Reorder Point: ${lowStockItems} ${lowStockItems > 0 ? '(ACTION REQUIRED)' : ''}
Items Approaching Maximum: ${overStockItems} ${overStockItems > 0 ? '(REVIEW NEEDED)' : ''}
Inventory Health Score: ${Math.round(((inventory.length - lowStockItems) / Math.max(inventory.length, 1)) * 100)}%

LOGISTICS & DISTRIBUTION
${'-'.repeat(85)}
Total Logistics Routes: ${logistics.length}
Total Annual Logistics Cost: £${(totalLogisticsCost * 52).toLocaleString()}
Average Delivery Time: ${avgDeliveryTime} days
Transport Methods in Use: ${logisticsByMethod.map(m => m.method).join(', ')}

DETAILED SUPPLIER ANALYSIS
${'-'.repeat(85)}
${suppliers.map((s, i) => `
SUPPLIER ${i + 1}: ${s.name || 'Unnamed Supplier'}
${'-'.repeat(85)}
Classification: ${SUPPLIER_TYPE_LABELS[s.type]}
Geographic Location: ${LOCATION_LABELS[s.location]}
Lead Time: ${s.leadTime} days
Reliability Score: ${s.reliability}%
Risk Assessment: ${s.riskLevel.toUpperCase()}
Unit Cost: £${s.costPerUnit.toLocaleString()}
Minimum Order Quantity: ${s.minOrder.toLocaleString()} units
Annual Spend (based on min order): £${(s.costPerUnit * s.minOrder * 12).toLocaleString()}
UK Standards Compliant: ${s.ukCompliant ? 'YES' : 'NO - REQUIRES ACTION'}
${s.description ? `Description: ${s.description}` : 'No description provided'}

Post-Brexit Considerations:
${s.location === 'eu' ? '- EU supplier requires UK customs declarations and EORI number\n- Factor 2-5 additional days for UK border processing\n- Verify UKCA marking compliance (CE marking no longer valid)\n- Budget for import VAT (20%) and potential tariffs (0-12%)' : ''}
${s.location === 'asia' ? '- Long-haul shipping requires detailed customs documentation\n- Consider UK tariff schedules (MFN rates or FTA benefits)\n- Factor currency risk and hedging strategies\n- Build buffer inventory for supply chain disruptions' : ''}
${s.location === 'uk' ? '- UK domestic supplier reduces Brexit complications\n- Demonstrates local economic contribution for visa\n- Shorter lead times support agile operations\n- Consider highlighting in endorsement application' : ''}
`).join('\n')}

SUPPLIER DISTRIBUTION BY LOCATION
${'-'.repeat(85)}
${suppliersByLocation.map(loc => `${loc.name}: ${loc.value} supplier${loc.value > 1 ? 's' : ''} (${Math.round((loc.value / suppliers.length) * 100)}%)`).join('\n')}

Geographic Concentration Risk Analysis:
${suppliersByLocation.length < 2 ? 'WARNING: All suppliers in single geographic region - high concentration risk' :
  suppliersByLocation.length < 3 ? 'MODERATE: Limited geographic diversification - consider additional regions' :
  'GOOD: Suppliers distributed across multiple regions'}

SUPPLIER DISTRIBUTION BY TYPE
${'-'.repeat(85)}
${suppliersByType.map(t => `${t.type}: ${t.count} supplier${t.count > 1 ? 's' : ''}`).join('\n')}

Business Continuity Assessment:
${suppliers.some(s => s.type === 'backup') ? 'GOOD: Backup suppliers identified for continuity planning' :
  'WARNING: No backup suppliers - single point of failure risk'}
${suppliers.filter(s => s.type === 'primary').length > 1 ? 'CONCERN: Multiple primary suppliers may indicate unclear sourcing strategy' : ''}

DETAILED INVENTORY ANALYSIS
${'-'.repeat(85)}
${inventory.map((item, i) => {
  const stockLevel = item.maxStock > 0 ? Math.round((item.currentStock / item.maxStock) * 100) : 0;
  const itemValue = item.currentStock * item.weeklyCost;
  let status = 'OPTIMAL';
  if (item.currentStock <= item.reorderPoint) status = 'CRITICAL - REORDER IMMEDIATELY';
  else if (item.currentStock <= item.reorderPoint * 1.5) status = 'LOW - SCHEDULE REORDER';
  else if (item.currentStock >= item.maxStock * 0.9) status = 'HIGH - REDUCE PROCUREMENT';
  
  return `
ITEM ${i + 1}: ${item.name || 'Unnamed Item'}
${'-'.repeat(85)}
Current Stock Level: ${item.currentStock.toLocaleString()} units (${stockLevel}% of capacity)
Reorder Trigger Point: ${item.reorderPoint.toLocaleString()} units
Maximum Capacity: ${item.maxStock.toLocaleString()} units
Weekly Holding Cost: £${item.weeklyCost.toLocaleString()}
Current Inventory Value: £${itemValue.toLocaleString()}
Annual Holding Cost: £${(item.weeklyCost * 52).toLocaleString()}
Status: ${status}

Recommendations:
${item.currentStock <= item.reorderPoint ? '- URGENT: Place purchase order immediately to avoid stockout\n- Consider expedited shipping if standard lead time too long\n- Review demand forecast accuracy' : ''}
${item.currentStock >= item.maxStock * 0.9 ? '- Reduce next procurement order to avoid excess inventory\n- Verify sales projections align with current stock levels\n- Consider promotional activities to increase turnover' : ''}
${item.currentStock > item.reorderPoint && item.currentStock < item.maxStock * 0.9 ? '- Stock levels healthy - maintain current procurement schedule\n- Monitor weekly consumption trends\n- Document inventory management in business plan' : ''}
`;
}).join('\n')}

LOGISTICS NETWORK ANALYSIS
${'-'.repeat(85)}
${logistics.map((route, i) => {
  const annualCost = route.costPerShipment * 52;
  const costPerDay = route.costPerShipment / Math.max(route.avgDays, 1);
  
  return `
ROUTE ${i + 1}: ${route.origin || 'Origin Not Specified'} → ${route.destination || 'Destination Not Specified'}
${'-'.repeat(85)}
Transport Method: ${route.method.toUpperCase()}
Average Transit Time: ${route.avgDays} days
Cost Per Shipment: £${route.costPerShipment.toLocaleString()}
Estimated Annual Cost (weekly shipments): £${annualCost.toLocaleString()}
Cost Per Day in Transit: £${Math.round(costPerDay).toLocaleString()}

Route Optimization Opportunities:
${route.method === 'air' && route.avgDays > 3 ? '- Air freight should typically be 1-3 days - verify routing efficiency' : ''}
${route.method === 'sea' && route.avgDays < 14 ? '- Verify sea freight lead time is realistic (typical 14-45 days for international)' : ''}
${route.method === 'road' && route.avgDays > 5 ? '- Road transport over 5 days suggests long-haul - consider rail alternative' : ''}
${route.costPerShipment > 5000 ? '- High shipment cost - evaluate consolidation or volume discounts' : ''}
${route.destination.toLowerCase().includes('uk') || route.destination.toLowerCase().includes('london') ? '- UK destination route supports visa application evidence of UK operations' : ''}

Post-Brexit Customs Considerations:
${!route.origin.toLowerCase().includes('uk') && !route.origin.toLowerCase().includes('london') ? '- International route requires customs broker and EORI number\n- Add 2-5 days for UK border clearance processing\n- Factor import duties into total landed cost\n- Ensure supplier provides commercial invoices and COO certificates' : '- Domestic UK route - no customs complications'}
`;
}).join('\n')}

LOGISTICS BY TRANSPORT METHOD
${'-'.repeat(85)}
${logisticsByMethod.map(m => `
${m.method}:
  Routes: ${m.count}
  Average Cost per Shipment: £${Math.round(m.avgCost).toLocaleString()}
  Average Transit Time: ${Math.round(m.avgDays)} days
  Annual Cost (assuming weekly shipments): £${Math.round(m.avgCost * 52).toLocaleString()}
  
  Method Analysis:
  ${m.method === 'Air' ? '- Fastest but most expensive - use for high-value, time-sensitive goods\n  - Typical use: Emergency stock, high-margin products, perishables\n  - UK airports: Heathrow, Gatwick, Manchester for cargo' : ''}
  ${m.method === 'Sea' ? '- Most cost-effective for bulk shipments but slowest\n  - Typical use: Large volume, non-perishable goods\n  - UK ports: Felixstowe, Southampton, London Gateway' : ''}
  ${m.method === 'Road' ? '- Flexible and reliable for UK/EU distribution\n  - Typical use: Regular deliveries, last-mile logistics\n  - Post-Brexit: Ensure hauliers have UK market access permits' : ''}
  ${m.method === 'Rail' ? '- Green alternative with good reliability\n  - Typical use: UK domestic, Channel Tunnel EU connections\n  - Consider HS2 freight opportunities for future scaling' : ''}
`).join('\n')}

SUPPLY CHAIN RISK MATRIX
${'-'.repeat(85)}

Critical Risk Suppliers (Reliability <70% or Lead Time >45 days):
${suppliers.filter(s => s.riskLevel === 'critical')
  .map(s => `- ${s.name || 'Unnamed'} (${LOCATION_LABELS[s.location]}): Lead Time ${s.leadTime} days, Reliability ${s.reliability}%
  MITIGATION REQUIRED: ${!suppliers.some(backup => backup.type === 'backup' && backup.id !== s.id) ? 'Identify backup supplier immediately' : 'Document backup supplier activation plan'}`)
  .join('\n') || 'None identified - Good'}

High Risk Suppliers (Reliability 70-79% or Lead Time 31-45 days):
${suppliers.filter(s => s.riskLevel === 'high')
  .map(s => `- ${s.name || 'Unnamed'} (${LOCATION_LABELS[s.location]}): Lead Time ${s.leadTime} days, Reliability ${s.reliability}%
  MITIGATION: Consider dual-sourcing strategy or increase safety stock`)
  .join('\n') || 'None identified - Good'}

Medium Risk Suppliers (Reliability 80-89% or Lead Time 15-30 days):
${suppliers.filter(s => s.riskLevel === 'medium')
  .map(s => `- ${s.name || 'Unnamed'} (${LOCATION_LABELS[s.location]}): Lead Time ${s.leadTime} days, Reliability ${s.reliability}%
  MONITORING: Track KPIs monthly, maintain open communication`)
  .join('\n') || 'None identified'}

Low Risk Suppliers (Reliability >90% and Lead Time <15 days):
${suppliers.filter(s => s.riskLevel === 'low')
  .map(s => `- ${s.name || 'Unnamed'} (${LOCATION_LABELS[s.location]}): Lead Time ${s.leadTime} days, Reliability ${s.reliability}%
  MAINTAIN: Strong performance - document in business plan`)
  .join('\n') || 'None identified - Requires Action'}

SUPPLY CHAIN RESILIENCE SCORING METHODOLOGY
${'-'.repeat(85)}
Overall Resilience Score: ${resilienceScore}/100

Score Breakdown:
1. UK Compliance (30 points maximum)
   Score: ${Math.round((ukCompliantSuppliers / Math.max(suppliers.length, 1)) * 30)}/30
   Calculation: (UK Compliant Suppliers / Total Suppliers) × 30
   Rationale: UK visa applications require demonstrated regulatory compliance
   
2. Supplier Reliability (25 points maximum)
   Score: ${Math.round((avgReliability / 100) * 25)}/25
   Calculation: (Average Reliability % / 100) × 25
   Rationale: Reliable suppliers reduce operational risk and delivery failures
   
3. Risk Diversification (20 points maximum)
   Score: ${Math.round(((100 - (highRiskSuppliers / Math.max(suppliers.length, 1) * 100)) / 100) * 20)}/20
   Calculation: ((100 - High Risk %) / 100) × 20
   Rationale: Fewer high-risk suppliers indicates better contingency planning
   
4. Inventory Management (15 points maximum)
   Score: ${Math.round(((inventory.length - lowStockItems) / Math.max(inventory.length, 1)) * 15)}/15
   Calculation: (Healthy Stock Items / Total Items) × 15
   Rationale: Proper inventory levels demonstrate operational competence
   
5. Logistics Diversity (10 points maximum)
   Score: ${logistics.length >= 2 ? 10 : logistics.length * 5}/10
   Calculation: 10 if 2+ routes, 5 if 1 route, 0 if none
   Rationale: Multiple logistics channels reduce single-point failure risk

Scoring Interpretation:
- 75-100: STRONG - Demonstrates robust supply chain suitable for visa endorsement
- 50-74: MODERATE - Acceptable but improvements recommended before application
- 25-49: WEAK - Significant gaps requiring immediate attention
- 0-24: CRITICAL - Not suitable for visa application in current state

SMART RECOMMENDATIONS FOR UK VISA ENDORSEMENT
${'-'.repeat(85)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK IMPLEMENTATION ACTION PLAN
${'-'.repeat(85)}
${generateActionPlan().map((item, i) => `
ACTION ITEM ${i + 1}
Timeline: ${item.week}
Priority: ${item.priority}

Task: ${item.action}

UK Visa Requirement: ${item.ukRequirement}

Expected Outcomes:
${item.week.includes('Week 1') ? '- Completed supplier audit documentation\n- Compliance certificates collected and verified\n- Risk areas identified for mitigation' : ''}
${item.week.includes('Week 2') ? '- Written supplier agreements or LOIs secured\n- Supply chain diagram created\n- UK supplier relationships established' : ''}
${item.week.includes('Week 3') ? '- Inventory management systems implemented\n- Demand forecasting model developed\n- Stock level optimization completed' : ''}
${item.week.includes('Week 4') ? '- Financial projections updated with supply chain costs\n- Business plan appendices prepared\n- Visual materials ready for endorsement package' : ''}
`).join('\n')}

UK INNOVATOR FOUNDER VISA COMPLIANCE CHECKLIST
${'-'.repeat(85)}

SUPPLIER REQUIREMENTS (Critical for Visa Application):
${ukSuppliers > 0 ? '[✓]' : '[✗]'} Minimum one UK-based supplier documented with written agreement
${ukCompliantSuppliers / suppliers.length >= 0.7 ? '[✓]' : '[✗]'} Majority of suppliers (>70%) compliant with UK trade standards
${suppliers.filter(s => s.location === 'eu').every(s => s.ukCompliant) ? '[✓]' : '[✗]'} All EU suppliers certified for post-Brexit UK customs compliance
${suppliers.some(s => s.type === 'backup') ? '[✓]' : '[✗]'} Backup suppliers identified for critical components/materials
${suppliers.every(s => s.description.length > 0) ? '[✓]' : '[✗]'} Supplier due diligence completed with descriptions documented

INVENTORY MANAGEMENT (Operational Readiness):
${lowStockItems === 0 ? '[✓]' : '[✗]'} Inventory levels aligned with 12-month financial projections (no stockouts)
${totalInventoryValue <= 50000 * 0.3 ? '[✓]' : '[✗]'} Stock valuation reasonable vs total investment (<30% allocation)
${inventory.every(i => i.maxStock > 0) ? '[✓]' : '[✗]'} Warehouse or fulfillment capacity documented for all items
${inventory.every(i => i.reorderPoint > 0) ? '[✓]' : '[✗]'} Reorder systems and procurement processes clearly defined
${inventory.length > 0 ? '[✓]' : '[✗]'} Stock holding costs integrated into cash flow forecasting

LOGISTICS PLANNING (Delivery Capability):
${logistics.some(l => !l.origin.toLowerCase().includes('uk')) ? '[✓]' : '[?]'} UK customs broker engaged for international shipments (if applicable)
${logistics.length > 0 ? '[✓]' : '[✗]'} Delivery service agreements with UK carriers documented
${logistics.some(l => l.destination.toLowerCase().includes('uk')) ? '[✓]' : '[✗]'} Clear UK delivery routes and last-mile logistics defined
${logistics.every(l => l.costPerShipment > 0) ? '[✓]' : '[✗]'} All logistics costs quantified for financial modeling
${logistics.length >= 2 ? '[✓]' : '[✗]'} Multiple transport routes/methods for supply chain resilience

RISK MANAGEMENT (Business Continuity):
${highRiskSuppliers === 0 ? '[✓]' : '[✗]'} No high-risk suppliers without documented mitigation plans
${suppliers.length >= 3 ? '[✓]' : '[✗]'} Supplier diversification across 3+ suppliers (no single-point dependency)
${avgReliability >= 85 ? '[✓]' : '[✗]'} Average supplier reliability >85% demonstrating stable operations
${avgLeadTime <= 30 ? '[✓]' : '[✗]'} Average lead time <30 days enabling responsive operations
${resilienceScore >= 50 ? '[✓]' : '[✗]'} Overall supply chain resilience score >50% minimum threshold

DOCUMENTATION FOR VISA APPLICATION (Evidence Package):
[ ] Supply chain diagram showing all suppliers, routes, and distribution channels
[ ] Supplier agreements, LOIs, or email confirmations included as appendices
[ ] UK compliance certificates (UKCA, ISO standards) attached where applicable
[ ] Logistics cost breakdown integrated into business plan financial section
[ ] Risk mitigation strategies clearly articulated in operational plan section
[ ] This supply chain analysis report included in supporting documentation

CURRENT COMPLIANCE SUMMARY:
Total Checklist Items: 25
Items Completed: ${[
  ukSuppliers > 0,
  ukCompliantSuppliers / suppliers.length >= 0.7,
  suppliers.some(s => s.type === 'backup'),
  lowStockItems === 0,
  inventory.length > 0,
  logistics.length > 0,
  logistics.some(l => l.destination.toLowerCase().includes('uk')),
  highRiskSuppliers === 0,
  suppliers.length >= 3,
  avgReliability >= 85,
  avgLeadTime <= 30,
  resilienceScore >= 50
].filter(Boolean).length}
Compliance Rate: ${Math.round(([
  ukSuppliers > 0,
  ukCompliantSuppliers / suppliers.length >= 0.7,
  suppliers.some(s => s.type === 'backup'),
  lowStockItems === 0,
  inventory.length > 0,
  logistics.length > 0,
  logistics.some(l => l.destination.toLowerCase().includes('uk')),
  highRiskSuppliers === 0,
  suppliers.length >= 3,
  avgReliability >= 85,
  avgLeadTime <= 30,
  resilienceScore >= 50
].filter(Boolean).length / 12) * 100)}%

Readiness Assessment:
${[
  ukSuppliers > 0,
  ukCompliantSuppliers / suppliers.length >= 0.7,
  suppliers.some(s => s.type === 'backup'),
  lowStockItems === 0,
  inventory.length > 0,
  logistics.length > 0,
  logistics.some(l => l.destination.toLowerCase().includes('uk')),
  highRiskSuppliers === 0,
  suppliers.length >= 3,
  avgReliability >= 85,
  avgLeadTime <= 30,
  resilienceScore >= 50
].filter(Boolean).length >= 10 ? 'READY - Supply chain documentation meets visa application standards' :
  [
  ukSuppliers > 0,
  ukCompliantSuppliers / suppliers.length >= 0.7,
  suppliers.some(s => s.type === 'backup'),
  lowStockItems === 0,
  inventory.length > 0,
  logistics.length > 0,
  logistics.some(l => l.destination.toLowerCase().includes('uk')),
  highRiskSuppliers === 0,
  suppliers.length >= 3,
  avgReliability >= 85,
  avgLeadTime <= 30,
  resilienceScore >= 50
].filter(Boolean).length >= 6 ? 'IMPROVING - Address remaining gaps before application submission' :
  'NOT READY - Significant supply chain planning required before visa application'}

POST-BREXIT UK SUPPLY CHAIN CONSIDERATIONS
${'-'.repeat(85)}

Customs and Tariffs:
- UK Global Tariff (UKGT) applies to goods imported from non-FTA countries
- Rules of Origin documentation required for preferential tariff treatment under FTAs
- Import VAT payable on goods entering UK from EU (previously exempt pre-Brexit)
- Customs declarations mandatory for all EU imports via Customs Declaration Service
- Duty deferment accounts can improve cash flow (vs paying duties at border)

Regulatory Standards and Product Compliance:
- UKCA marking replaced CE marking for product compliance (transition ended Jan 2023)
- UK conformity assessment required for regulated products (electronics, machinery, toys)
- Separate product registration needed for chemicals (UK REACH vs EU REACH database)
- Medical devices require MHRA approval separate from EU MDR certification
- Food products need UK-specific labeling and may require FSA approval

Border Operations and Clearance:
- Sanitary and Phytosanitary (SPS) checks at border for food/agricultural products
- Border Control Posts (BCP) processing may add 1-3 days to sea/air freight
- Trusted Trader schemes (AEOC status) can expedite customs clearance
- Northern Ireland Protocol creates unique requirements for GB-NI trade
- Smart Freight system for Dover-Calais route requires pre-lodgment

Key Documentation Requirements:
- EORI number (Economic Operators Registration and Identification)
- Commercial invoices with detailed product descriptions and HS codes
- Certificates of Origin for FTA tariff preference claims
- Packing lists with exact quantities and weights
- Safety data sheets for hazardous materials

Strategic Recommendations for Post-Brexit Success:
1. Prioritize UK and FTA-country suppliers to minimize tariff exposure
2. Consider UK-based inventory consolidation to reduce import frequency
3. Engage customs broker early to establish EORI number and compliance procedures
4. Factor 10-15% additional lead time for EU imports vs pre-Brexit timelines
5. Review supplier contracts for Brexit-related cost allocation clauses
6. Build 20-30% safety stock buffer for EU-sourced critical components
7. Explore UK manufacturing partnerships to replace EU suppliers long-term

FINANCIAL IMPACT SUMMARY
${'-'.repeat(85)}

Estimated Annual Supply Chain Costs:

Direct Supplier Costs:
${suppliers.map(s => `  ${s.name || 'Unnamed'}: £${(s.costPerUnit * s.minOrder * 12).toLocaleString()} (${s.minOrder} units × £${s.costPerUnit} × 12 orders)`).join('\n')}
  
  Total Annual Supplier Costs: £${suppliers.reduce((sum, s) => sum + (s.costPerUnit * s.minOrder * 12), 0).toLocaleString()}

Logistics and Distribution:
  Annual Logistics Costs (52 shipments): £${(totalLogisticsCost * 52).toLocaleString()}
  Average Cost per Delivery: £${Math.round(totalLogisticsCost / Math.max(logistics.length, 1)).toLocaleString()}

Inventory Holding Costs:
  Annual Storage and Handling: £${(inventory.reduce((sum, i) => sum + i.weeklyCost, 0) * 52).toLocaleString()}
  Current Inventory Value: £${totalInventoryValue.toLocaleString()}
  Inventory as % of £50k Investment: ${Math.round((totalInventoryValue / 50000) * 100)}%

Post-Brexit Additional Costs (Estimates):
  Customs Broker Fees: £1,200 - £3,600 per year (assuming £100-300 per shipment)
  Import Duties (varies by product): 0-12% of goods value
  Additional Transport Time (carrying cost): £${Math.round((totalLogisticsCost * 52) * 0.15).toLocaleString()} (est. 15% increase)
  
Total Estimated Annual Supply Chain Investment:
£${(
  suppliers.reduce((sum, s) => sum + (s.costPerUnit * s.minOrder * 12), 0) +
  (totalLogisticsCost * 52) +
  (inventory.reduce((sum, i) => sum + i.weeklyCost, 0) * 52) +
  2400 + // Mid-range customs fees
  Math.round((totalLogisticsCost * 52) * 0.15) // Transport increase
).toLocaleString()}

Cost Optimization Opportunities:
${suppliers.length > 5 ? '- Consolidate suppliers to negotiate volume discounts (5+ suppliers may reduce leverage)' : ''}
${logisticsByMethod.some(m => m.method === 'Air' && m.count > 2) ? '- Review air freight usage - sea freight can save 60-80% for non-urgent goods' : ''}
${totalInventoryValue > 15000 ? '- High inventory carrying costs - review JIT or vendor-managed inventory options' : ''}
${suppliers.filter(s => s.location !== 'uk').length / suppliers.length > 0.8 ? '- Over 80% non-UK suppliers - consider UK alternatives to reduce duties and lead times' : ''}

Working Capital Requirements:
  Supplier Payment Terms: ${suppliers.length > 0 ? 'To be documented (typically 30-60 days for established relationships)' : 'N/A'}
  Inventory Investment: £${totalInventoryValue.toLocaleString()} (immediate capital requirement)
  Logistics Pre-payment: ${logistics.length > 0 ? 'Varies by carrier (advance payment common for new customers)' : 'N/A'}
  
  Recommended Working Capital Reserve: £${Math.round(
    (suppliers.reduce((sum, s) => sum + (s.costPerUnit * s.minOrder), 0) * 2) + // 2 months supplier costs
    totalInventoryValue +
    (totalLogisticsCost * 8) // 2 months logistics
  ).toLocaleString()} (covers 2 months of operations)

BUSINESS PLAN INTEGRATION GUIDANCE
${'-'.repeat(85)}

This supply chain analysis should be integrated into your UK Innovator Founder Visa
business plan as follows:

Section 1: Business Model Overview
  - Include high-level supply chain summary (UK suppliers, resilience score)
  - Emphasize UK economic contribution through local supplier relationships
  - Highlight post-Brexit compliance and operational readiness

Section 2: Operations Plan (Dedicated Supply Chain Sub-section)
  - Insert complete supplier network analysis
  - Include visual supply chain diagram (create using this data)
  - Document logistics routes and delivery capabilities
  - Explain inventory management approach

Section 3: Risk Management
  - Copy supplier risk matrix analysis
  - Detail mitigation strategies for high-risk suppliers
  - Demonstrate business continuity planning

Section 4: Financial Projections
  - Integrate detailed cost breakdown into P&L forecasts
  - Show supply chain costs as % of revenue (typically 40-60% for product businesses)
  - Include working capital requirements in cash flow projections

Section 5: Appendices
  - Supplier agreements or letters of intent
  - UK compliance certificates (UKCA, ISO, trade licenses)
  - Logistics carrier agreements or quotes
  - This comprehensive supply chain analysis report

Key Messages for Endorsing Body:
1. "Our supply chain demonstrates operational viability through ${ukSuppliers} UK supplier${ukSuppliers !== 1 ? 's' : ''} 
   and ${Math.round((ukCompliantSuppliers / suppliers.length) * 100)}% UK regulatory compliance"
   
2. "We have achieved a ${resilienceScore}% supply chain resilience score through supplier diversification,
   risk mitigation planning, and ${logistics.length} established logistics route${logistics.length !== 1 ? 's' : ''}"
   
3. "Post-Brexit compliance is embedded in our operations with UKCA-certified suppliers,
   customs broker relationships, and UK-based warehousing strategy"

NEXT STEPS FOR VISA APPLICATION SUCCESS
${'-'.repeat(85)}

Immediate Actions (This Week):
1. Review all red-flagged items in compliance checklist above
2. Reach out to UK Trade Partnerships (gov.uk/trade-tariff-tool) to verify tariffs
3. Contact 2-3 UK-based suppliers in your industry for partnership discussions
4. Obtain quotes from UK customs brokers (e.g., Shapiro, Flexport, CH Robinson UK)

Short-term Actions (Next 2-4 Weeks):
5. Complete supplier audit and collect all compliance certificates
6. Create professional supply chain visualization diagram (use Lucidchart/Canva)
7. Negotiate written supplier agreements or letters of intent
8. Update financial projections with granular supply chain costs from this analysis

Medium-term Actions (Before Visa Application):
9. Achieve minimum 60% supply chain resilience score (75%+ for strong application)
10. Establish at least one UK supplier relationship with documentation
11. Build 4-week inventory safety stock for critical items
12. Document all supply chain processes in SOPs for operations manual

Documentation Checklist for Submission:
[ ] This supply chain resilience analysis report (current document)
[ ] Visual supply chain diagram showing end-to-end flow
[ ] Supplier agreements (minimum 2, including 1 UK-based if possible)
[ ] UK compliance certificates (UKCA, CE, ISO as applicable)
[ ] Logistics carrier quotes or agreements
[ ] Customs broker engagement letter (if using international suppliers)
[ ] Inventory management process documentation
[ ] Risk mitigation plan for all high-risk suppliers
[ ] Financial integration showing supply chain in P&L and cash flow

${'-'.repeat(85)}
REPORT GENERATED BY: UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
${'-'.repeat(85)}

DISCLAIMER: This analysis is for business planning purposes and does not constitute
legal or immigration advice. Consult with a qualified immigration solicitor and
endorsing body for specific visa application guidance.

Recommended Next Step: Schedule consultation with endorsing body to review this
supply chain documentation as part of your business viability assessment.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-resilience-analysis-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-supply-chain">Supply Chain Management</h1>
            <p className="text-lg text-muted-foreground">Map suppliers, assess risks, plan contingencies, and track performance for UK visa compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="supply-chain"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Supply Chain Management"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-supply-chain">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="suppliers" data-testid="tab-suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
              <TabsTrigger value="logistics" data-testid="tab-logistics">Logistics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card data-testid="card-resilience-score">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Resilience Score</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-resilience-score">{resilienceScore}%</p>
                      <Progress value={resilienceScore} className="mt-2" data-testid="progress-resilience" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-suppliers">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Suppliers</p>
                      <p className="text-3xl font-bold" data-testid="text-total-suppliers">{suppliers.length}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="secondary" data-testid="badge-uk-suppliers">
                          <MapPin className="h-3 w-3 mr-1" />
                          UK: {ukSuppliers}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={highRiskSuppliers > 0 ? "border-destructive" : "border-green-500"} data-testid="card-high-risk">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">High Risk</p>
                      <p className="text-3xl font-bold" data-testid="text-high-risk-suppliers">{highRiskSuppliers}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {highRiskSuppliers === 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-low-risk" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" data-testid="icon-high-risk" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-avg-lead-time">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Avg Lead Time</p>
                      <p className="text-3xl font-bold" data-testid="text-avg-lead-time">{avgLeadTime}</p>
                      <p className="text-sm text-muted-foreground mt-2">days</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-supply-chain-health">
                  <CardHeader>
                    <CardTitle>Supply Chain Health</CardTitle>
                    <CardDescription>Key performance indicators for UK visa compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">UK Compliance</span>
                        <span className="text-sm text-muted-foreground" data-testid="text-uk-compliance">{ukCompliantSuppliers}/{suppliers.length}</span>
                      </div>
                      <Progress value={(ukCompliantSuppliers / Math.max(suppliers.length, 1)) * 100} data-testid="progress-uk-compliance" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Average Reliability</span>
                        <span className="text-sm text-muted-foreground" data-testid="text-avg-reliability">{avgReliability}%</span>
                      </div>
                      <Progress value={avgReliability} data-testid="progress-avg-reliability" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Inventory Health</span>
                        <span className="text-sm text-muted-foreground" data-testid="text-inventory-health">{inventory.length - lowStockItems}/{inventory.length}</span>
                      </div>
                      <Progress value={((inventory.length - lowStockItems) / Math.max(inventory.length, 1)) * 100} data-testid="progress-inventory-health" />
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-quick-stats">
                  <CardHeader>
                    <CardTitle>Operational Metrics</CardTitle>
                    <CardDescription>Financial and logistics overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Inventory Value</span>
                        </div>
                        <span className="font-semibold" data-testid="text-inventory-value">£{totalInventoryValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Logistics Routes</span>
                        </div>
                        <span className="font-semibold" data-testid="text-logistics-routes">{logistics.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Low Stock Items</span>
                        </div>
                        <span className="font-semibold" data-testid="text-low-stock-items">{lowStockItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Backup Suppliers</span>
                        </div>
                        <span className="font-semibold" data-testid="text-backup-suppliers">{suppliers.filter(s => s.type === 'backup').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-risk-matrix-overview">
                  <CardHeader>
                    <CardTitle>Supplier Risk Matrix</CardTitle>
                    <CardDescription>Lead time vs reliability scatter analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supplierRiskMatrix.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Lead Time"
                            domain={[0, 'dataMax + 5']}
                            label={{ value: 'Lead Time (days)', position: 'insideBottom', offset: -15, fill: 'hsl(var(--foreground))' }}
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Unreliability"
                            domain={[0, 100]}
                            label={{ value: 'Unreliability %', angle: -90, position: 'insideLeft', offset: -5, fill: 'hsl(var(--foreground))' }}
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'High Risk Threshold', position: 'right', fill: 'hsl(var(--foreground))' }} />
                          <ReferenceLine x={30} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Long Lead Time', position: 'top', fill: 'hsl(var(--foreground))' }} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-3 shadow-lg" data-testid="tooltip-risk-matrix">
                                    <p className="font-semibold" data-testid="tooltip-supplier-name">{data.name}</p>
                                    <p className="text-sm" data-testid="tooltip-location">Location: {data.location}</p>
                                    <p className="text-sm" data-testid="tooltip-lead-time">Lead Time: {data.x} days</p>
                                    <p className="text-sm" data-testid="tooltip-reliability">Reliability: {100 - data.y}%</p>
                                    <p className="text-sm capitalize" data-testid="tooltip-risk">Risk: {data.riskLevel}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter name="Suppliers" data={supplierRiskMatrix} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-risk-data">Add suppliers to see risk matrix</p>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-inventory-status-overview">
                  <CardHeader>
                    <CardTitle>Inventory Status Overview</CardTitle>
                    <CardDescription>Current stock levels across all items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inventoryStatus.length > 0 && inventoryStatus.some(i => i.max > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={inventoryStatus} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={80}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ value: 'Stock Level (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-3 shadow-lg" data-testid="tooltip-inventory">
                                    <p className="font-semibold" data-testid="tooltip-item-name">{data.name}</p>
                                    <p className="text-sm" data-testid="tooltip-current-stock">Current: {data.current} units</p>
                                    <p className="text-sm" data-testid="tooltip-max-stock">Max: {data.max} units</p>
                                    <p className="text-sm capitalize" data-testid="tooltip-status" style={{ color: data.statusColor }}>
                                      Status: {data.status}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="stockLevel" name="Stock Level %">
                            {inventoryStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.statusColor} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-inventory-data">Add inventory items with max stock values to see status</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {resilienceScore < 50 && (
                <Alert variant="destructive" data-testid="alert-low-resilience">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your supply chain resilience score is below 50%. Consider diversifying suppliers, improving UK compliance, and establishing backup sourcing options before submitting your visa application.
                  </AlertDescription>
                </Alert>
              )}

              {resilienceScore >= 75 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-high-resilience">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent supply chain resilience! Your operational planning demonstrates strong capability for UK visa endorsement. Document this thoroughly in your business plan.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Supplier Network</CardTitle>
                      <CardDescription>Manage your supplier relationships and UK compliance status</CardDescription>
                    </div>
                    <Button onClick={addSupplier} data-testid="button-add-supplier">
                      Add Supplier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id} className="p-4" data-testid={`card-supplier-${supplier.id}`}>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`supplier-name-${supplier.id}`}>Supplier Name</Label>
                            <Input
                              id={`supplier-name-${supplier.id}`}
                              value={supplier.name}
                              onChange={(e) => updateSupplier(supplier.id, 'name', e.target.value)}
                              placeholder="e.g., ABC Manufacturing Ltd"
                              data-testid={`input-supplier-name-${supplier.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`supplier-type-${supplier.id}`}>Type</Label>
                            <select
                              id={`supplier-type-${supplier.id}`}
                              value={supplier.type}
                              onChange={(e) => updateSupplier(supplier.id, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-supplier-type-${supplier.id}`}
                            >
                              <option value="primary">Primary</option>
                              <option value="secondary">Secondary</option>
                              <option value="tertiary">Tertiary</option>
                              <option value="backup">Backup</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`supplier-location-${supplier.id}`}>Location</Label>
                            <select
                              id={`supplier-location-${supplier.id}`}
                              value={supplier.location}
                              onChange={(e) => updateSupplier(supplier.id, 'location', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-supplier-location-${supplier.id}`}
                            >
                              <option value="uk">UK</option>
                              <option value="eu">EU</option>
                              <option value="asia">Asia</option>
                              <option value="americas">Americas</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-4">
                          <div>
                            <Label htmlFor={`supplier-leadtime-${supplier.id}`}>Lead Time (days)</Label>
                            <Input
                              id={`supplier-leadtime-${supplier.id}`}
                              type="number"
                              value={supplier.leadTime}
                              onChange={(e) => updateSupplier(supplier.id, 'leadTime', parseInt(e.target.value) || 0)}
                              data-testid={`input-supplier-leadtime-${supplier.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`supplier-reliability-${supplier.id}`}>Reliability (%)</Label>
                            <Input
                              id={`supplier-reliability-${supplier.id}`}
                              type="number"
                              value={supplier.reliability}
                              onChange={(e) => updateSupplier(supplier.id, 'reliability', parseInt(e.target.value) || 0)}
                              min="0"
                              max="100"
                              data-testid={`input-supplier-reliability-${supplier.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`supplier-risk-${supplier.id}`}>Risk Level</Label>
                            <select
                              id={`supplier-risk-${supplier.id}`}
                              value={supplier.riskLevel}
                              onChange={(e) => updateSupplier(supplier.id, 'riskLevel', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-supplier-risk-${supplier.id}`}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`supplier-cost-${supplier.id}`}>Cost/Unit (£)</Label>
                            <Input
                              id={`supplier-cost-${supplier.id}`}
                              type="number"
                              value={supplier.costPerUnit}
                              onChange={(e) => updateSupplier(supplier.id, 'costPerUnit', parseFloat(e.target.value) || 0)}
                              data-testid={`input-supplier-cost-${supplier.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`supplier-minorder-${supplier.id}`}>Min Order</Label>
                            <Input
                              id={`supplier-minorder-${supplier.id}`}
                              type="number"
                              value={supplier.minOrder}
                              onChange={(e) => updateSupplier(supplier.id, 'minOrder', parseInt(e.target.value) || 0)}
                              data-testid={`input-supplier-minorder-${supplier.id}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`supplier-description-${supplier.id}`}>Description</Label>
                          <Textarea
                            id={`supplier-description-${supplier.id}`}
                            value={supplier.description}
                            onChange={(e) => updateSupplier(supplier.id, 'description', e.target.value)}
                            placeholder="Brief description of products/services supplied"
                            rows={2}
                            data-testid={`textarea-supplier-description-${supplier.id}`}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={supplier.ukCompliant}
                              onChange={(e) => updateSupplier(supplier.id, 'ukCompliant', e.target.checked)}
                              className="h-4 w-4"
                              data-testid={`checkbox-uk-compliant-${supplier.id}`}
                            />
                            <span className="text-sm">UK Compliant (UKCA, trade standards)</span>
                          </label>
                          {suppliers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSupplier(supplier.id)}
                              data-testid={`button-remove-supplier-${supplier.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-supplier-performance">
                  <CardHeader>
                    <CardTitle>Supplier Performance Comparison</CardTitle>
                    <CardDescription>Reliability metrics across all suppliers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supplierPerformanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={supplierPerformanceData} margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={100}
                            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            label={{ value: 'Reliability %', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="reliability" fill="#10b981" name="Reliability %" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-performance-data">Add suppliers to see performance comparison</p>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-supplier-distribution">
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Supplier locations and diversification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {suppliersByLocation.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={suppliersByLocation}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {suppliersByLocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-distribution-data">Add suppliers to see geographic distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inventory Management</CardTitle>
                      <CardDescription>Track stock levels, reorder points, and holding costs</CardDescription>
                    </div>
                    <Button onClick={addInventoryItem} data-testid="button-add-inventory">
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inventory.map((item) => (
                    <Card key={item.id} className="p-4" data-testid={`card-inventory-${item.id}`}>
                      <div className="grid md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`inventory-name-${item.id}`}>Item Name</Label>
                          <Input
                            id={`inventory-name-${item.id}`}
                            value={item.name}
                            onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                            placeholder="e.g., Component A"
                            data-testid={`input-inventory-name-${item.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventory-current-${item.id}`}>Current Stock</Label>
                          <Input
                            id={`inventory-current-${item.id}`}
                            type="number"
                            value={item.currentStock}
                            onChange={(e) => updateInventoryItem(item.id, 'currentStock', parseInt(e.target.value) || 0)}
                            data-testid={`input-inventory-current-${item.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventory-reorder-${item.id}`}>Reorder Point</Label>
                          <Input
                            id={`inventory-reorder-${item.id}`}
                            type="number"
                            value={item.reorderPoint}
                            onChange={(e) => updateInventoryItem(item.id, 'reorderPoint', parseInt(e.target.value) || 0)}
                            data-testid={`input-inventory-reorder-${item.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventory-max-${item.id}`}>Max Stock</Label>
                          <Input
                            id={`inventory-max-${item.id}`}
                            type="number"
                            value={item.maxStock}
                            onChange={(e) => updateInventoryItem(item.id, 'maxStock', parseInt(e.target.value) || 0)}
                            data-testid={`input-inventory-max-${item.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventory-cost-${item.id}`}>Weekly Cost (£)</Label>
                          <Input
                            id={`inventory-cost-${item.id}`}
                            type="number"
                            value={item.weeklyCost}
                            onChange={(e) => updateInventoryItem(item.id, 'weeklyCost', parseFloat(e.target.value) || 0)}
                            data-testid={`input-inventory-cost-${item.id}`}
                          />
                        </div>
                        {inventory.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInventoryItem(item.id)}
                            data-testid={`button-remove-inventory-${item.id}`}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Logistics Routes</CardTitle>
                      <CardDescription>Define transportation, distribution channels, and UK delivery routes</CardDescription>
                    </div>
                    <Button onClick={addLogisticsRoute} data-testid="button-add-logistics">
                      Add Route
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {logistics.map((route) => (
                    <Card key={route.id} className="p-4" data-testid={`card-logistics-${route.id}`}>
                      <div className="grid md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`logistics-origin-${route.id}`}>Origin</Label>
                          <Input
                            id={`logistics-origin-${route.id}`}
                            value={route.origin}
                            onChange={(e) => updateLogisticsRoute(route.id, 'origin', e.target.value)}
                            placeholder="e.g., Shanghai, China"
                            data-testid={`input-logistics-origin-${route.id}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`logistics-destination-${route.id}`}>Destination</Label>
                          <Input
                            id={`logistics-destination-${route.id}`}
                            value={route.destination}
                            onChange={(e) => updateLogisticsRoute(route.id, 'destination', e.target.value)}
                            placeholder="e.g., London, UK"
                            data-testid={`input-logistics-destination-${route.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`logistics-method-${route.id}`}>Method</Label>
                          <select
                            id={`logistics-method-${route.id}`}
                            value={route.method}
                            onChange={(e) => updateLogisticsRoute(route.id, 'method', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-logistics-method-${route.id}`}
                          >
                            <option value="air">Air</option>
                            <option value="sea">Sea</option>
                            <option value="road">Road</option>
                            <option value="rail">Rail</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`logistics-days-${route.id}`}>Avg Days</Label>
                          <Input
                            id={`logistics-days-${route.id}`}
                            type="number"
                            value={route.avgDays}
                            onChange={(e) => updateLogisticsRoute(route.id, 'avgDays', parseInt(e.target.value) || 0)}
                            data-testid={`input-logistics-days-${route.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`logistics-cost-${route.id}`}>Cost (£)</Label>
                          <Input
                            id={`logistics-cost-${route.id}`}
                            type="number"
                            value={route.costPerShipment}
                            onChange={(e) => updateLogisticsRoute(route.id, 'costPerShipment', parseFloat(e.target.value) || 0)}
                            data-testid={`input-logistics-cost-${route.id}`}
                          />
                        </div>
                        {logistics.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLogisticsRoute(route.id)}
                            data-testid={`button-remove-logistics-${route.id}`}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card data-testid="card-logistics-by-method">
                <CardHeader>
                  <CardTitle>Logistics Cost Analysis</CardTitle>
                  <CardDescription>Average cost per transport method</CardDescription>
                </CardHeader>
                <CardContent>
                  {logisticsByMethod.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={logisticsByMethod} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="method" 
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <YAxis 
                          label={{ value: 'Average Cost (£)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <Tooltip 
                          formatter={(value: number) => `£${Math.round(value).toLocaleString()}`}
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="avgCost" name="Avg Cost (£)">
                          {logisticsByMethod.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12" data-testid="text-no-logistics-data">Add logistics routes to see cost analysis</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips based on your supply chain configuration and UK visa requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Implementation Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for supply chain optimization and UK visa preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4" data-testid={`card-action-${index}`}>
                        <div className="flex items-start gap-4">
                          <Badge 
                            variant={item.priority === 'Critical' ? 'destructive' : 'secondary'}
                            data-testid={`badge-priority-${index}`}
                          >
                            {item.priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-semibold mb-1" data-testid={`text-action-week-${index}`}>{item.week}</p>
                            <p className="text-sm mb-2" data-testid={`text-action-description-${index}`}>{item.action}</p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-action-requirement-${index}`}>
                              UK Requirement: {item.ukRequirement}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
