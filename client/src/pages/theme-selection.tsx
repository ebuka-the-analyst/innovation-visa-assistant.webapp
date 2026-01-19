import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Palette, 
  Type, 
  ArrowLeft, 
  Sparkles,
  ChevronRight,
  Eye,
  Wand2,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { THEME_TEMPLATES, AVAILABLE_FONTS, PRESET_COLORS, getThemeById, ThemeTemplate } from "@/lib/themeTemplates";
import { ThemePreviewSVG } from "@/components/ThemePreviewSVG";

interface ThemeSelectionProps {
  planId?: string;
  businessName?: string;
  founderName?: string;
  onThemeSelected?: (themeId: string, primaryColor: string, secondaryColor: string, font: string) => void;
}

export default function ThemeSelectionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#dc2626');
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [themeApplied, setThemeApplied] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: user } = useQuery<{ firstName?: string; lastName?: string; email?: string }>({
    queryKey: ['/api/auth/user'],
  });

  const founderName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || 'Your Name';

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.themeId) {
          setSelectedTheme(parsed.themeId);
          setPrimaryColor(parsed.primaryColor);
          setSecondaryColor(parsed.secondaryColor);
          setSelectedFont(parsed.font);
          setThemeApplied(true);
        }
      } catch (e) {
        console.error('Failed to parse saved theme');
      }
    }
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = getThemeById(themeId);
    if (theme) {
      setPrimaryColor(theme.defaultPrimaryColor);
      setSecondaryColor(theme.defaultSecondaryColor);
      setSelectedFont(theme.defaultFont);
    }
    setThemeApplied(false);
  };

  const handleColorSelect = (hex: string) => {
    setPrimaryColor(hex);
    setCustomPrimaryColor('');
    setThemeApplied(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomPrimaryColor(value);
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setPrimaryColor(value);
      setThemeApplied(false);
    }
  };

  const handlePreview = (theme: ThemeTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTheme(theme);
    setIsPreviewOpen(true);
  };

  const handleApplyFromPreview = () => {
    if (previewTheme) {
      handleThemeSelect(previewTheme.id);
      setIsPreviewOpen(false);
      handleApplyTheme();
    }
  };

  const handleApplyTheme = async () => {
    if (!selectedTheme) {
      toast({
        title: "Select a Theme",
        description: "Please choose a template before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    try {
      localStorage.setItem('selectedTheme', JSON.stringify({
        themeId: selectedTheme,
        primaryColor,
        secondaryColor,
        font: selectedFont,
      }));

      setThemeApplied(true);

      toast({
        title: "Theme Applied",
        description: "Your selected theme will be applied to your business plan.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply theme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleGeneratePlan = () => {
    navigate('/questionnaire?themeApplied=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="responsive-container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/questionnaire">
            <Button variant="outline" size="sm" data-testid="button-back-questionnaire">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questionnaire
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <Badge className="mb-4 bg-emerald-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Step 2 of 3
          </Badge>
          <h1 className="text-3xl font-bold mb-3">Choose Your Business Plan Theme</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a professional template and customize it to match your brand. 
            Your chosen theme will be applied to the cover page and throughout your entire business plan.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {THEME_TEMPLATES.map((theme, index) => {
            const isSelected = selectedTheme === theme.id;
            const displayPrimary = isSelected ? primaryColor : theme.defaultPrimaryColor;
            const displaySecondary = isSelected ? secondaryColor : theme.defaultSecondaryColor;
            const displayFont = isSelected ? selectedFont : theme.defaultFont;

            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-emerald-500 shadow-lg' 
                      : 'hover-elevate'
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                  data-testid={`card-theme-${theme.id}`}
                >
                  <div 
                    className="relative border rounded-lg overflow-hidden transition-all"
                    style={{ 
                      borderColor: isSelected ? displayPrimary : 'transparent',
                      boxShadow: isSelected ? `0 0 20px ${displayPrimary}40` : 'none'
                    }}
                  >
                    <ThemePreviewSVG
                      themeId={theme.id}
                      primaryColor={displayPrimary}
                      secondaryColor={displaySecondary}
                      font={displayFont}
                      founderName={founderName}
                      isSelected={isSelected}
                      size="small"
                    />
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 gap-1 bg-white/90 hover:bg-white shadow-md"
                      onClick={(e) => handlePreview(theme, e)}
                      data-testid={`button-preview-${theme.id}`}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{theme.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {theme.style}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {selectedTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Wand2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-semibold">Customize Your Theme</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4" />
                    Primary Color
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.id}
                        className={`w-10 h-10 rounded-lg transition-all border-2 ${
                          primaryColor === color.hex 
                            ? 'border-foreground scale-110' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => handleColorSelect(color.hex)}
                        title={color.name}
                        data-testid={`button-color-${color.id}`}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="text"
                        placeholder="#custom"
                        value={customPrimaryColor}
                        onChange={handleCustomColorChange}
                        className="w-24 h-10 px-2 text-sm border rounded-lg"
                        data-testid="input-custom-color"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4" />
                    Font Style
                  </Label>
                  <RadioGroup 
                    value={selectedFont} 
                    onValueChange={(val) => {
                      setSelectedFont(val);
                      setThemeApplied(false);
                    }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <div key={font.id}>
                        <RadioGroupItem
                          value={font.id}
                          id={font.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={font.id}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 cursor-pointer transition-all"
                          style={{ fontFamily: font.id }}
                          data-testid={`label-font-${font.id}`}
                        >
                          <span className="text-lg font-medium">Aa</span>
                          <span className="text-xs text-muted-foreground mt-1">{font.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Theme Preview</h3>
                      <p className="text-sm text-muted-foreground">
                        Your business plan will use these colors and fonts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-background shadow"
                        style={{ backgroundColor: primaryColor }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-background shadow"
                        style={{ backgroundColor: secondaryColor }}
                        title="Secondary Color"
                      />
                      <span 
                        className="text-sm font-medium px-2"
                        style={{ fontFamily: selectedFont }}
                      >
                        {selectedFont}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          {!themeApplied ? (
            <Button 
              size="lg"
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md min-w-[200px]"
              onClick={handleApplyTheme}
              disabled={!selectedTheme || isApplying}
              data-testid="button-apply-theme"
            >
              {isApplying ? (
                <>Applying...</>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Apply Theme
                </>
              )}
            </Button>
          ) : (
            <Button 
              size="lg"
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md min-w-[200px]"
              onClick={handleGeneratePlan}
              data-testid="button-generate-plan"
            >
              <FileText className="w-4 h-4" />
              Generate Plan
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {previewTheme?.name} - Full Preview
            </DialogTitle>
            <DialogDescription>
              This is how your business plan cover page will look with this theme.
            </DialogDescription>
          </DialogHeader>
          
          {previewTheme && (
            <div className="flex flex-col items-center py-6">
              <div className="shadow-2xl rounded-lg overflow-hidden border">
                <ThemePreviewSVG
                  themeId={previewTheme.id}
                  primaryColor={selectedTheme === previewTheme.id ? primaryColor : previewTheme.defaultPrimaryColor}
                  secondaryColor={selectedTheme === previewTheme.id ? secondaryColor : previewTheme.defaultSecondaryColor}
                  font={selectedTheme === previewTheme.id ? selectedFont : previewTheme.defaultFont}
                  founderName={founderName}
                  isSelected={false}
                  size="large"
                />
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                  data-testid="button-close-preview"
                >
                  Close
                </Button>
                <Button
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
                  onClick={handleApplyFromPreview}
                  data-testid="button-use-theme"
                >
                  <Wand2 className="w-4 h-4" />
                  Use This Theme
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
