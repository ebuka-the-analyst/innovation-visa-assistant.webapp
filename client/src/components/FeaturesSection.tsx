import { Card } from "@/components/ui/card";
import { Brain, Shield, Rocket, Clock, FileCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import FeaturesModal from "./FeaturesModal";

const features = [
  {
    id: "ai-intelligence",
    icon: Brain,
    title: "Managed AI Assistance",
    description: "Managed AI infrastructure supports OpenAI and Anthropic models to help draft and review business-planning content.",
    color: "from-primary to-chart-1",
  },
  {
    id: "endorsing-ready",
    icon: Shield,
    title: "Endorsement-Criteria Structure",
    description: "Organises preparation around published Innovator Founder requirements and publicly available endorsing-body information.",
    color: "from-chart-4 to-chart-2",
  },
  {
    id: "scalability-focus",
    icon: Rocket,
    title: "Scalability Focus",
    description: "Helps document structured growth planning, market expansion and potential job creation where relevant to your business.",
    color: "from-chart-3 to-chart-5",
  },
  {
    id: "fifteen-minute",
    icon: Clock,
    title: "AI-Assisted Drafting",
    description: "Turns structured questionnaire responses into editable planning drafts. Generation time varies with plan depth and system load.",
    color: "from-chart-2 to-chart-3",
  },
  {
    id: "compliance",
    icon: FileCheck,
    title: "Compliance-Focused Checks",
    description: "Flags potential gaps against configured Innovation, Viability and Scalability checks without guaranteeing legal or visa compliance.",
    color: "from-chart-5 to-chart-4",
  },
  {
    id: "financial",
    icon: TrendingUp,
    title: "Financial Projections",
    description: "Builds scenario-based forecasts from your assumptions so you can review and refine the financial case for your venture.",
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
        <div className="responsive-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-xl font-bold mb-6">Tools for Evidence-Led Preparation</h2>
            <p className="text-lg text-muted-foreground">
              Practical tools designed to help founders organise, draft and review Innovator Founder application-preparation materials.
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
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FeaturesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} featureId={selectedFeatureId} />
    </>
  );
}
