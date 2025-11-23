import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, Target, TrendingUp, AlertCircle, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, PieChart, Pie, Cell } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Skill diversity enables team to handle growth challenges
// Viability Criterion: Strong skill coverage demonstrates execution capability

interface SkillEntry {
  id: string;
  employee: string;
  role: string;
  skills: { [key: string]: "expert" | "proficient" | "basic" | "none" };
  salary: number;
}

const SKILL_CATEGORIES = ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS", "Leadership", "Communication"];
const SKILL_WEIGHTS = { expert: 100, proficient: 75, basic: 40, none: 0 };

export default function SkillsMatrix() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([
    { id: "1", employee: "Tech Lead", role: "Senior Engineer", skills: { JavaScript: "expert", Python: "proficient", React: "expert", "Node.js": "proficient", SQL: "basic", AWS: "basic", Leadership: "proficient", Communication: "proficient" }, salary: 75000 }
  ]);

  const saveProgress = () => {
    localStorage.setItem('skillsMatrixFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('skillsMatrixData', JSON.stringify({ skillEntries }));
    localStorage.setItem('skillsMatrixDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addEmployee = () => {
    const defaultSkills = SKILL_CATEGORIES.reduce((acc, skill) => ({ ...acc, [skill]: "none" }), {});
    setSkillEntries([...skillEntries, { id: Date.now().toString(), employee: "New Employee", role: "", skills: defaultSkills as any, salary: 60000 }]);
  };

  const removeEmployee = (id: string) => setSkillEntries(skillEntries.filter(e => e.id !== id));

  const updateEmployee = (id: string, field: string, value: any) => {
    setSkillEntries(skillEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateSkill = (id: string, skill: string, level: any) => {
    setSkillEntries(skillEntries.map(e => e.id === id ? { ...e, skills: { ...e.skills, [skill]: level } } : e));
  };

  // PhD-Level: Team Skill Coverage Score
  // Formula: Weighted skill levels across critical competencies
  const getSkillCoverage = (): { score: number; grade: string; criticalGaps: number } => {
    if (skillEntries.length === 0) return { score: 0, grade: 'F', criticalGaps: 0 };
    
    let totalScore = 0;
    let criticalGaps = 0;
    
    SKILL_CATEGORIES.forEach(skill => {
      const skillScores = skillEntries.map(e => SKILL_WEIGHTS[e.skills[skill]]);
      const avgSkillScore = skillScores.reduce((sum, s) => sum + s, 0) / skillEntries.length;
      totalScore += avgSkillScore;
      
      // Critical gap: No expert in this skill
      const experts = skillEntries.filter(e => e.skills[skill] === 'expert').length;
      if (experts === 0) criticalGaps++;
    });
    
    const score = Math.round(totalScore / SKILL_CATEGORIES.length);
    
    let grade = 'F - Poor';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Good';
    else if (score >= 55) grade = 'C - Fair';
    else if (score >= 40) grade = 'D - Needs Work';
    
    return { score, grade, criticalGaps };
  };

  // PhD-Level: Skill Redundancy Analysis (Business Continuity)
  const getSkillRedundancy = (): { singlePointsOfFailure: number; avgDepth: number } => {
    let singlePoints = 0;
    let totalDepth = 0;
    
    SKILL_CATEGORIES.forEach(skill => {
      const competent = skillEntries.filter(e => e.skills[skill] === 'expert' || e.skills[skill] === 'proficient').length;
      if (competent === 1) singlePoints++;
      totalDepth += competent;
    });
    
    const avgDepth = Math.round(totalDepth / SKILL_CATEGORIES.length * 10) / 10;
    
    return { singlePointsOfFailure: singlePoints, avgDepth };
  };

  const exportMatrix = () => {
    const { score, grade, criticalGaps } = getSkillCoverage();
    const { singlePointsOfFailure, avgDepth } = getSkillRedundancy();
    
    const content = `UK INNOVATOR FOUNDER VISA - SKILLS MATRIX
Generated: ${new Date().toLocaleDateString()}

Skill Coverage Score: ${score}% (${grade})
Total Employees: ${skillEntries.length}
Critical Skill Gaps: ${criticalGaps}
Single Points of Failure: ${singlePointsOfFailure}
Avg Skill Depth: ${avgDepth} people per skill

INNOVATOR FOUNDER VISA CONTEXT:
Scalability: ${criticalGaps === 0 ? 'Full skill coverage supports growth' : `${criticalGaps} critical gap(s) limit scaling capability`}
Viability: ${singlePointsOfFailure === 0 ? 'Strong skill redundancy reduces execution risk' : `${singlePointsOfFailure} single point(s) of failure threaten viability`}
Business Continuity: ${avgDepth >= 2 ? 'Adequate backup for key skills' : 'Insufficient skill depth - hiring critical'}

SKILL INVENTORY:
${skillEntries.map(e => `
${e.name} - ${e.role} (£${e.salary.toLocaleString()})
${SKILL_CATEGORIES.map(skill => `  ${skill}: ${e.skills[skill] || "none"}`).join('\n')}
`).join('\n')}

SKILL GAP ANALYSIS:
${SKILL_CATEGORIES.map(skill => {
  const experts = skillEntries.filter(e => e.skills[skill] === 'expert').length;
  const proficient = skillEntries.filter(e => e.skills[skill] === 'proficient').length;
  const status = experts === 0 && proficient === 0 ? '🚨 CRITICAL GAP' : 
                 experts === 0 ? '⚠️ No expert' :
                 experts + proficient === 1 ? '📋 Single point of failure' : '✅ Adequate coverage';
  return `${skill}: ${experts} expert(s), ${proficient} proficient - ${status}`;
}).join('\n')}

Source: Business Continuity Planning (ISO 22301)
Formula: Score = Σ(Weighted Skill Levels) / Skills
GOV.UK: Innovator Founder Visa scalability criterion
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-skills-matrix.txt';
    a.click();
  };

  const getSmartRecommendations = (): string[] => {
    const tips: string[] = [];
    const { criticalGaps, score } = getSkillCoverage();
    const { singlePointsOfFailure, avgDepth } = getSkillRedundancy();
    
    if (criticalGaps > 0) {
      const gapSkills: string[] = [];
      SKILL_CATEGORIES.forEach(skill => {
        const experts = skillEntries.filter(e => e.skills[skill] === 'expert').length;
        const proficient = skillEntries.filter(e => e.skills[skill] === 'proficient').length;
        if (experts === 0 && proficient === 0) gapSkills.push(skill);
      });
      tips.push(`🚨 CRITICAL: ${criticalGaps} skill gap(s) - ${gapSkills.join(', ')}`);
      tips.push(`   Recommend hiring or upskilling to cover these gaps`);
    }
    
    if (singlePointsOfFailure > 0) {
      tips.push(`⚠️ ${singlePointsOfFailure} single point(s) of failure - business continuity risk`);
    }
    
    if (avgDepth < 2) {
      tips.push(`📋 Average skill depth ${avgDepth} below recommended 2+ people per skill`);
      tips.push(`   Team scaling requires building skill redundancy`);
    }
    
    if (score >= 70 && criticalGaps === 0) {
      tips.push(`✅ Strong skill coverage (${score}%) demonstrates team execution capability`);
    }
    
    if (score < 60) {
      tips.push(`🚨 Skill coverage ${score}% below threshold - impacts viability and scalability`);
    }
    
    return tips.length ? tips : ["✅ Skill matrix supports business scalability"];
  };

  const getSerializedState = () => ({ uploadedFiles, skillEntries, savedDate });

  // Chart 1: Team Skill Coverage by Category
  const getSkillCoverageByCategory = () => {
    return SKILL_CATEGORIES.map(skill => {
      const scores = skillEntries.map(e => SKILL_WEIGHTS[e.skills[skill]]);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / (skillEntries.length || 1);
      return {
        skill: skill.length > 10 ? skill.substring(0, 10) : skill,
        coverage: Math.round(avgScore),
        target: 75
      };
    });
  };

  // Chart 2: Skill Distribution Pie
  const getSkillDistribution = () => {
    const distribution: { [key: string]: number } = { expert: 0, proficient: 0, basic: 0, none: 0 };
    
    skillEntries.forEach(e => {
      Object.values(e.skills).forEach(level => {
        distribution[level]++;
      });
    });
    
    return Object.entries(distribution).map(([level, count]) => ({
      level: level.charAt(0).toUpperCase() + level.slice(1),
      count
    })).filter(d => d.count > 0);
  };

  // Chart 3: Skill Depth Radar
  const getSkillDepthRadar = () => {
    return SKILL_CATEGORIES.map(skill => {
      const experts = skillEntries.filter(e => e.skills[skill] === 'expert').length;
      const proficient = skillEntries.filter(e => e.skills[skill] === 'proficient').length;
      const depth = experts + proficient;
      
      return {
        skill: skill.length > 8 ? skill.substring(0, 8) : skill,
        depth: depth,
        experts: experts,
        target: Math.max(2, Math.ceil(skillEntries.length * 0.3))
      };
    });
  };

  // Chart 4: Critical Gap Analysis
  const getCriticalGaps = () => {
    const gaps: { skill: string; gap: number }[] = [];
    
    SKILL_CATEGORIES.forEach(skill => {
      const experts = skillEntries.filter(e => e.skills[skill] === 'expert').length;
      const proficient = skillEntries.filter(e => e.skills[skill] === 'proficient').length;
      const total = experts + proficient;
      const target = 2;
      const gap = Math.max(0, target - total);
      
      if (gap > 0) {
        gaps.push({
          skill: skill.length > 10 ? skill.substring(0, 10) : skill,
          gap
        });
      }
    });
    
    return gaps.length > 0 ? gaps : [{ skill: 'None', gap: 0 }];
  };

  useEffect(() => {
    const s = localStorage.getItem('skillsMatrixData');
    if (s) setSkillEntries(JSON.parse(s).skillEntries || []);
    const f = localStorage.getItem('skillsMatrixFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('skillsMatrixDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: coverageScore, grade, criticalGaps } = getSkillCoverage();
  const { singlePointsOfFailure, avgDepth } = getSkillRedundancy();
  const COLORS = ['#10b981', '#ffa536', '#11b6e9', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Skills Matrix</h1>
          <p className="text-muted-foreground mb-6">Map team skills for scalability and continuity (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="skills-matrix" toolName="Skills Matrix" onSave={saveProgress} onExport={exportMatrix} getSerializedState={getSerializedState} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Skill Coverage</span>
              </div>
              <p className="text-3xl font-bold">{coverageScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <p className="text-3xl font-bold">{skillEntries.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Tracked employees</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className={`w-5 h-5 ${criticalGaps > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <span className="text-sm font-medium">Critical Gaps</span>
              </div>
              <p className="text-3xl font-bold">{criticalGaps}</p>
              <p className="text-xs text-muted-foreground mt-1">of {SKILL_CATEGORIES.length} skills</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Avg Skill Depth</span>
              </div>
              <p className="text-3xl font-bold">{avgDepth}</p>
              <p className="text-xs text-muted-foreground mt-1">People per skill</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Skill Coverage by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getSkillCoverageByCategory()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" angle={-15} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="coverage" fill="#ffa536" name="Current Coverage" />
                  <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Target (75%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Skill Level Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getSkillDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getSkillDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Skill Depth Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getSkillDepthRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, Math.max(5, skillEntries.length)]} />
                  <Radar name="Total Depth" dataKey="depth" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Radar name="Experts" dataKey="experts" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Critical Skill Gaps</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCriticalGaps()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'People Needed', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="skill" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#ef4444" name="Gap (People)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isCritical = tip.includes('CRITICAL');
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
              <h3 className="font-semibold">Employee Skills</h3>
              <Button onClick={addEmployee} size="sm" data-testid="button-add-employee">
                <Plus className="w-4 h-4 mr-1" /> Add Employee
              </Button>
            </div>

            <div className="space-y-6">
              {skillEntries.map((employee) => (
                <Card key={employee.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input value={employee.employee} onChange={(e) => updateEmployee(employee.id, 'employee', e.target.value)} placeholder="Employee Name" data-testid={`input-employee-${employee.id}`} />
                      <Input value={employee.role} onChange={(e) => updateEmployee(employee.id, 'role', e.target.value)} placeholder="Role" data-testid={`input-role-${employee.id}`} />
                      <Input type="number" value={employee.salary} onChange={(e) => updateEmployee(employee.id, 'salary', Number(e.target.value))} placeholder="Salary" data-testid={`input-salary-${employee.id}`} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEmployee(employee.id)} data-testid={`button-remove-${employee.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SKILL_CATEGORIES.map(skill => (
                      <div key={skill}>
                        <label className="text-xs font-medium block mb-1">{skill}</label>
                        <Select value={employee.skills[skill] || "none"} onValueChange={(v) => updateSkill(employee.id, skill, v)}>
                          <SelectTrigger className="h-8" data-testid={`select-${skill}-${employee.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expert">Expert</SelectItem>
                            <SelectItem value="proficient">Proficient</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
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
        </div>
      </div>
    </>
  );
}
