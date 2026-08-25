import { motion } from "framer-motion";
import {
  Brain,
  Mic,
  Users,
  Scale,
  LineChart,
  Network,
  Volume2,
  Sparkles,
  ArrowRight,
  Zap,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const features = [
  {
    id: "oracle",
    name: "ORACLE Supervisor",
    description: "Coordinates specialist AI tools for structured application-preparation analysis",
    icon: Crown,
    color: "#d946ef",
    gradient: "from-purple-500 to-pink-500",
    href: "/oracle-supervisor"
  },
  {
    id: "autopilot",
    name: "Founder Autopilot",
    description: "Voice-assisted workflow that helps draft and organise application-preparation materials",
    icon: Mic,
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-500",
    href: "/founder-autopilot"
  },
  {
    id: "neural-twin",
    name: "Neural Twin",
    description: "Simulates possible reviewer questions and highlights areas that may need stronger evidence",
    icon: Users,
    color: "#3b82f6",
    gradient: "from-blue-500 to-cyan-500",
    href: "/neural-twin"
  },
  {
    id: "regulatory",
    name: "Regulatory Copilot",
    description: "Tracks selected official GOV.UK Innovator Founder updates for review",
    icon: Scale,
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    href: "/regulatory-copilot"
  },
  {
    id: "economic",
    name: "Economic Impact",
    description: "Helps estimate and document potential UK economic contribution using your assumptions",
    icon: LineChart,
    color: "#06b6d4",
    gradient: "from-[#41B6E6] to-[#0072CE]",
    href: "/economic-impact"
  },
  {
    id: "knowledge",
    name: "Knowledge Graph",
    description: "Visual map connecting saved evidence to published route criteria and preparation tasks",
    icon: Network,
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-500",
    href: "/knowledge-graph"
  },
  {
    id: "voice",
    name: "Voice Builder",
    description: "Turn spoken business information into structured planning drafts for review",
    icon: Volume2,
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-500",
    href: "/voice-builder"
  }
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link href={feature.href}>
        <div className="group relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${feature.color}20, transparent)` }} />

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{feature.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">NEW</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function AI2040Showcase() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="responsive-container md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">OMNI AI Tools</span>
          </div>

          <h2 className="font-serif text-xl lg:text-xl font-bold mb-6">
            Application Preparation{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-purple-500 bg-clip-text text-transparent">Intelligence</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialist AI-assisted tools help organise evidence, practise scenarios and review preparation materials without predicting endorsement or visa outcomes.
          </p>
        </motion.div>

        <div className="relative mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-purple-500/20 backdrop-blur-xl flex items-center justify-center border border-white/20">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-background/90 to-background/70 flex items-center justify-center border border-white/10">
                  <Brain className="w-12 h-12 md:w-14 md:h-14 text-primary" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" style={{ animationDuration: "3s" }} />
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="url(#showcase-gradient)" strokeWidth="2" strokeDasharray="8 4" className="animate-[spin_15s_linear_infinite]" />
                <defs>
                  <linearGradient id="showcase-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#005EB8" />
                    <stop offset="50%" stopColor="#41B6E6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          <div className="text-center mb-8">
            <h3 className="text-lg font-bold mb-2">ORACLE Workflow Coordinator</h3>
            <p className="text-muted-foreground">Coordinates supported AI tools across your preparation workflow</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => <FeatureCard key={feature.id} feature={feature} index={index} />)}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/oracle-supervisor">
            <Button size="lg" className="group gap-2">
              <Zap className="w-5 h-5" />
              Explore AI Command Center
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
