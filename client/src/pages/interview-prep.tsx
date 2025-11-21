import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, BookOpen, Award } from "lucide-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";

const interviewScenarios = [
  {
    id: 1,
    question: "Can you walk us through your competitive differentiation?",
    context: "Tech Nation Interview",
    category: "Innovation",
    keyPoints: [
      "Be specific - avoid generic claims",
      "Cite market research or customer validation",
      "Explain the technical or market barrier to entry",
      "Connect to TAM/SAM/SOM"
    ],
    bestPractices: [
      "Start with the problem, not the solution",
      "Quantify your advantage where possible",
      "Explain why competitors haven't solved this",
      "Show evidence (patents, partnerships, customer traction)"
    ]
  },
  {
    id: 2,
    question: "How will you achieve profitability and when?",
    context: "Financial Viability",
    category: "Viability",
    keyPoints: [
      "Be realistic with timelines",
      "Show understanding of unit economics",
      "Explain customer acquisition strategy",
      "Demonstrate financial discipline"
    ],
    bestPractices: [
      "Reference your financial model",
      "Show CAC payback analysis",
      "Discuss path to cash flow positive",
      "Address burn rate management"
    ]
  },
  {
    id: 3,
    question: "How many jobs will you create and by when?",
    context: "Scalability",
    category: "Scalability",
    keyPoints: [
      "Meet minimum (3-5 jobs in 3 years)",
      "Link hiring to revenue/growth",
      "Show skill diversity",
      "Explain UK economic contribution"
    ],
    bestPractices: [
      "Present hiring roadmap by quarter",
      "Show salary levels (demonstrate real jobs)",
      "Explain roles and their impact",
      "Connect to business milestones"
    ]
  },
  {
    id: 4,
    question: "What is your relevant experience for this business?",
    context: "Founder Credentials",
    category: "Credentials",
    keyPoints: [
      "Show domain expertise",
      "Highlight relevant achievements",
      "Explain why you're uniquely positioned",
      "Show learning from past ventures"
    ],
    bestPractices: [
      "Tell a coherent narrative",
      "Quantify past achievements",
      "Show progression/growth",
      "Address any gaps honestly"
    ]
  },
  {
    id: 5,
    question: "Who are your key advisors and what's their role?",
    context: "Advisory Board",
    category: "Team",
    keyPoints: [
      "Showcase credible advisors",
      "Show diversity of expertise",
      "Explain their specific contributions",
      "Demonstrate active engagement"
    ],
    bestPractices: [
      "Name specific achievements of advisors",
      "Show how they add value",
      "Reference their network/connections",
      "Explain selection criteria"
    ]
  }
];

const endorserTips = {
  "Tech Nation": [
    "Emphasize innovation and technology differentiation",
    "Show clear IP or proprietary technology",
    "Demonstrate R&D commitment (10%+ spend)",
    "Reference relevant technology trends",
    "Highlight scalability potential"
  ],
  "Innovator International": [
    "Show market validation and customer traction",
    "Emphasize business model innovation",
    "Demonstrate financial projections",
    "Show founder-market fit",
    "Reference sector trends and opportunities"
  ],
  "University": [
    "Connect to research and academic excellence",
    "Show publication or research backing",
    "Emphasize knowledge commercialization",
    "Reference academic partnerships",
    "Highlight knowledge transfer to industry"
  ]
};

export default function InterviewPrep() {
  const [selectedScenario, setSelectedScenario] = useState(interviewScenarios[0]);
  const [selectedEndorser, setSelectedEndorser] = useState<string>("Tech Nation");

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">LAUNCHPAD MENTORSHIP</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Interview Prep & AI Coaching</h1>
            <p className="text-lg text-muted-foreground">
              AI-augmented mentorship platform. Practice with realistic endorser scenarios, receive granular feedback on defensibility and positioning, and refine your pitch with expert coaching.
            </p>
          </div>

          <Tabs defaultValue="scenarios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scenarios">Mock Scenarios</TabsTrigger>
              <TabsTrigger value="tips">Endorser Tips</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  {interviewScenarios.map(scenario => (
                    <Card
                      key={scenario.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedScenario.id === scenario.id
                          ? "border-primary bg-primary/5"
                          : "hover-elevate"
                      }`}
                      onClick={() => setSelectedScenario(scenario)}
                      data-testid={`card-scenario-${scenario.id}`}
                    >
                      <p className="font-medium text-sm">{scenario.question}</p>
                      <p className="text-xs text-muted-foreground mt-2">{scenario.context}</p>
                    </Card>
                  ))}
                </div>

                <div className="md:col-span-2">
                  <Card className="p-8">
                    <div className="mb-6">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {selectedScenario.category}
                      </span>
                      <h3 className="text-xl font-semibold mt-4 mb-2">{selectedScenario.question}</h3>
                      <p className="text-sm text-muted-foreground">{selectedScenario.context}</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Key Points to Address
                        </h4>
                        <ul className="space-y-2">
                          {selectedScenario.keyPoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary font-semibold">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Best Practices
                        </h4>
                        <ul className="space-y-2">
                          {selectedScenario.bestPractices.map((practice, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary font-semibold">•</span>
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full gap-2" data-testid="button-record-response">
                        <Play className="w-4 h-4" />
                        Record Your Response
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(endorserTips).map(([endorser, tips]) => (
                  <Card
                    key={endorser}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedEndorser === endorser
                        ? "border-primary bg-primary/5"
                        : "hover-elevate"
                    }`}
                    onClick={() => setSelectedEndorser(endorser)}
                    data-testid={`card-endorser-${endorser.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <h3 className="font-semibold mb-4">{endorser}</h3>
                    <ul className="space-y-2">
                      {tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary flex-shrink-0">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card className="p-8">
                <h3 className="font-semibold text-lg mb-4">Interview Preparation Resources</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Common Mistakes to Avoid</p>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Being too vague about your competitive advantage</li>
                      <li>• Presenting unrealistic financial projections</li>
                      <li>• Lacking knowledge of your market</li>
                      <li>• Not preparing for technical questions</li>
                      <li>• Overstating team credentials</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">What Endorsers Want to See</p>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Confidence and clarity in your vision</li>
                      <li>• Evidence-based claims</li>
                      <li>• Understanding of your market landscape</li>
                      <li>• Realistic but ambitious growth plans</li>
                      <li>• Demonstrated founder-market fit</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
