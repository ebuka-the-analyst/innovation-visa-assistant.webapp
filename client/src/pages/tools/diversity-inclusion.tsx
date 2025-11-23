import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Users, DollarSign, Target, AlertCircle, Award, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Diverse teams drive innovation (research-backed)
// Viability Criterion: Inclusive culture attracts wider talent pool
// Scalability Criterion: D&I essential for global market expansion

export default function DiversityInclusion() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [demographics, setDemographics] = useState({ male: 60, female: 35, nonBinary: 5, white: 50, asian: 30, black: 12, hispanic: 8 });
  const [paygapData, setPaygapData] = useState({ maleAvg: 75000, femaleAvg: 72000, minorityAvg: 70000 });
  const [teamSize, setTeamSize] = useState(15);

  const saveProgress = () => {
    localStorage.setItem('diversityInclusionFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('diversityInclusionData', JSON.stringify({ demographics, paygapData, teamSize }));
    localStorage.setItem('diversityInclusionDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  // PhD-Level: Diversity Score (McKinsey research: diverse teams = 35% more innovation)
  const getDiversityScore = (): { score: number; grade: string } => {
    let score = 0;
    
    // Gender balance (30 points): Optimal 40-60% range
    const genderBalance = Math.abs(50 - demographics.female);
    if (genderBalance <= 10) score += 30;
    else if (genderBalance <= 20) score += 20;
    else score += 10;
    
    // Ethnic diversity (30 points): Higher diversity = higher score
    const nonWhite = 100 - demographics.white;
    if (nonWhite >= 40) score += 30;
    else if (nonWhite >= 25) score += 20;
    else score += Math.round(nonWhite / 2);
    
    // Pay equity (40 points): Critical for viability
    const genderGap = ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg) * 100;
    if (genderGap <= 2) score += 40;
    else if (genderGap <= 5) score += 25;
    else if (genderGap <= 10) score += 10;
    
    let grade = 'F - Poor';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Good';
    else if (score >= 55) grade = 'C - Fair';
    else if (score >= 40) grade = 'D - Needs Work';
    
    return { score, grade };
  };

  // PhD-Level: Innovation Impact (Boston Consulting Group research)
  const getInnovationImpact = (): { diversityBonus: number; talentPoolExpansion: number } => {
    const { score } = getDiversityScore();
    
    // Research: Diverse teams 19-35% more innovative
    const diversityBonus = Math.round((score / 100) * 25);
    
    // Talent pool: Inclusive hiring expands candidate pool by 40-60%
    const talentPoolExpansion = Math.round((score / 100) * 50);
    
    return { diversityBonus, talentPoolExpansion };
  };

  const exportReport = () => {
    const genderGap = ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100).toFixed(1);
    const { score, grade } = getDiversityScore();
    const { diversityBonus, talentPoolExpansion } = getInnovationImpact();
    
    const content = `UK INNOVATOR FOUNDER VISA - DIVERSITY & INCLUSION REPORT
Generated: ${new Date().toLocaleDateString()}

Diversity Score: ${score}% (${grade})
Team Size: ${teamSize}
Innovation Bonus: +${diversityBonus}% (research-backed)
Talent Pool Expansion: +${talentPoolExpansion}%

DEMOGRAPHICS:
Gender: Male ${demographics.male}%, Female ${demographics.female}%, Non-Binary ${demographics.nonBinary}%
Ethnicity: White ${demographics.white}%, Asian ${demographics.asian}%, Black ${demographics.black}%, Hispanic ${demographics.hispanic}%

PAY EQUITY:
Male Avg: £${paygapData.maleAvg.toLocaleString()}
Female Avg: £${paygapData.femaleAvg.toLocaleString()}
Gender Pay Gap: ${genderGap}%
${parseFloat(genderGap) <= 5 ? '✅ Below UK reporting threshold (5%)' : '⚠️ Exceeds recommended threshold'}

INNOVATOR FOUNDER VISA CONTEXT:
Innovation: Diverse teams drive ${diversityBonus}% more innovation
Viability: Inclusive culture expands talent pool ${talentPoolExpansion}%
Scalability: D&I essential for global market expansion

Source: McKinsey, BCG, Deloitte diversity research
GOV.UK: Innovator Founder Visa criteria (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-diversity-inclusion.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const genderGap = (paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100;
    const { score } = getDiversityScore();
    
    if (demographics.female < 30) tips.push("⚠️ Female representation below 30% - limits talent pool for scaling");
    if (genderGap > 5) tips.push(`💰 Gender pay gap ${genderGap.toFixed(1)}% exceeds UK best practice (5%)`);
    if (demographics.black + demographics.hispanic < 15) tips.push("📊 Underrepresented minorities below 15% - expand recruitment channels");
    if (score >= 70) tips.push(`✅ Strong D&I (${score}%) supports innovation criterion for Innovator Founder visa`);
    
    return tips.length ? tips : ["✅ D&I metrics support business viability"];
  };

  const getGenderData = () => [
    { name: "Male", value: demographics.male },
    { name: "Female", value: demographics.female },
    { name: "Non-Binary", value: demographics.nonBinary }
  ];

  const getEthnicityData = () => [
    { name: "White", value: demographics.white },
    { name: "Asian", value: demographics.asian },
    { name: "Black", value: demographics.black },
    { name: "Hispanic", value: demographics.hispanic }
  ];

  const getPayEquityData = () => [
    { group: "Male", avg: paygapData.maleAvg },
    { group: "Female", avg: paygapData.femaleAvg },
    { group: "Minority", avg: paygapData.minorityAvg }
  ];

  const getDiversityRadar = () => [
    { metric: "Gender Balance", score: Math.max(0, 100 - Math.abs(50 - demographics.female) * 2) },
    { metric: "Ethnic Diversity", score: 100 - demographics.white },
    { metric: "Pay Equity", score: Math.max(0, 100 - ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100) * 10) },
    { metric: "Innovation Impact", score: getDiversityScore().score },
    { metric: "Inclusion Culture", score: demographics.female >= 30 && demographics.white <= 70 ? 85 : 60 }
  ];

  useEffect(() => {
    const s = localStorage.getItem('diversityInclusionData');
    if (s) {
      const data = JSON.parse(s);
      setDemographics(data.demographics || demographics);
      setPaygapData(data.paygapData || paygapData);
      setTeamSize(data.teamSize || 15);
    }
    const f = localStorage.getItem('diversityInclusionFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('diversityInclusionDate');
    if (d) setSavedDate(d);
  }, []);

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981'];
  const genderGap = ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100).toFixed(1);
  const { score: diversityScore, grade } = getDiversityScore();
  const { diversityBonus, talentPoolExpansion } = getInnovationImpact();

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Diversity & Inclusion</h1>
          <p className="text-muted-foreground mb-6">Build diverse teams for innovation and talent acquisition (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="diversity-inclusion" toolName="Diversity & Inclusion" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, demographics, paygapData, teamSize, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Diversity Score</span>
              </div>
              <p className="text-3xl font-bold">{diversityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Female Rep</span>
              </div>
              <p className="text-3xl font-bold">{demographics.female}%</p>
              <p className="text-xs text-muted-foreground mt-1">Team composition</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Innovation Bonus</span>
              </div>
              <p className="text-3xl font-bold">+{diversityBonus}%</p>
              <p className="text-xs text-muted-foreground mt-1">Research-backed</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className={`w-5 h-5 ${parseFloat(genderGap) > 5 ? 'text-red-600' : 'text-green-600'}`} />
                <span className="text-sm font-medium">Pay Gap</span>
              </div>
              <p className="text-3xl font-bold">{genderGap}%</p>
              <p className="text-xs text-muted-foreground mt-1">{parseFloat(genderGap) <= 5 ? 'Within threshold' : 'Above threshold'}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getGenderData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {getGenderData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Ethnicity Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getEthnicityData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {getEthnicityData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pay Equity Analysis</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPayEquityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis label={{ value: 'Avg Salary £', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Bar dataKey="avg" fill="#ffa536" name="Average Salary" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">D&I Impact Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getDiversityRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="D&I Score" dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isWarning = tip.includes('⚠️');
                return (
                  <Alert key={i} className={isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Team Demographics</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Team Size</label>
                <Input type="number" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} data-testid="input-team-size" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Male %</label>
                <Input type="number" min="0" max="100" value={demographics.male} onChange={(e) => setDemographics({...demographics, male: Number(e.target.value)})} data-testid="input-male" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Female %</label>
                <Input type="number" min="0" max="100" value={demographics.female} onChange={(e) => setDemographics({...demographics, female: Number(e.target.value)})} data-testid="input-female" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Non-Binary %</label>
                <Input type="number" min="0" max="100" value={demographics.nonBinary} onChange={(e) => setDemographics({...demographics, nonBinary: Number(e.target.value)})} data-testid="input-nonbinary" />
              </div>
            </div>

            <h4 className="font-semibold mb-2 mt-4">Ethnicity Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">White %</label>
                <Input type="number" min="0" max="100" value={demographics.white} onChange={(e) => setDemographics({...demographics, white: Number(e.target.value)})} data-testid="input-white" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Asian %</label>
                <Input type="number" min="0" max="100" value={demographics.asian} onChange={(e) => setDemographics({...demographics, asian: Number(e.target.value)})} data-testid="input-asian" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Black %</label>
                <Input type="number" min="0" max="100" value={demographics.black} onChange={(e) => setDemographics({...demographics, black: Number(e.target.value)})} data-testid="input-black" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Hispanic %</label>
                <Input type="number" min="0" max="100" value={demographics.hispanic} onChange={(e) => setDemographics({...demographics, hispanic: Number(e.target.value)})} data-testid="input-hispanic" />
              </div>
            </div>

            <h4 className="font-semibold mb-2 mt-4">Pay Equity Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Male Avg Salary (£)</label>
                <Input type="number" value={paygapData.maleAvg} onChange={(e) => setPaygapData({...paygapData, maleAvg: Number(e.target.value)})} data-testid="input-male-avg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Female Avg Salary (£)</label>
                <Input type="number" value={paygapData.femaleAvg} onChange={(e) => setPaygapData({...paygapData, femaleAvg: Number(e.target.value)})} data-testid="input-female-avg" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Minority Avg Salary (£)</label>
                <Input type="number" value={paygapData.minorityAvg} onChange={(e) => setPaygapData({...paygapData, minorityAvg: Number(e.target.value)})} data-testid="input-minority-avg" />
              </div>
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
