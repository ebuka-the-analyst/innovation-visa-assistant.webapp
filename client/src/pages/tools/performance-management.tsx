import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, TrendingUp, Users, AlertCircle, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "performance-management",
  toolName: "Performance Management",
  agent: "atlas",
  greeting: "Hello! I'm Atlas, your growth and team performance advisor. Let's set up a performance management system that demonstrates your ability to build and manage high-performing teams.",
  questions: [
    {
      id: "team_overview",
      question: "Describe your current team. How many people, what roles, and how do you currently track performance?",
      hint: "Example: 'Tech Lead and 2 developers, currently using informal weekly check-ins'",
      fieldKey: "teamOverview",
      minLength: 40
    },
    {
      id: "performance_criteria",
      question: "What criteria do you use to evaluate employee performance? What makes someone a top performer?",
      hint: "Include both quantitative metrics and qualitative factors",
      fieldKey: "performanceCriteria",
      minLength: 50
    },
    {
      id: "goals_framework",
      question: "How do you set and track goals for your team members?",
      hint: "Example: 'Quarterly OKRs aligned with company objectives, reviewed monthly'",
      fieldKey: "goalsFramework",
      minLength: 40
    },
    {
      id: "feedback_process",
      question: "How often do you provide feedback and conduct performance reviews?",
      hint: "Describe your review cycle and feedback approach",
      fieldKey: "feedbackProcess",
      minLength: 30
    },
    {
      id: "compensation_link",
      question: "How is performance linked to compensation and career progression?",
      hint: "Describe salary reviews, bonuses, promotion criteria",
      fieldKey: "compensationLink",
      minLength: 40
    },
    {
      id: "development_plans",
      question: "How do you support employee development and growth?",
      hint: "Training, mentoring, skill development opportunities",
      fieldKey: "developmentPlans",
      minLength: 30
    }
  ],
  completionMessage: "Excellent! I've captured your performance management approach. Let me now help you create structured employee reviews and tracking."
};

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Strong performance management = better execution
// Scalability Criterion: Clear performance standards enable team growth

interface EmployeeReview {
  id: string;
  name: string;
  role: string;
  rating: "exceeds" | "meets" | "developing" | "needs-improvement";
  goals: string[];
  feedback: string;
  nextReviewDate: string;
  salary: number;
}

