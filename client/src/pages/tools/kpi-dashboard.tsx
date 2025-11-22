import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { CheckCircle2, Circle } from "lucide-react";

const MILESTONES = [
  { id: "1", title: "Research & Planning", target: "Week 1-2", status: "completed" },
  { id: "2", title: "Business Setup", target: "Week 3-4", status: "completed" },
  { id: "3", title: "Evidence Collection", target: "Week 5-8", status: "in-progress" },
  { id: "4", title: "Advisor Endorsement", target: "Week 9-10", status: "pending" },
  { id: "5", title: "Application Submission", target: "Week 11-12", status: "pending" }
];

export default function KPIDASHBOARD() {
  const completed = MILESTONES.filter(m => m.status === "completed").length;
  const pct = (completed / MILESTONES.length) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Kpi Dashboard</h1>
            <p className="text-muted-foreground">Track application milestones and timeline</p>
          </div>
          
          <Card className="p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-bold">Progress</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div style={{ width: `${pct}%` }} className="bg-primary h-3 rounded-full" />
            </div>
          </Card>

          <div className="space-y-3">
            {MILESTONES.map(m => (
              <Card key={m.id} className="p-4">
                <div className="flex gap-3">
                  <div>
                    {m.status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.target}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    m.status === "completed" ? "bg-green-100 text-green-700" :
                    m.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {m.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
