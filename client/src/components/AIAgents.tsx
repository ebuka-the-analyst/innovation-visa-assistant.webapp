import { useState } from "react";
import novaAvatar from "@assets/generated_images/Nova_innovation_agent_avatar_e5dc5701.png";
import sterlingAvatar from "@assets/generated_images/Sterling_financial_agent_avatar_4fce3650.png";
import atlasAvatar from "@assets/generated_images/Atlas_growth_agent_avatar_a0808a5e.png";
import sageAvatar from "@assets/generated_images/Sage_compliance_agent_avatar_9dabb0a2.png";

const agents = [
  {
    id: "nova",
    name: "Nova",
    role: "Innovation Analyst",
    color: "from-[#11b6e9] to-[#0093d9]",
    avatar: novaAvatar,
    description: "Analyzes innovation criteria and market differentiation",
  },
  {
    id: "sterling",
    name: "Sterling",
    role: "Financial Strategist",
    color: "from-[#FFD700] to-[#FFA500]",
    avatar: sterlingAvatar,
    description: "Handles financial projections and viability assessment",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Growth Architect",
    color: "from-[#10B981] to-[#059669]",
    avatar: atlasAvatar,
    description: "Manages scalability planning and expansion strategy",
  },
  {
    id: "sage",
    name: "Sage",
    role: "Compliance Expert",
    color: "from-[#8B5CF6] to-[#7C3AED]",
    avatar: sageAvatar,
    description: "Ensures visa requirement compliance and formatting",
  },
];

export default function AIAgents() {
  const [activeAgent, setActiveAgent] = useState(0);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Meet Your AI <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">Expert Team</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four specialized AI agents work together to create your perfect business plan
          </p>
        </div>

        {/* Agent lineup */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12">
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className={`flex flex-col items-center gap-4 cursor-pointer transition-all duration-500 ${
                activeAgent === index ? "scale-125" : "scale-100 opacity-60 hover:opacity-100"
              }`}
              onClick={() => {
                setActiveAgent(index);
                console.log(`Agent ${agent.name} selected`);
              }}
              data-testid={`agent-${agent.id}`}
            >
              <div className="relative">
                {/* Orbital ring for active agent */}
                {activeAgent === index && (
                  <div className="absolute inset-0 -m-2">
                    <div 
                      className={`w-full h-full rounded-full border-2 bg-gradient-to-r ${agent.color} opacity-50 blur-sm animate-pulse`}
                    />
                  </div>
                )}
                
                {/* Agent avatar */}
                <div
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${agent.color} p-1 ${
                    activeAgent === index ? "animate-pulse" : ""
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img 
                      src={agent.avatar} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Particles */}
                {activeAgent === index && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${agent.color}`}
                        style={{
                          top: "50%",
                          left: "50%",
                          animation: `orbit ${2 + i * 0.3}s linear infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active agent description */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-accent/10 border border-border backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-3">{agents[activeAgent].name}</h3>
            <p className="text-lg text-muted-foreground mb-4">{agents[activeAgent].role}</p>
            <p className="text-foreground">{agents[activeAgent].description}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(50px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(50px) rotate(-360deg);
          }
        }
      `}</style>
    </section>
  );
}
