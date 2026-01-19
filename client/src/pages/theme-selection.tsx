import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Palette, 
  Type, 
  Check, 
  ArrowLeft, 
  Sparkles,
  ChevronRight,
  Eye,
  Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { THEME_TEMPLATES, AVAILABLE_FONTS, PRESET_COLORS, getThemeById, ThemeTemplate } from "@/lib/themeTemplates";

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

  const { data: user } = useQuery<{ firstName?: string; lastName?: string; email?: string }>({
    queryKey: ['/api/auth/user'],
  });

  const founderName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || 'Your Name';

  const currentYear = new Date().getFullYear();

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = getThemeById(themeId);
    if (theme) {
      setPrimaryColor(theme.defaultPrimaryColor);
      setSecondaryColor(theme.defaultSecondaryColor);
      setSelectedFont(theme.defaultFont);
    }
  };

  const handleColorSelect = (hex: string) => {
    setPrimaryColor(hex);
    setCustomPrimaryColor('');
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomPrimaryColor(value);
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setPrimaryColor(value);
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

      toast({
        title: "Theme Applied",
        description: "Your selected theme will be applied to your business plan.",
      });

      navigate('/questionnaire?themeApplied=true');
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

  const renderThemePreview = (theme: ThemeTemplate, isSelected: boolean) => {
    const previewPrimary = isSelected ? primaryColor : theme.defaultPrimaryColor;
    const previewSecondary = isSelected ? secondaryColor : theme.defaultSecondaryColor;
    const previewFont = isSelected ? selectedFont : theme.defaultFont;

    return (
      <div 
        className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all"
        style={{ 
          borderColor: isSelected ? previewPrimary : 'transparent',
          boxShadow: isSelected ? `0 0 20px ${previewPrimary}40` : 'none'
        }}
      >
        {theme.id === 'white-red-modern' && (
          <div className="w-full h-full bg-gray-50 relative p-4">
            <div 
              className="absolute top-0 right-0 w-32 h-32"
              style={{ 
                background: `linear-gradient(135deg, transparent 50%, ${previewPrimary} 50%)`,
                borderBottomLeftRadius: '100%'
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-24 h-24"
              style={{ 
                background: `linear-gradient(315deg, ${previewPrimary} 50%, transparent 50%)`,
                borderTopRightRadius: '100%'
              }}
            />
            <div className="relative z-10 h-full flex flex-col justify-center px-2">
              <p className="text-[8px] text-gray-400 mb-1">LOGO</p>
              <h3 
                className="text-lg font-bold mb-1"
                style={{ fontFamily: previewFont, color: previewSecondary }}
              >
                BUSINESS
              </h3>
              <h3 
                className="text-lg font-bold"
                style={{ fontFamily: previewFont, color: previewPrimary }}
              >
                PLAN
              </h3>
              <div className="w-8 h-0.5 my-2" style={{ backgroundColor: previewSecondary }} />
              <p className="text-[7px] text-gray-600" style={{ fontFamily: previewFont }}>
                {founderName}'s Business
              </p>
              <p className="text-[6px] text-gray-400 mt-auto">{currentYear}</p>
            </div>
          </div>
        )}

        {theme.id === 'white-red-corporate' && (
          <div className="w-full h-full bg-white relative p-4 overflow-hidden">
            <div className="absolute top-2 left-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 rotate-90"
                  style={{ 
                    backgroundColor: i === 1 ? previewPrimary : '#e5e7eb',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}
                />
              ))}
            </div>
            <div className="absolute bottom-4 right-2 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 rotate-90"
                  style={{ 
                    backgroundColor: i % 2 === 0 ? previewPrimary : '#e5e7eb',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                  }}
                />
              ))}
            </div>
            <div className="h-full flex flex-col justify-center items-center text-center">
              <p 
                className="text-[8px] mb-2"
                style={{ color: previewPrimary, fontFamily: previewFont }}
              >
                {founderName}
              </p>
              <h3 
                className="text-base font-bold mb-1"
                style={{ fontFamily: previewFont, color: previewSecondary }}
              >
                BUSINESS PLAN
              </h3>
              <p className="text-[6px] text-gray-500 italic mb-1" style={{ fontFamily: previewFont }}>
                Strategic Solutions for Success
              </p>
              <p 
                className="text-sm font-bold"
                style={{ color: previewPrimary, fontFamily: previewFont }}
              >
                {currentYear}
              </p>
            </div>
          </div>
        )}

        {theme.id === 'blue-modern' && (
          <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: '#f0f9ff' }}>
            <div 
              className="absolute top-0 left-0 w-full h-1/3"
              style={{ 
                background: `linear-gradient(180deg, ${previewPrimary}20 0%, transparent 100%)`
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-full h-12"
              style={{ backgroundColor: previewSecondary }}
            />
            <div 
              className="absolute top-1/3 right-4 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${previewPrimary}30` }}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: `${previewPrimary}50` }}
              />
            </div>
            <div className="relative z-10 h-full flex flex-col p-4">
              <p 
                className="text-[8px] text-right mb-4"
                style={{ color: previewSecondary, fontFamily: previewFont }}
              >
                {founderName}
              </p>
              <div className="flex-1 flex flex-col justify-center">
                <h3 
                  className="text-lg font-bold leading-tight"
                  style={{ fontFamily: previewFont, color: previewSecondary }}
                >
                  BUSINESS
                </h3>
                <h3 
                  className="text-lg font-bold"
                  style={{ fontFamily: previewFont, color: previewSecondary }}
                >
                  PLAN
                </h3>
                <p 
                  className="text-[7px] mt-1"
                  style={{ color: previewPrimary, fontFamily: previewFont }}
                >
                  Innovative Strategy
                </p>
                <p 
                  className="text-sm font-bold mt-2"
                  style={{ color: previewSecondary, fontFamily: previewFont }}
                >
                  {currentYear}
                </p>
              </div>
              <p className="text-[6px] text-white" style={{ fontFamily: previewFont }}>
                PREPARED BY: {founderName.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {isSelected && (
          <div 
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: previewPrimary }}
          >
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
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
          {THEME_TEMPLATES.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all ${
                  selectedTheme === theme.id 
                    ? 'ring-2 ring-emerald-500 shadow-lg' 
                    : 'hover-elevate'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
                data-testid={`card-theme-${theme.id}`}
              >
                {renderThemePreview(theme, selectedTheme === theme.id)}
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
          ))}
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
                    onValueChange={setSelectedFont}
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

        <div className="flex justify-center mt-8">
          <Button 
            size="lg"
            className="gap-2 bg-emerald-500 text-white font-semibold shadow-md min-w-[200px]"
            onClick={handleApplyTheme}
            disabled={!selectedTheme || isApplying}
            data-testid="button-apply-theme"
          >
            {isApplying ? (
              <>Applying...</>
            ) : (
              <>
                Apply Theme & Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
