import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, PoundSterling, Calendar } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "85%",
    label: "Success Rate",
    subtext: "Overall approval rate for well-prepared applications",
    source: "Home Office Statistics 2025"
  },
  {
    icon: Clock,
    value: "18-24",
    label: "weeks",
    subtext: "Total Timeline - 6-8 weeks endorsement + 12-16 weeks processing",
    source: "UKVI Processing Times 2026"
  },
  {
    icon: Calendar,
    value: "3",
    label: "years",
    subtext: "Path to Settlement - Eligible for Indefinite Leave to Remain",
    source: "UK Home Office 2026"
  }
];

export default function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            UK Innovator Founder Visa by the Numbers
          </h2>
          <p className="text-lg text-muted-foreground">
            Official statistics from the UK Home Office for the Innovator Founder route (2026)
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 text-center hover-elevate">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="font-serif text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{stat.subtext}</p>
                <p className="text-xs font-medium text-primary/70">{stat.source}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
