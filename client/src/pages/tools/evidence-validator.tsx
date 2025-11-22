import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, Star } from "lucide-react";

const EVIDENCE_TYPES = [
  {category:"Innovation Evidence",quality:"PhD-Level",items:[
    {type:"Patent Application",requirement:"Submitted to UKIPO or international patent office",scoring:"High weight - demonstrates IP"},
    {type:"Technical Architecture",requirement:"System design documents, tech stack rationale",scoring:"Medium-High - shows technical depth"},
    {type:"IP Assignments",requirement:"Evidence all IP transferred to company",scoring:"Medium - required but standard"},
    {type:"Competitive Analysis",requirement:"Detailed comparison with existing solutions",scoring:"Medium - shows market awareness"}
  ]},
  {category:"Viability Evidence",quality:"PhD-Level",items:[
    {type:"Customer Validation",requirement:"Written LOIs from 3+ potential customers",scoring:"High weight - validates demand"},
    {type:"Revenue Model",requirement:"Detailed unit economics and pricing strategy",scoring:"High - shows commercialization"},
    {type:"Market Research",requirement:"TAM/SAM/SOM with credible sources (Gartner, IDC)",scoring:"High - demonstrates market sizing"},
    {type:"Financial Projections",requirement:"3-year P&L with assumptions documented",scoring:"Medium-High - shows financial planning"}
  ]},
  {category:"Scalability Evidence",quality:"PhD-Level",items:[
    {type:"Growth Plan",requirement:"Detailed 3-year growth strategy and milestones",scoring:"High - demonstrates ambition"},
    {type:"Team Recruitment Plan",requirement:"Hiring roadmap showing skills gaps to fill",scoring:"Medium-High - shows scaling capability"},
    {type:"Infrastructure Plan",requirement:"Technical/operational scalability assessment",scoring:"Medium - shows readiness"},
    {type:"Geographic Expansion",requirement:"International markets identified and prioritized",scoring:"Medium - shows global thinking"}
  ]},
  {category:"Team Evidence",quality:"PhD-Level",items:[
    {type:"Founder CVs",requirement:"Highlight: prior exits, domain expertise, startup experience",scoring:"High - crucial for credibility"},
    {type:"Team Skills Matrix",requirement:"Show complementary skills across technical/business",scoring:"Medium - demonstrates team balance"},
    {type:"Advisory Board",requirement:"List advisors with credentials and commitment level",scoring:"Medium-High - adds credibility"},
    {type:"References",requirement:"Professional references from prior investors/partners",scoring:"Medium - validates track record"}
  ]}
];

export default function EvidenceValidator() {
  const [qualityRatings, setQualityRatings] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = EVIDENCE_TYPES.reduce((sum, c) => sum + c.items.length, 0);
  const providedItems = Object.keys(qualityRatings).filter(k => qualityRatings[k] > 0).length;
  const avgQuality = providedItems > 0 ? Math.round(Object.values(qualityRatings).reduce((sum: number, v: any) => sum + v, 0) / providedItems * 100) : 0;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Evidence Validator</h1>
          <p className="text-muted-foreground mb-6">PhD-level evidence quality assessment for visa application</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Quality Score</TabsTrigger>
              <TabsTrigger value="validation">Evidence Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Average Quality</p>
                  <p className="text-4xl font-bold mt-2">{avgQuality}%</p>
                  <p className="text-xs mt-2">{providedItems}/{totalItems} types provided</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Evidence Strength</p>
                  <p className={`text-2xl font-bold ${avgQuality>=80?"text-green-600":avgQuality>=60?"text-yellow-600":"text-red-600"}`}>
                    {avgQuality>=80?"Strong":avgQuality>=60?"Fair":"Weak"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Visa Impact</p>
                  <p className={`text-sm font-bold ${avgQuality>=80?"text-green-600":"text-orange-600"}`}>
                    {avgQuality>=80?"Highly likely approved":"Review before submitting"}
                  </p>
                </Card>
              </div>

              {avgQuality >= 80 && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    ✓ Your evidence package is PhD-level quality. Strong competitive advantage in visa assessment.
                  </AlertDescription>
                </Alert>
              )}
              {avgQuality < 80 && avgQuality >= 60 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Your evidence is adequate but has gaps. Strengthen weaker areas before submission.
                  </AlertDescription>
                </Alert>
              )}
              {avgQuality < 60 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Evidence package needs significant strengthening. Delay submission until stronger.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {EVIDENCE_TYPES.map((cat, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{cat.category}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                      <Star className="w-3 h-3" /> {cat.quality}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cat.items.map((item, j) => (
                      <div key={j} className="border border-gray-200 p-3 rounded">
                        <p className="font-semibold text-sm mb-2">{item.type}</p>
                        <p className="text-xs text-muted-foreground mb-2">{item.requirement}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Quality:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(stars => (
                              <button
                                key={stars}
                                onClick={() => setQualityRatings({...qualityRatings,[`${cat.category}-${item.type}`]:stars})}
                                className={`text-lg ${qualityRatings[`${cat.category}-${item.type}`] >= stars ? "text-yellow-500":"text-gray-300"}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">💡 {item.scoring}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Evidence Quality Report
          </Button>
        </div>
      </div>
    </>
  );
}
