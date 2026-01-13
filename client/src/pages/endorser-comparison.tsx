import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Info } from "lucide-react";
import { useState } from "react";

import FeatureNavigation from "@/components/FeatureNavigation";

const endorsers = [
  {
    name: "Envestors",
    description: "Established endorsing body with investment network",
    website: "envestors-visa-endorsement.co.uk",
    features: {
      focusAreas: "All innovative sectors, investment-ready businesses",
      timeline: "6-8 weeks endorsement",
      successRate: "85%",
      requirements: "Viable business plan, innovation evidence, market validation",
      jobCreation: "Job creation aligned with visa requirements",
      internationalExpansion: "Strong investor network access",
      advisorNetworkRequired: "Access to investment community",
      processSpeed: "Fast",
      idealFor: "Investment-ready founders, scalable ventures"
    }
  },
  {
    name: "UKES",
    description: "UK Endorsing Services - consortium of 6 UK businesses",
    website: "ukesapp.co.uk",
    features: {
      focusAreas: "All innovative sectors, diverse business types",
      timeline: "6-10 weeks endorsement",
      successRate: "80%",
      requirements: "Innovation, scalability, UK economic benefit",
      jobCreation: "Clear job creation plan required",
      internationalExpansion: "75+ years combined expertise",
      advisorNetworkRequired: "Business mentorship available",
      processSpeed: "Moderate",
      idealFor: "First-time entrepreneurs, diverse backgrounds"
    }
  },
  {
    name: "Innovator International",
    description: "Supports 700+ global entrepreneurs",
    website: "innovatorinternational.com",
    features: {
      focusAreas: "Any innovative business globally",
      timeline: "8-10 weeks endorsement",
      successRate: "82%",
      requirements: "Clear innovation, market validation, growth potential",
      jobCreation: "3+ jobs in 3 years",
      internationalExpansion: "UK Growth Accelerator community",
      advisorNetworkRequired: "Recommended - accelerator access",
      processSpeed: "Moderate",
      idealFor: "Global entrepreneurs, non-tech innovators"
    }
  },
  {
    name: "GEP",
    description: "Global Entrepreneurs Programme - government-backed",
    website: "gov.uk",
    features: {
      focusAreas: "High-growth potential, tech and innovation",
      timeline: "4-8 weeks endorsement",
      successRate: "88%",
      requirements: "Exceptional talent, proven track record",
      jobCreation: "Significant UK job creation expected",
      internationalExpansion: "Government support and connections",
      advisorNetworkRequired: "Strong advisory network access",
      processSpeed: "Fast for eligible candidates",
      idealFor: "Serial entrepreneurs, proven founders"
    }
  }
];

const comparisonAreas = [
  { key: "focusAreas", label: "Focus Areas" },
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
      
      <div className="responsive-container py-16">
        <div className="max-w-6xl mx-auto">
          <FeatureNavigation currentPage="endorser-comparison" />
          <div className="mb-12">
            <h1 className="font-serif text-xl font-bold mb-4">Endorser Scoring & Comparison</h1>
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
            <h3 className="font-semibold text-lg mb-4">Quick Assessment (November 2025)</h3>
            <div className="space-y-3">
              <p className="text-sm">Use this tool to determine which endorser aligns with your business profile. Each endorsing body has different strengths:</p>
              <ul className="text-sm space-y-2">
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>Envestors:</strong> Best for investment-ready businesses, strong investor network</span></li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>UKES:</strong> Great for first-time entrepreneurs, diverse sector support</span></li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>Innovator International:</strong> Global focus, accelerator community access</span></li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span><strong>GEP:</strong> Government-backed, ideal for proven serial entrepreneurs</span></li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">Note: Endorsement fee is typically £1,000 per applicant. Contact point meetings cost £500 each (required at least twice during visa period).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
