import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Heart, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface CultureValue {
  id: string;
  name: string;
  description: string;
  alignmentScore: number;
  behaviors: string[];
}

export default function CultureFramework() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [values, setValues] = useState<CultureValue[]>([
    {
      id: "1",
      name: "Innovation",
      description: "Drive continuous improvement and creative solutions",
      alignmentScore: 80,
      behaviors: ["Experiment with new ideas", "Learn from failures", "Challenge status quo"]
    }
  ]);

  const saveProgress = () => {
    localStorage.setItem('cultureFrameworkFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('cultureFrameworkData', JSON.stringify({ mission, vision, values }));
    localStorage.setItem('cultureFrameworkDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addValue = () => {
    setValues([...values, {
      id: Date.now().toString(),
      name: "New Value",
      description: "",
      alignmentScore: 50,
      behaviors: [""]
    }]);
  };

  const removeValue = (id: string) => {
    setValues(values.filter(v => v.id !== id));
  };

  const updateValue = (id: string, field: string, value: any) => {
    setValues(values.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addBehavior = (id: string) => {
    setValues(values.map(v => v.id === id ? { ...v, behaviors: [...v.behaviors, ""] } : v));
  };

  const updateBehavior = (id: string, index: number, value: string) => {
    setValues(values.map(v => {
      if (v.id === id) {
        const newBehaviors = [...v.behaviors];
        newBehaviors[index] = value;
        return { ...v, behaviors: newBehaviors };
      }
      return v;
    }));
  };

  const removeBehavior = (id: string, index: number) => {
    setValues(values.map(v => {
      if (v.id === id) {
        return { ...v, behaviors: v.behaviors.filter((_, i) => i !== index) };
      }
      return v;
    }));
  };

  const exportFramework = () => {
    const avgAlignment = (values.reduce((sum, v) => sum + v.alignmentScore, 0) / values.length).toFixed(0);
    
    const content = `CULTURE FRAMEWORK
Generated: ${new Date().toLocaleDateString()}

MISSION
${mission || "Not defined"}

VISION
${vision || "Not defined"}

CORE VALUES
${values.map((v, i) => `
${i + 1}. ${v.name}
Description: ${v.description}
Alignment Score: ${v.alignmentScore}%

Expected Behaviors:
${v.behaviors.filter(b => b).map((b, idx) => `  • ${b}`).join('\n')}
`).join('\n')}

CULTURE HEALTH METRICS
Total Values Defined: ${values.length}
Average Alignment: ${avgAlignment}%

RECOMMENDATIONS
${getSmartRecommendations().join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'culture-framework.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const avgAlignment = values.reduce((sum, v) => sum + v.alignmentScore, 0) / values.length;
    
    if (!mission) tips.push("📝 Define your mission statement - the foundation of culture");
    if (!vision) tips.push("🎯 Create a vision statement to guide long-term direction");
    if (values.length < 3) tips.push("💡 Define at least 3-5 core values for balanced culture");
    if (values.length > 7) tips.push("⚠️ Too many values can dilute focus - aim for 3-5 core values");
    if (avgAlignment < 60) tips.push("📊 Low alignment scores - reinforce values through actions and communication");
    
    const valuesWithoutBehaviors = values.filter(v => v.behaviors.filter(b => b).length === 0).length;
    if (valuesWithoutBehaviors > 0) {
      tips.push(`🎭 ${valuesWithoutBehaviors} values lack behavioral examples - define observable actions`);
    }
    
    return tips.length ? tips : ["✅ Culture framework is well-defined and actionable"];
  };

  const getSerializedState = () => ({ uploadedFiles, mission, vision, values, savedDate });

  const getAlignmentData = () => {
    return values.map(v => ({
      value: v.name.substring(0, 15),
      alignment: v.alignmentScore
    }));
  };

  const getCultureRadar = () => {
    return values.slice(0, 6).map(v => ({
      value: v.name,
      score: v.alignmentScore,
      behaviors: v.behaviors.filter(b => b).length
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('cultureFrameworkData');
    if (s) {
      const data = JSON.parse(s);
      setMission(data.mission);
      setVision(data.vision);
      setValues(data.values);
    }
    const f = localStorage.getItem('cultureFrameworkFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    
    const d = localStorage.getItem('cultureFrameworkDate');
    if (d) setSavedDate(d);
  }, []);

  const avgAlignment = values.length ? (values.reduce((sum, v) => sum + v.alignmentScore, 0) / values.length).toFixed(0) : 0;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Culture Framework</h1>
          <p className="text-muted-foreground mb-6">Define values, behaviors, and cultural alignment</p>

          <ToolUtilityBar
            toolId="culture-framework"
            toolName="Culture Framework"
            onSave={saveProgress}
            onExport={exportFramework}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Last saved: {savedDate}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-semibold">Core Values</span>
              </div>
              <p className="text-3xl font-bold">{values.length}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Avg Alignment</span>
              </div>
              <p className="text-3xl font-bold">{avgAlignment}%</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">Total Behaviors</span>
              </div>
              <p className="text-3xl font-bold">
                {values.reduce((sum, v) => sum + v.behaviors.filter(b => b).length, 0)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Value Alignment Scores</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getAlignmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="alignment" fill="#ffa536" name="Alignment %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Culture Health Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={getCultureRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="value" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Alignment" dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => (
                <Alert key={i} className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">{tip}</AlertDescription>
                </Alert>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Mission & Vision</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Mission Statement</label>
                <Textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="What is your company's purpose? Why do you exist?"
                  rows={3}
                  data-testid="textarea-mission"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Vision Statement</label>
                <Textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Where do you want to be in 5-10 years?"
                  rows={3}
                  data-testid="textarea-vision"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Core Values</h3>
              <Button onClick={addValue} size="sm" data-testid="button-add-value">
                <Plus className="w-4 h-4 mr-1" /> Add Value
              </Button>
            </div>

            <div className="space-y-6">
              {values.map((value) => (
                <Card key={value.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={value.name}
                      onChange={(e) => updateValue(value.id, 'name', e.target.value)}
                      className="font-semibold text-xl w-2/3"
                      placeholder="Value Name"
                      data-testid={`input-name-${value.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeValue(value.id)}
                      data-testid={`button-remove-${value.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <Textarea
                      value={value.description}
                      onChange={(e) => updateValue(value.id, 'description', e.target.value)}
                      placeholder="What does this value mean for your organization?"
                      rows={2}
                      data-testid={`textarea-description-${value.id}`}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-2">
                      Team Alignment: {value.alignmentScore}%
                    </label>
                    <Slider
                      value={[value.alignmentScore]}
                      onValueChange={(val) => updateValue(value.id, 'alignmentScore', val[0])}
                      min={0}
                      max={100}
                      step={5}
                      data-testid={`slider-alignment-${value.id}`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Expected Behaviors</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBehavior(value.id)}
                        data-testid={`button-add-behavior-${value.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {value.behaviors.map((behavior, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={behavior}
                          onChange={(e) => updateBehavior(value.id, idx, e.target.value)}
                          placeholder="Observable behavior that demonstrates this value"
                          data-testid={`input-behavior-${value.id}-${idx}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBehavior(value.id, idx)}
                          data-testid={`button-remove-behavior-${value.id}-${idx}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton
              onFileSelected={handleFileUpload}
              config={fileUploadConfigs.companyDocuments}
            />
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
