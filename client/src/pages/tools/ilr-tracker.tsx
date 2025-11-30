import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Target, CheckCircle2, Calendar, Award, Clock, AlertTriangle, TrendingUp } from "lucide-react";

interface ILRMilestone {
  id: string;
  title: string;
  description: string;
  year: number;
  completed: boolean;
  dueDate: string;
  category: 'business' | 'compliance' | 'endorsement' | 'residency';
}

const INITIAL_MILESTONES: ILRMilestone[] = [
  { id: 'm1', title: 'Visa Granted', description: 'Initial Innovator Founder visa approved', year: 0, completed: true, dueDate: '2025-12-01', category: 'compliance' },
  { id: 'm2', title: 'Business Registration', description: 'Company incorporated in UK (Companies House)', year: 0, completed: true, dueDate: '2025-12-15', category: 'business' },
  { id: 'm3', title: 'First Progress Report', description: 'Submit progress report to endorsing body', year: 1, completed: false, dueDate: '2026-12-01', category: 'endorsement' },
  { id: 'm4', title: 'First Employee Hired', description: 'First UK-based full-time employee', year: 1, completed: false, dueDate: '2026-06-01', category: 'business' },
  { id: 'm5', title: 'Revenue Milestone', description: 'Achieve first revenue from UK operations', year: 1, completed: false, dueDate: '2026-06-01', category: 'business' },
  { id: 'm6', title: '2 FTE Created', description: 'Minimum 2 full-time equivalent UK jobs', year: 2, completed: false, dueDate: '2027-12-01', category: 'business' },
  { id: 'm7', title: 'Visa Extension', description: 'Apply for 3-year extension', year: 2, completed: false, dueDate: '2027-10-01', category: 'compliance' },
  { id: 'm8', title: 'Continuous Endorsement', description: 'Maintain endorsing body support', year: 3, completed: false, dueDate: '2028-12-01', category: 'endorsement' },
  { id: 'm9', title: '5 FTE Target', description: 'Scale to 5+ UK employees', year: 3, completed: false, dueDate: '2028-06-01', category: 'business' },
  { id: 'm10', title: 'ILR Eligibility', description: 'Complete 5 years continuous residence', year: 5, completed: false, dueDate: '2030-12-01', category: 'residency' },
  { id: 'm11', title: 'ILR Application', description: 'Submit Indefinite Leave to Remain application', year: 5, completed: false, dueDate: '2031-01-01', category: 'compliance' },
];

export default function ILRTracker() {
  const [milestones, setMilestones] = useState<ILRMilestone[]>(INITIAL_MILESTONES);
  const [currentYear, setCurrentYear] = useState(1);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progress = Math.round((completedCount / milestones.length) * 100);
  const yearMilestones = (year: number) => milestones.filter(m => m.year === year);
  const upcomingMilestones = milestones.filter(m => !m.completed && m.year <= currentYear + 1).slice(0, 3);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'business': return 'bg-blue-500';
      case 'compliance': return 'bg-purple-500';
      case 'endorsement': return 'bg-orange-500';
      case 'residency': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSerializedState = () => ({ milestones, currentYear });
  const handleSave = () => localStorage.setItem('ilr-tracker-state', JSON.stringify(getSerializedState()));
  const handleRestore = () => {
    const saved = localStorage.getItem('ilr-tracker-state');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.milestones) setMilestones(state.milestones);
      if (state.currentYear) setCurrentYear(state.currentYear);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-500/5 to-emerald-500/5 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-4">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">ILR Progress Tracker</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" data-testid="heading-ilr-tracker">Path to Indefinite Leave to Remain</h1>
          <p className="text-muted-foreground">Track your 5-year journey from Innovator Founder visa to permanent residence</p>
        </div>

        <ToolUtilityBar toolId="ilr-tracker" onSave={handleSave} onRestore={handleRestore} getSerializedState={getSerializedState} toolName="ILR Tracker" />

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-500/30">
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-bold text-green-600">{progress}%</p>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">{completedCount}/{milestones.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-muted-foreground">Current Year</p>
              <p className="text-3xl font-bold">Year {currentYear}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-muted-foreground">Years to ILR</p>
              <p className="text-3xl font-bold">{Math.max(0, 5 - currentYear)}</p>
            </CardContent>
          </Card>
        </div>

        {upcomingMilestones.length > 0 && (
          <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingMilestones.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(m.category)}>{m.category}</Badge>
                      <span className="font-medium">{m.title}</span>
                    </div>
                    <Badge variant="outline">Due: {m.dueDate}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {[0, 1, 2, 3, 5].map(year => {
            const yearM = yearMilestones(year);
            if (yearM.length === 0) return null;
            const yearComplete = yearM.every(m => m.completed);
            return (
              <Card key={year} className={yearComplete ? 'border-green-500/50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {yearComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    Year {year} {year === 0 ? '(Initial)' : year === 5 ? '(ILR Eligible)' : ''}
                  </CardTitle>
                  <CardDescription>
                    {yearM.filter(m => m.completed).length}/{yearM.length} milestones completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {yearM.map(milestone => (
                      <div key={milestone.id} className={`flex items-start gap-4 p-4 rounded-lg border ${milestone.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50'}`}>
                        <Checkbox 
                          checked={milestone.completed} 
                          onCheckedChange={() => toggleMilestone(milestone.id)}
                          data-testid={`checkbox-${milestone.id}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </span>
                            <Badge className={getCategoryColor(milestone.category)} variant="outline">
                              {milestone.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <Badge variant="outline">{milestone.dueDate}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
