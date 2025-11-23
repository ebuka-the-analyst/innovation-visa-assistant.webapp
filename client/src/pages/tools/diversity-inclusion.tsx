import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Users, DollarSign, Target, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function DiversityInclusion() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [demographics, setDemographics] = useState({ male: 60, female: 35, nonBinary: 5, white: 50, asian: 30, black: 12, hispanic: 8 });
  const [paygapData, setPaygapData] = useState({ maleAvg: 75000, femaleAvg: 72000, minorityAvg: 70000 });

  const saveProgress = () => {
    localStorage.setItem('diversityInclusionFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('diversityInclusionData', JSON.stringify({ demographics, paygapData }));
    localStorage.setItem('diversityInclusionDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportReport = () => {
    const genderGap = ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100).toFixed(1);
    const minorityGap = ((paygapData.maleAvg - paygapData.minorityAvg) / paygapData.maleAvg * 100).toFixed(1);
    
    const content = `DIVERSITY & INCLUSION REPORT\nGenerated: ${new Date().toLocaleDateString()}\n\nDEMOGRAPHICS\nGender:\n  Male: ${demographics.male}%\n  Female: ${demographics.female}%\n  Non-Binary: ${demographics.nonBinary}%\n\nEthnicity:\n  White: ${demographics.white}%\n  Asian: ${demographics.asian}%\n  Black: ${demographics.black}%\n  Hispanic: ${demographics.hispanic}%\n\nPAY EQUITY\nMale Average: £${paygapData.maleAvg.toLocaleString()}\nFemale Average: £${paygapData.femaleAvg.toLocaleString()}\nMinority Average: £${paygapData.minorityAvg.toLocaleString()}\n\nGender Pay Gap: ${genderGap}%\nMinority Pay Gap: ${minorityGap}%\n\nRECOMMENDATIONS\n${getSmartRecommendations().join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diversity-inclusion-report.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const genderGap = (paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100;
    
    if (demographics.female < 30) tips.push("⚠️ Female representation below 30% - expand recruiting pipeline");
    if (genderGap > 5) tips.push(`💰 Gender pay gap of ${genderGap.toFixed(1)}% exceeds UK median reporting threshold`);
    if (demographics.black + demographics.hispanic < 15) tips.push("📊 Underrepresented minorities below 15% - review hiring practices");
    
    return tips.length ? tips : ["✅ D&I metrics are healthy"];
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

  useEffect(() => {
    const s = localStorage.getItem('diversityInclusionData');
    if (s) {
      const data = JSON.parse(s);
      setDemographics(data.demographics);
      setPaygapData(data.paygapData);
    }
    const f = localStorage.getItem('diversityInclusionFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('diversityInclusionDate');
    if (d) setSavedDate(d);
  }, []);

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981'];
  const genderGap = ((paygapData.maleAvg - paygapData.femaleAvg) / paygapData.maleAvg * 100).toFixed(1);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Diversity & Inclusion</h1>
          <p className="text-muted-foreground mb-6">Track demographics, pay equity, and inclusion metrics</p>

          <ToolUtilityBar toolId="diversity-inclusion" toolName="Diversity & Inclusion" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, demographics, paygapData, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Female Representation</span><p className="text-3xl font-bold">{demographics.female}%</p></Card>
            <Card className="p-4"><Target className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">URM Percentage</span><p className="text-3xl font-bold">{demographics.black + demographics.hispanic}%</p></Card>
            <Card className="p-4"><DollarSign className="w-5 h-5 text-red-600 mb-2" /><span className="font-semibold block">Gender Pay Gap</span><p className="text-3xl font-bold">{genderGap}%</p></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={getGenderData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {getGenderData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Ethnicity Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getEthnicityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#ffa536" name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Pay Equity Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getPayEquityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                <Bar dataKey="avg" fill="#11b6e9" name="Average Salary" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => <Alert key={i} className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">{tip}</AlertDescription></Alert>)}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Gender Demographics (%)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm block mb-1">Male</label><Input type="number" value={demographics.male} onChange={(e) => setDemographics({...demographics, male: Number(e.target.value)})} data-testid="input-male" /></div>
              <div><label className="text-sm block mb-1">Female</label><Input type="number" value={demographics.female} onChange={(e) => setDemographics({...demographics, female: Number(e.target.value)})} data-testid="input-female" /></div>
              <div><label className="text-sm block mb-1">Non-Binary</label><Input type="number" value={demographics.nonBinary} onChange={(e) => setDemographics({...demographics, nonBinary: Number(e.target.value)})} data-testid="input-nonbinary" /></div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Ethnicity Demographics (%)</h3>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm block mb-1">White</label><Input type="number" value={demographics.white} onChange={(e) => setDemographics({...demographics, white: Number(e.target.value)})} data-testid="input-white" /></div>
              <div><label className="text-sm block mb-1">Asian</label><Input type="number" value={demographics.asian} onChange={(e) => setDemographics({...demographics, asian: Number(e.target.value)})} data-testid="input-asian" /></div>
              <div><label className="text-sm block mb-1">Black</label><Input type="number" value={demographics.black} onChange={(e) => setDemographics({...demographics, black: Number(e.target.value)})} data-testid="input-black" /></div>
              <div><label className="text-sm block mb-1">Hispanic</label><Input type="number" value={demographics.hispanic} onChange={(e) => setDemographics({...demographics, hispanic: Number(e.target.value)})} data-testid="input-hispanic" /></div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Pay Equity Data (£)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm block mb-1">Male Average</label><Input type="number" value={paygapData.maleAvg} onChange={(e) => setPaygapData({...paygapData, maleAvg: Number(e.target.value)})} data-testid="input-male-avg" /></div>
              <div><label className="text-sm block mb-1">Female Average</label><Input type="number" value={paygapData.femaleAvg} onChange={(e) => setPaygapData({...paygapData, femaleAvg: Number(e.target.value)})} data-testid="input-female-avg" /></div>
              <div><label className="text-sm block mb-1">Minority Average</label><Input type="number" value={paygapData.minorityAvg} onChange={(e) => setPaygapData({...paygapData, minorityAvg: Number(e.target.value)})} data-testid="input-minority-avg" /></div>
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
