import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Business Overview",
    fields: [
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text", required: true },
      { name: "problem", label: "What problem does your business solve?", type: "textarea", required: true },
    ],
  },
  {
    id: 2,
    title: "Innovation",
    fields: [
      { name: "uniqueness", label: "What makes your idea different from competitors?", type: "textarea", required: true },
      { name: "technology", label: "What unique technology or approach do you use?", type: "textarea", required: true },
    ],
  },
  {
    id: 3,
    title: "Viability",
    fields: [
      { name: "experience", label: "Your relevant skills and experience", type: "textarea", required: true },
      { name: "funding", label: "Initial funding available (£)", type: "number", required: true },
      { name: "revenue", label: "Revenue model (how will you make money?)", type: "textarea", required: true },
    ],
  },
  {
    id: 4,
    title: "Scalability",
    fields: [
      { name: "jobCreation", label: "Job creation plans (number of employees in 3 years)", type: "number", required: true },
      { name: "expansion", label: "Market expansion strategy", type: "textarea", required: true },
      { name: "vision", label: "Long-term vision (5-year goals)", type: "textarea", required: true },
    ],
  },
];

export default function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    console.log('Next step clicked', formData);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Form submitted:', formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    console.log('Field updated:', name, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStep
                      ? "border-primary text-primary animate-pulse"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-sm text-muted-foreground text-right">
            {Math.round(progress)}% complete • ~{(steps.length - currentStep) * 2} minutes left
          </div>
        </div>

        {/* Form card */}
        <Card className="p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground mb-8">
            Great! Your {currentStepData.title.toLowerCase()} section looks strong
          </p>

          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="min-h-[120px]"
                    data-testid={`input-${field.name}`}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    data-testid={`input-${field.name}`}
                  />
                )}
                {formData[field.name] && field.type === "textarea" && (
                  <p className="text-xs text-muted-foreground">
                    {formData[field.name].length} characters
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Autosave indicator */}
          <div className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse" />
            Your progress is saved automatically
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} data-testid="button-next">
              {currentStep === steps.length - 1 ? "Generate Plan" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
