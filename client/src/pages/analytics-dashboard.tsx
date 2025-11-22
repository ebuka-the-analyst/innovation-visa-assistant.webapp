import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState, useEffect } from "react";
import { Download, TrendingUp, Users, Clock, Target } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ffa536", "#11b6e9", "#6366f1", "#ec4899", "#14b8a6"];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState("7days");

  useEffect(() => {
    // Mock data - will be replaced with API call
    setAnalytics({
      totalSessions: 1250,
      activeUsers: 342,
      averageSessionTime: "12m 34s",
      completionRate: "67%",
      userSatisfaction: "4.6/5",
      sessionsData: [
        { date: "Mon", sessions: 180, users: 45 },
        { date: "Tue", sessions: 220, users: 52 },
        { date: "Wed", sessions: 195, users: 48 },
        { date: "Thu", sessions: 240, users: 58 },
        { date: "Fri", sessions: 215, users: 50 },
      ],
      mostUsedTools: [
        { name: "Org Chart", uses: 285, trend: "+12%" },
        { name: "Hiring Plan", uses: 267, trend: "+8%" },
        { name: "Compliance Checker", uses: 198, trend: "+15%" },
        { name: "Team Assessment", uses: 156, trend: "+5%" },
      ],
      eventBreakdown: [
        { name: "Saves", value: 1847 },
        { name: "Exports", value: 523 },
        { name: "Shares", value: 891 },
        { name: "Uploads", value: 345 },
      ],
      toolCompletionRates: [
        { tool: "Org Chart", completion: 92 },
        { tool: "Hiring Plan", completion: 85 },
        { tool: "Role Designer", completion: 78 },
        { tool: "Team Assessment", completion: 71 },
      ],
    });
  }, [period]);

  const exportAnalytics = () => {
    const content = `ANALYTICS DASHBOARD REPORT\n\nPeriod: Last ${period}\n\nKey Metrics:\nTotal Sessions: ${analytics?.totalSessions}\nActive Users: ${analytics?.activeUsers}\nAverage Session Time: ${analytics?.averageSessionTime}\nCompletion Rate: ${analytics?.completionRate}\nUser Satisfaction: ${analytics?.userSatisfaction}\n\nTop Tools:\n${analytics?.mostUsedTools.map((t: any) => `${t.name}: ${t.uses} uses (${t.trend})`).join('\n')}\n\nEvent Breakdown:\n${analytics?.eventBreakdown.map((e: any) => `${e.name}: ${e.value}`).join('\n')}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.txt";
    a.click();
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Platform Analytics Dashboard</h1>
          <p className="text-muted-foreground mb-6">Track tool usage and user engagement across the platform</p>

          <div className="flex gap-4 mb-6">
            {["7days", "30days", "90days"].map(p => (
              <Button key={p} variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
                {p === "7days" ? "Last 7 Days" : p === "30days" ? "Last 30 Days" : "Last 90 Days"}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card className="p-4 bg-blue-50">
              <p className="text-sm text-muted-foreground flex gap-2"><Users className="w-4 h-4" />Active Users</p>
              <p className="text-3xl font-bold text-primary">{analytics.activeUsers}</p>
            </Card>
            <Card className="p-4 bg-green-50">
              <p className="text-sm text-muted-foreground flex gap-2"><TrendingUp className="w-4 h-4" />Sessions</p>
              <p className="text-3xl font-bold text-green-600">{analytics.totalSessions}</p>
            </Card>
            <Card className="p-4 bg-purple-50">
              <p className="text-sm text-muted-foreground flex gap-2"><Clock className="w-4 h-4" />Avg Time</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.averageSessionTime}</p>
            </Card>
            <Card className="p-4 bg-orange-50">
              <p className="text-sm text-muted-foreground flex gap-2"><Target className="w-4 h-4" />Completion</p>
              <p className="text-3xl font-bold text-primary">{analytics.completionRate}</p>
            </Card>
            <Card className="p-4 bg-pink-50">
              <p className="text-sm text-muted-foreground">Satisfaction</p>
              <p className="text-3xl font-bold text-pink-600">{analytics.userSatisfaction}</p>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="font-bold mb-4">Sessions & Users Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.sessionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="#ffa536" />
                  <Line type="monotone" dataKey="users" stroke="#11b6e9" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold mb-4">Event Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.eventBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#ffa536"
                    dataKey="value"
                  >
                    {analytics.eventBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Top Tools</h3>
              <div className="space-y-4">
                {analytics.mostUsedTools.map((tool: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">{tool.uses} uses</p>
                    </div>
                    <span className="text-green-600 font-bold">{tool.trend}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Tool Completion Rates</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.toolCompletionRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tool" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completion" fill="#11b6e9" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Button className="w-full gap-2 bg-primary" onClick={exportAnalytics}>
            <Download className="w-4 h-4" />
            Export Analytics Report
          </Button>
        </div>
      </div>
    </>
  );
}
