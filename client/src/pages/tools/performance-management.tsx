import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EmployeeReview {
  id: string;
  name: string;
  role: string;
  rating: "exceeds" | "meets" | "developing" | "needs-improvement";
  goals: string[];
  feedback: string;
  nextReviewDate: string;
}

export default function PerformanceManagement() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [reviews, setReviews] = useState<EmployeeReview[]>([
    { id: "1", name: "John Doe", role: "Senior Engineer", rating: "exceeds", goals: ["Complete Project X", "Mentor 2 junior developers"], feedback: "Excellent technical leadership and collaboration", nextReviewDate: "2025-06-01" }
  ]);

  const saveProgress = () => {
    localStorage.setItem('performanceMgmtFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('performanceMgmtData', JSON.stringify({ reviews }));
    localStorage.setItem('performanceMgmtDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addReview = () => {
    setReviews([...reviews, { id: Date.now().toString(), name: "Employee Name", role: "", rating: "meets", goals: [""], feedback: "", nextReviewDate: "" }]);
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

  const exportReviews = () => {
    const content = `PERFORMANCE MANAGEMENT REPORT\nGenerated: ${new Date().toLocaleDateString()}\n\nTOTAL REVIEWS: ${reviews.length}\n\nRATING DISTRIBUTION:\nExceeds Expectations: ${reviews.filter(r => r.rating === "exceeds").length}\nMeets Expectations: ${reviews.filter(r => r.rating === "meets").length}\nDeveloping: ${reviews.filter(r => r.rating === "developing").length}\nNeeds Improvement: ${reviews.filter(r => r.rating === "needs-improvement").length}\n\nEMPLOYEE REVIEWS\n${reviews.map(r => `\n${r.name} - ${r.role}\nRating: ${r.rating.toUpperCase()}\nGoals:\n${r.goals.filter(g => g).map((g, i) => `  ${i + 1}. ${g}`).join('\n')}\n\nFeedback: ${r.feedback}\nNext Review: ${r.nextReviewDate}\n`).join('\n')}\n\nRECOMMENDATIONS\n${getSmartRecommendations().join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-reviews.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const needsImprovement = reviews.filter(r => r.rating === "needs-improvement").length;
    
    if (needsImprovement > 0) tips.push(`⚠️ ${needsImprovement} employees need improvement - implement performance improvement plans`);
    
    const reviewsWithoutGoals = reviews.filter(r => r.goals.filter(g => g).length === 0).length;
    if (reviewsWithoutGoals > 0) tips.push(`📋 ${reviewsWithoutGoals} reviews lack specific goals - set SMART objectives`);
    
    const overdueReviews = reviews.filter(r => r.nextReviewDate && new Date(r.nextReviewDate) < new Date()).length;
    if (overdueReviews > 0) tips.push(`🗓️ ${overdueReviews} reviews are overdue - schedule immediately`);
    
    return tips.length ? tips : ["✅ Performance management is on track"];
  };

  const getRatingDistribution = () => {
    const dist = reviews.reduce((acc, r) => { acc[r.rating] = (acc[r.rating] || 0) + 1; return acc; }, {} as Record<string, number>);
    return [
      { rating: "Exceeds", count: dist.exceeds || 0 },
      { rating: "Meets", count: dist.meets || 0 },
      { rating: "Developing", count: dist.developing || 0 },
      { rating: "Needs Work", count: dist["needs-improvement"] || 0 }
    ];
  };

  useEffect(() => {
    const s = localStorage.getItem('performanceMgmtData');
    if (s) setReviews(JSON.parse(s).reviews);
    const f = localStorage.getItem('performanceMgmtFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('performanceMgmtDate');
    if (d) setSavedDate(d);
  }, []);

  const COLORS = ['#10b981', '#fbbf24', '#f97316', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Performance Management</h1>
          <p className="text-muted-foreground mb-6">Track employee reviews, goals, and ratings</p>

          <ToolUtilityBar toolId="performance-management" toolName="Performance Management" onSave={saveProgress} onExport={exportReviews} getSerializedState={() => ({ uploadedFiles, reviews, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Total Reviews</span><p className="text-3xl font-bold">{reviews.length}</p></Card>
            <Card className="p-4"><TrendingUp className="w-5 h-5 text-green-600 mb-2" /><span className="font-semibold block">Exceeds Expectations</span><p className="text-3xl font-bold">{reviews.filter(r => r.rating === "exceeds").length}</p></Card>
            <Card className="p-4"><Target className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Total Goals</span><p className="text-3xl font-bold">{reviews.reduce((sum, r) => sum + r.goals.filter(g => g).length, 0)}</p></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={getRatingDistribution()} dataKey="count" nameKey="rating" cx="50%" cy="50%" outerRadius={80} label>
                    {getRatingDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getRatingDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffa536" name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => <Alert key={i} className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">{tip}</AlertDescription></Alert>)}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Employee Reviews</h3>
              <Button onClick={addReview} size="sm" data-testid="button-add-review"><Plus className="w-4 h-4 mr-1" /> Add Review</Button>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between mb-4">
                    <Input value={review.name} onChange={(e) => updateReview(review.id, 'name', e.target.value)} className="font-semibold text-xl w-1/2" data-testid={`input-name-${review.id}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeReview(review.id)} data-testid={`button-remove-${review.id}`}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div><label className="text-sm font-medium block mb-1">Role</label><Input value={review.role} onChange={(e) => updateReview(review.id, 'role', e.target.value)} data-testid={`input-role-${review.id}`} /></div>
                    <div><label className="text-sm font-medium block mb-1">Rating</label>
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
                    <div><label className="text-sm font-medium block mb-1">Next Review Date</label><Input type="date" value={review.nextReviewDate} onChange={(e) => updateReview(review.id, 'nextReviewDate', e.target.value)} data-testid={`input-next-review-${review.id}`} /></div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Goals</label>
                      <Button variant="outline" size="sm" onClick={() => addGoal(review.id)} data-testid={`button-add-goal-${review.id}`}><Plus className="w-3 h-3" /></Button>
                    </div>
                    {review.goals.map((goal, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input value={goal} onChange={(e) => updateGoal(review.id, idx, e.target.value)} placeholder="Specific, measurable goal..." data-testid={`input-goal-${review.id}-${idx}`} />
                        <Button variant="ghost" size="sm" onClick={() => removeGoal(review.id, idx)} data-testid={`button-remove-goal-${review.id}-${idx}`}><X className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Performance Feedback</label>
                    <Textarea value={review.feedback} onChange={(e) => updateReview(review.id, 'feedback', e.target.value)} placeholder="Detailed feedback on performance, strengths, and areas for improvement..." rows={3} data-testid={`textarea-feedback-${review.id}`} />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && <div className="mt-4"><FileList files={uploadedFiles} onRemove={handleRemoveFile} /></div>}
          </Card>
        </div>
      </div>
    </>
  );
}