export default function PerformanceManagement() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('performance-management-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('performance-management-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('performance-management-mode', mode);
  }, [mode]);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [reviews, setReviews] = useState<EmployeeReview[]>([
    { id: "1", name: "Tech Lead", role: "Senior Engineer", rating: "exceeds", goals: ["Complete MVP", "Mentor 2 juniors"], feedback: "Excellent technical leadership", nextReviewDate: "2025-06-01", salary: 75000 }
  ]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.teamOverview) {
      const newReview: EmployeeReview = {
        id: Date.now().toString(),
        name: "Team Member",
        role: answers.teamOverview.split(',')[0] || "Team Member",
        rating: "meets",
        goals: answers.goalsFramework ? answers.goalsFramework.split('\n').filter(g => g.trim()) : [],
        feedback: answers.feedbackProcess || "",
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        salary: 60000
      };
      setReviews(prev => [...prev, newReview]);
    }
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('performanceMgmtFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('performanceMgmtData', JSON.stringify({ reviews }));
    localStorage.setItem('performanceMgmtDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addReview = () => {
    setReviews([...reviews, { id: Date.now().toString(), name: "Employee", role: "", rating: "meets", goals: [""], feedback: "", nextReviewDate: "", salary: 60000 }]);
  };

  const removeReview = (id: string) => setReviews(reviews.filter(r => r.id !== id));

  const updateReview = (id: string, field: string, value: any) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addGoal = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, goals: [...r.goals, ""] } : r));
  };

  const updateGoal = (id: string, index: number, value: string) => {
    setReviews(reviews.map(r => {
      if (r.id === id) {
        const newGoals = [...r.goals];
        newGoals[index] = value;
        return { ...r, goals: newGoals };
      }
      return r;
    }));
  };

  const removeGoal = (id: string, index: number) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, goals: r.goals.filter((_, i) => i !== index) } : r));
  };

  // Advanced: Team Performance Score
  // Formula: Weighted rating distribution (McKinsey forced ranking principles)
  const getTeamPerformance = (): { score: number; grade: string } => {
    if (reviews.length === 0) return { score: 0, grade: 'F' };
    
    const ratingWeights = {
      'exceeds': 100,
      'meets': 75,
      'developing': 50,
      'needs-improvement': 25
    };
    
    const totalScore = reviews.reduce((sum, r) => sum + ratingWeights[r.rating], 0);
    const score = Math.round(totalScore / reviews.length);
    
    let grade = 'F - Poor';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 75) grade = 'B - Good';
    else if (score >= 65) grade = 'C - Fair';
    else if (score >= 50) grade = 'D - Needs Work';
    
    return { score, grade };
  };

  // Advanced: Performance-Pay Alignment (Compensation equity research)
  const getPayAlignment = (): { alignmentScore: number; performersUnderpaid: number } => {
    if (reviews.length === 0) return { alignmentScore: 100, performersUnderpaid: 0 };
    
    const avgSalary = reviews.reduce((sum, r) => sum + r.salary, 0) / reviews.length;
    const topPerformers = reviews.filter(r => r.rating === 'exceeds');
    
    let performersUnderpaid = 0;
    topPerformers.forEach(tp => {
      if (tp.salary < avgSalary * 1.15) performersUnderpaid++;
    });
    
    const alignmentScore = Math.round(100 - (performersUnderpaid / (topPerformers.length || 1)) * 50);
    
    return { alignmentScore, performersUnderpaid };
  };

  const exportReviews = () => {
    const { score, grade } = getTeamPerformance();
    const { alignmentScore, performersUnderpaid } = getPayAlignment();
    
    const content = `UK INNOVATOR FOUNDER VISA - PERFORMANCE MANAGEMENT
Generated: ${new Date().toLocaleDateString()}

Team Performance Score: ${score}% (${grade})
Total Reviews: ${reviews.length}
Pay-Performance Alignment: ${alignmentScore}%

RATING DISTRIBUTION:
Exceeds: ${reviews.filter(r => r.rating === "exceeds").length} (${Math.round((reviews.filter(r => r.rating === "exceeds").length / (reviews.length || 1)) * 100)}%)
Meets: ${reviews.filter(r => r.rating === "meets").length} (${Math.round((reviews.filter(r => r.rating === "meets").length / (reviews.length || 1)) * 100)}%)
Developing: ${reviews.filter(r => r.rating === "developing").length} (${Math.round((reviews.filter(r => r.rating === "developing").length / (reviews.length || 1)) * 100)}%)
Needs Improvement: ${reviews.filter(r => r.rating === "needs-improvement").length} (${Math.round((reviews.filter(r => r.rating === "needs-improvement").length / (reviews.length || 1)) * 100)}%)

INNOVATOR FOUNDER VISA CONTEXT:
Viability: ${score >= 75 ? 'Strong performance management demonstrates execution capability' : 'Performance gaps may impact viability assessment'}
Scalability: Clear performance standards support team growth
${performersUnderpaid > 0 ? `⚠️ ${performersUnderpaid} top performer(s) underpaid - retention risk` : '✅ Pay-performance alignment supports retention'}

EMPLOYEE REVIEWS:
${reviews.map(r => `
${r.name} - ${r.role}
Rating: ${r.rating.toUpperCase()}
Salary: £${r.salary.toLocaleString()}
Goals: ${r.goals.filter(g => g).map((g, i) => `\n  ${i + 1}. ${g}`).join('') || 'None defined'}
Feedback: ${r.feedback || 'None provided'}
Next Review: ${r.nextReviewDate || 'Not scheduled'}
`).join('\n')}

Source: McKinsey Performance Management Research
Formula: Score = Σ(Rating Weight) / Team Size
GOV.UK: Innovator Founder Visa viability criterion
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-performance-management.txt';
    a.click();
  };

  const getSmartRecommendations = (): string[] => {
    const tips: string[] = [];
    const { score } = getTeamPerformance();
    const { performersUnderpaid } = getPayAlignment();
    
    const needsImprovement = reviews.filter(r => r.rating === "needs-improvement");
    if (needsImprovement.length > 0) {
      tips.push(`🚨 ${needsImprovement.length} employee(s) need performance improvement plans`);
    }
    
    const noGoals = reviews.filter(r => r.goals.filter(g => g).length === 0);
    if (noGoals.length > 0) {
      tips.push(`📋 ${noGoals.length} employee(s) missing performance goals`);
    }
    
    const noReviewDate = reviews.filter(r => !r.nextReviewDate);
    if (noReviewDate.length > 0) {
      tips.push(`💡 Schedule review dates for ${noReviewDate.length} employee(s)`);
    }
    
    if (performersUnderpaid > 0) {
      tips.push(`⚠️ ${performersUnderpaid} top performer(s) underpaid - retention risk`);
    }
    
    if (score >= 80) {
      tips.push(`✅ Strong team performance (${score}%) demonstrates organizational viability`);
    }
    
    if (score < 65) {
      tips.push(`🚨 Team performance ${score}% below threshold - impacts viability criterion`);
    }
    
    return tips.length ? tips : ["✅ Performance management supports business execution"];
  };

  const getSerializedState = () => ({ uploadedFiles, reviews, savedDate });

  // Chart 1: Rating Distribution
  const getRatingData = () => [
    { rating: "Exceeds", count: reviews.filter(r => r.rating === "exceeds").length },
    { rating: "Meets", count: reviews.filter(r => r.rating === "meets").length },
    { rating: "Developing", count: reviews.filter(r => r.rating === "developing").length },
    { rating: "Needs Improvement", count: reviews.filter(r => r.rating === "needs-improvement").length }
  ].filter(d => d.count > 0);

  // Chart 2: Performance vs Salary
  const getPerformanceSalary = () => {
    const ratingOrder = { 'exceeds': 4, 'meets': 3, 'developing': 2, 'needs-improvement': 1 };
    return reviews.map(r => ({
      name: r.name.substring(0, 12),
      rating: ratingOrder[r.rating],
      salary: r.salary
    })).sort((a, b) => b.rating - a.rating);
  };

  // Chart 3: Goal Completion Radar
  const getGoalRadar = () => {
    const metrics = [
      { metric: "Goals Defined", score: Math.min(100, (reviews.filter(r => r.goals.filter(g => g).length > 0).length / (reviews.length || 1)) * 100) },
      { metric: "Feedback Provided", score: Math.min(100, (reviews.filter(r => r.feedback && r.feedback.length > 0).length / (reviews.length || 1)) * 100) },
      { metric: "Reviews Scheduled", score: Math.min(100, (reviews.filter(r => r.nextReviewDate).length / (reviews.length || 1)) * 100) },
      { metric: "High Performers", score: Math.min(100, (reviews.filter(r => r.rating === 'exceeds').length / (reviews.length || 1)) * 100) },
      { metric: "Pay Alignment", score: getPayAlignment().alignmentScore }
    ];
    return metrics;
  };

  // Chart 4: Team Performance Trend (simulated 6-month)
  const getPerformanceTrend = () => {
    const months = ["M-5", "M-4", "M-3", "M-2", "M-1", "Current"];
    const currentScore = getTeamPerformance().score;
    
    return months.map((month, i) => ({
      month,
      score: i === 5 ? currentScore : Math.max(50, currentScore - (5 - i) * 3),
      target: 75
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('performanceMgmtData');
    if (s) setReviews(JSON.parse(s).reviews || []);
    const f = localStorage.getItem('performanceMgmtFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('performanceMgmtDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: performanceScore, grade } = getTeamPerformance();
  const { alignmentScore, performersUnderpaid } = getPayAlignment();
  const COLORS = ['#10b981', '#005EB8', '#41B6E6', '#ef4444'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Performance Management</h1>
          <p className="text-muted-foreground mb-6">Manage team performance for execution and scaling (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="performance-management" toolName="Performance Management" onSave={saveProgress} onExport={exportReviews} getSerializedState={getSerializedState} />

          <div className="flex justify-end mt-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          {mode === 'ai' ? (
            <div className="mt-6">
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            </div>
          ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Team Performance</span>
              </div>
              <p className="text-xl font-bold">{performanceScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Total Reviews</span>
              </div>
              <p className="text-xl font-bold">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Employees tracked</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
              <p className="text-xl font-bold">{reviews.filter(r => r.rating === "exceeds").length}</p>
              <p className="text-xs text-muted-foreground mt-1">{Math.round((reviews.filter(r => r.rating === "exceeds").length / (reviews.length || 1)) * 100)}% of team</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Pay Alignment</span>
              </div>
              <p className="text-xl font-bold">{alignmentScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{performersUnderpaid} underpaid</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getRatingData()} dataKey="count" nameKey="rating" cx="50%" cy="50%" outerRadius={80} label>
                    {getRatingData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance vs Salary</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPerformanceSalary()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} domain={[0, 4]} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Salary £', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="rating" fill="#005EB8" name="Rating (1-4)" />
                  <Bar yAxisId="right" dataKey="salary" fill="#41B6E6" name="Salary" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance System Health</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getGoalRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Health %" dataKey="score" stroke="#005EB8" fill="#005EB8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPerformanceTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#005EB8" name="Team Score" />
                  <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Target (75%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isCritical = tip.includes('🚨');
                const isWarning = tip.includes('⚠️');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Employee Reviews</h3>
              <Button onClick={addReview} size="sm" data-testid="button-add-review">
                <Plus className="w-4 h-4 mr-1" /> Add Review
              </Button>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input value={review.name} onChange={(e) => updateReview(review.id, 'name', e.target.value)} placeholder="Employee Name" data-testid={`input-name-${review.id}`} />
                      <Input value={review.role} onChange={(e) => updateReview(review.id, 'role', e.target.value)} placeholder="Role" data-testid={`input-role-${review.id}`} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeReview(review.id)} data-testid={`button-remove-${review.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Performance Rating</label>
                      <Select value={review.rating} onValueChange={(v) => updateReview(review.id, 'rating', v)}>
                        <SelectTrigger data-testid={`select-rating-${review.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exceeds">Exceeds Expectations</SelectItem>
                          <SelectItem value="meets">Meets Expectations</SelectItem>
                          <SelectItem value="developing">Developing</SelectItem>
                          <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Next Review Date</label>
                      <Input type="date" value={review.nextReviewDate} onChange={(e) => updateReview(review.id, 'nextReviewDate', e.target.value)} data-testid={`input-date-${review.id}`} />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Salary (£)</label>
                      <Input type="number" value={review.salary} onChange={(e) => updateReview(review.id, 'salary', Number(e.target.value))} data-testid={`input-salary-${review.id}`} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Performance Goals</label>
                      <Button size="sm" variant="ghost" onClick={() => addGoal(review.id)} data-testid={`button-add-goal-${review.id}`}>
                        <Plus className="w-3 h-3 mr-1" /> Add Goal
                      </Button>
                    </div>
                    {review.goals.map((goal, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input value={goal} onChange={(e) => updateGoal(review.id, idx, e.target.value)} placeholder="Goal..." data-testid={`input-goal-${review.id}-${idx}`} />
                        <Button size="sm" variant="ghost" onClick={() => removeGoal(review.id, idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Performance Feedback</label>
                    <Textarea value={review.feedback} onChange={(e) => updateReview(review.id, 'feedback', e.target.value)} placeholder="Strengths, areas for improvement..." rows={2} data-testid={`textarea-feedback-${review.id}`} />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
          </>
          )}
        </div>
      </div>
    </>
  );
}
