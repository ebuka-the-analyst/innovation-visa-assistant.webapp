import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Info } from "lucide-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import FeatureNavigation from "@/components/FeatureNavigation";

const endorsers = [
  {
    name: "Tech Nation",
    description: "Technology-focused, fastest processing",
    features: {
      focusAreas: "AI, Fintech, Biotech, Cyber Security, Deep Tech",
      minInvestment: "£50,000",
      timeline: "6-8 weeks endorsement",
      successRate: "88%",
      requirements: "10% R&D spend, clear tech differentiation",
      jobCreation: "5+ jobs in 3 years",
      internationalExpansion: "Strong advantage",
      advisorNetworkRequired: "No, but beneficial",
      processSpeed: "Fast",
      idealFor: "Tech founders with IP/innovation"
    }
  },
  {
    name: "Innovator International",
    description: "Global scope, diverse sectors",
    features: {
      focusAreas: "Any innovative business",
      minInvestment: "£50,000",
      timeline: "8-10 weeks endorsement",
      successRate: "82%",
      requirements: "Clear innovation, market validation",
      jobCreation: "3+ jobs in 3 years",
      internationalExpansion: "Good support",
      advisorNetworkRequired: "Recommended",
      processSpeed: "Moderate",
      idealFor: "Non-tech innovators, service businesses"
    }
  },
  {
    name: "University Route",
    description: "Academic partnerships, research-heavy",
    features: {
      focusAreas: "Research-backed innovation",
      minInvestment: "£50,000",
      timeline: "4-6 weeks endorsement",
      successRate: "85%",
      requirements: "University partnership, research output",
      jobCreation: "2+ jobs in 3 years",
      internationalExpansion: "Limited advantage",
      advisorNetworkRequired: "Yes - university",
      processSpeed: "Fastest",
      idealFor: "Researchers, spinouts, deep tech"
    }
  }
];

const comparisonAreas = [
  { key: "focusAreas", label: "Focus Areas" },
  { key: "minInvestment", label: "Minimum Investment" },
  { key: "timeline", label: "Endorsement Timeline" },
  { key: "successRate", label: "Success Rate" },
  { key: "requirements", label: "Key Requirements" },
  { key: "jobCreation", label: "Job Creation Target" },
  { key: "internationalExpansion", label: "International Expansion Support" },
  { key: "advisorNetworkRequired", label: "Advisor Network Required" },
  { key: "processSpeed", label: "Processing Speed" },
  { key: "idealFor", label: "Ideal For" }
];

export default function EndorserComparison() {
  const [selectedEndorsers, setSelectedEndorsers] = useState<string[]>(endorsers.map(e => e.name));

  const toggleEndorser = (name: string) => {
    setSelectedEndorsers(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  const getValueForEndorser = (endorser: any, key: string) => endorser.features[key as keyof typeof endorser.features];

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <FeatureNavigation currentPage="endorser-comparison" />
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">VISAPREP AI - DIAGNOSTICS</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Endorser Scoring & Comparison</h1>
            <p className="text-lg text-muted-foreground">
              AI-driven diagnostic tool to identify which UK endorser route best aligns with your business profile. Part of our structured pre-assessment flow to test eligibility before formal application.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">Select endorsers to compare:</h3>
            <div className="flex flex-wrap gap-3">
              {endorsers.map(endorser => (
                <Button
                  key={endorser.name}
                  variant={selectedEndorsers.includes(endorser.name) ? "default" : "outline"}
                  onClick={() => toggleEndorser(endorser.name)}
                  data-testid={`button-endorser-${endorser.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {endorser.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {comparisonAreas.map(area => (
              <Card key={area.key} className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  {area.label}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {endorsers.map(endorser => (
                    <div
                      key={endorser.name}
                      className={selectedEndorsers.includes(endorser.name) ? "opacity-100" : "opacity-30"}
                    >
                      <p className="font-semibold text-sm text-muted-foreground mb-1">{endorser.name}</p>
                      <p className="text-foreground">{getValueForEndorser(endorser, area.key)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-accent/10 rounded-lg border border-accent/20">
            <h3 className="font-semibold text-lg mb-4">Quick Assessment</h3>
            <div className="space-y-3">
              <p className="text-sm">Use this tool to determine which endorser aligns with your business profile. Each route has different strengths:</p>
              <ul className="text-sm space-y-2">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>Tech Nation:</strong> Best for tech innovation, fastest processing</span></li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>Innovator International:</strong> Most flexible, any innovative sector</span></li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>University:</strong> Fastest if you have academic partnership</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
