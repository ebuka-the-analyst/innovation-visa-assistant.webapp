import { Card } from "@/components/ui/card";
import { Brain, Shield, Rocket, Clock, FileCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import FeaturesModal from "./FeaturesModal";

const features = [
  {
    id: "ai-intelligence",
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced GPT-4 technology generates tailored content specific to your business and industry",
    color: "from-primary to-chart-1",
  },
  {
    id: "endorsing-ready",
    icon: Shield,
    title: "Endorsing Body Ready",
    description: "Formatted specifically for UK endorsing bodies like Tech Nation and Innovate UK",
    color: "from-chart-4 to-chart-2",
  },
  {
    id: "scalability-focus",
    icon: Rocket,
    title: "Scalability Focus",
    description: "Demonstrates clear growth potential and job creation plans required for approval",
    color: "from-chart-3 to-chart-5",
  },
  {
    id: "five-minute",
    icon: Clock,
    title: "5-Minute Generation",
    description: "Complete business plans generated in minutes, not weeks of manual work",
    color: "from-chart-2 to-chart-3",
  },
  {
    id: "compliance",
    icon: FileCheck,
    title: "Compliance Guaranteed",
    description: "Covers all three criteria: Innovation, Viability, and Scalability",
    color: "from-chart-5 to-chart-4",
  },
  {
    id: "financial",
    icon: TrendingUp,
    title: "Financial Projections",
    description: "Detailed 3-year forecasts with realistic assumptions and market analysis",
    color: "from-primary to-chart-3",
  },
];

export default function FeaturesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | undefined>();

  const handleOpenModal = (featureId: string) => {
    setSelectedFeatureId(featureId);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive features designed specifically for UK Innovator Founder Visa applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.id}
                className="p-8 hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                onClick={() => handleOpenModal(feature.id)}
                data-testid={`card-feature-${index}`}
              >
                {/* Holographic gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Modal */}
      <FeaturesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        featureId={selectedFeatureId}
      />
    </>
  );
}
