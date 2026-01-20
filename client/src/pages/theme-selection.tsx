import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Palette, 
  Type, 
  ArrowLeft, 
  Sparkles,
  ChevronRight,
  Eye,
  Wand2,
  FileText,
  Upload,
  ImageIcon,
  X,
  Loader2,
  Edit2,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { THEME_TEMPLATES, AVAILABLE_FONTS, PRESET_COLORS, EXCEL_COLOR_THEMES, getPaletteById, getThemeById, ThemeTemplate, ExcelColorTheme } from "@/lib/themeTemplates";
import { ThemePreviewSVG } from "@/components/ThemePreviewSVG";
import { CoverPageEditor, TextElement } from "@/components/CoverPageEditor";
import { useTierAccess } from "@/hooks/useTierAccess";
import { Lock, Crown } from "lucide-react";

interface ThemeSelectionProps {
  planId?: string;
  businessName?: string;
  founderName?: string;
  onThemeSelected?: (themeId: string, primaryColor: string, secondaryColor: string, font: string) => void;
}

export default function ThemeSelectionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { hasAccessToTier } = useTierAccess();
  
  // Canva upload available to all paid tiers (Basic+)
  const canUploadCanva = hasAccessToTier('basic');
  
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#dc2626');
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [themeApplied, setThemeApplied] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [useFullCoverImage, setUseFullCoverImage] = useState(true);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [isSavingCover, setIsSavingCover] = useState(false);

  const { data: user } = useQuery<{ firstName?: string; lastName?: string; email?: string }>({
    queryKey: ['/api/auth/user'],
  });

  const { data: savedCoverDesign, isLoading: isLoadingCoverDesign, isFetched: isCoverDesignFetched } = useQuery<{
    id: string;
    themeId: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    font: string | null;
    backgroundImage: string | null;
    useFullCoverImage: boolean;
    textElements: TextElement[] | null;
    paletteId: string | null;
  } | null>({
    queryKey: ['/api/cover-designs/latest'],
    staleTime: 1000 * 60 * 5,
  });

  const [hasLoadedDesign, setHasLoadedDesign] = useState(false);

  useEffect(() => {
    if (hasLoadedDesign) return;
    if (!isCoverDesignFetched) return;
    
    if (savedCoverDesign) {
      if (savedCoverDesign.themeId) setSelectedTheme(savedCoverDesign.themeId);
      if (savedCoverDesign.primaryColor) setPrimaryColor(savedCoverDesign.primaryColor);
      if (savedCoverDesign.secondaryColor) setSecondaryColor(savedCoverDesign.secondaryColor);
      if (savedCoverDesign.font) setSelectedFont(savedCoverDesign.font);
      if (savedCoverDesign.backgroundImage) setBackgroundImage(savedCoverDesign.backgroundImage);
      if (savedCoverDesign.useFullCoverImage !== undefined) setUseFullCoverImage(savedCoverDesign.useFullCoverImage);
      if (savedCoverDesign.textElements) setTextElements(savedCoverDesign.textElements);
      if (savedCoverDesign.paletteId) setSelectedPalette(savedCoverDesign.paletteId);
      setHasLoadedDesign(true);
    } else {
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
            if (parsed.backgroundImage) {
              setBackgroundImage(parsed.backgroundImage);
            }
            if (parsed.useFullCoverImage !== undefined) {
              setUseFullCoverImage(parsed.useFullCoverImage);
            }
            if (parsed.textElements) {
              setTextElements(parsed.textElements);
            }
            if (parsed.paletteId) {
              setSelectedPalette(parsed.paletteId);
            }
          }
        } catch (e) {
          console.error('Failed to parse saved theme');
        }
      }
      setHasLoadedDesign(true);
    }
  }, [isCoverDesignFetched, savedCoverDesign, hasLoadedDesign]);

  const saveCoverDesignMutation = useMutation({
    mutationFn: async (data: {
      themeId: string | null;
      primaryColor: string;
      secondaryColor: string;
      font: string;
      backgroundImage: string | null;
      useFullCoverImage: boolean;
      textElements: TextElement[];
      paletteId: string | null;
      paletteColors: string[] | null;
    }) => {
      return apiRequest('POST', '/api/cover-designs', data);
    },
  });

  const founderName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || 'Your Name';

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 15MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBackgroundImage(base64);
        setThemeApplied(false);
        toast({
          title: "Image Uploaded",
          description: "Your background image has been added to the cover.",
        });
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload Failed",
          description: "Failed to read the image. Please try again.",
          variant: "destructive",
        });
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    setThemeApplied(false);
  };

  const compressImage = (base64: string, maxWidth: number = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const handleApplyTheme = async () => {
    if (!selectedTheme && !backgroundImage) {
      toast({
        title: "Select a Theme",
        description: "Please choose a template or upload a custom cover image.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    try {
      let compressedImage = backgroundImage;
      if (backgroundImage) {
        compressedImage = await compressImage(backgroundImage);
      }

      const themeData = {
        themeId: selectedTheme || 'custom-cover',
        primaryColor,
        secondaryColor,
        font: selectedFont,
        backgroundImage: compressedImage,
        useFullCoverImage,
        textElements,
        paletteId: selectedPalette,
        paletteColors: selectedPalette ? getPaletteById(selectedPalette)?.colors : null,
      };
      
      try {
        localStorage.setItem('selectedTheme', JSON.stringify(themeData));
      } catch (storageError: unknown) {
        if (storageError instanceof Error && 
            (storageError.name === 'QuotaExceededError' || 
             storageError.message.includes('quota'))) {
          const furtherCompressed = await compressImage(backgroundImage!, 800);
          themeData.backgroundImage = furtherCompressed;
          localStorage.setItem('selectedTheme', JSON.stringify(themeData));
        } else {
          throw storageError;
        }
      }

      setThemeApplied(true);

      toast({
        title: "Theme Applied",
        description: backgroundImage && useFullCoverImage 
          ? "Your custom cover page will be used for your business plan."
          : "Your selected theme will be applied to your business plan.",
      });
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast({
        title: "Error",
        description: error instanceof Error && error.message.includes('quota')
          ? "Image too large. Please use a smaller image (under 2MB recommended)."
          : "Failed to apply theme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGeneratePlan = async () => {
    setIsSubmitting(true);
    setShowGenerateConfirm(false);
    
    try {
      // Get saved questionnaire data from localStorage (correct key: autosave_questionnaire-form)
      const savedDataStr = localStorage.getItem('autosave_questionnaire-form');
      if (!savedDataStr) {
        toast({
          title: "Error",
          description: "No questionnaire data found. Please fill out the questionnaire first.",
          variant: "destructive",
        });
        navigate('/questionnaire');
        return;
      }
      
      const formData = JSON.parse(savedDataStr);
      const tier = formData.tier || 'premium';
      
      // Build submission payload with theme settings
      const data = {
        tier,
        businessName: formData.businessName,
        industry: formData.industry,
        problem: formData.problem,
        solution: formData.solution,
        uniqueness: formData.uniqueness,
        targetMarket: formData.targetMarket,
        revenue: formData.revenue,
        funding: parseInt(formData.funding) || 0,
        jobCreation: parseInt(formData.jobCreation) || 2,
        expansion: formData.expansion,
        vision: formData.vision,
        innovationStage: formData.innovationStage,
        productStatus: formData.productStatus,
        existingCustomers: formData.existingCustomers || '',
        betaTesters: formData.betaTesters || '',
        tractionEvidence: formData.tractionEvidence || '',
        techStack: formData.techStack,
        dataArchitecture: formData.dataArchitecture,
        aiMethodology: formData.aiMethodology,
        complianceDesign: formData.complianceDesign,
        patentStatus: formData.patentStatus,
        founderEducation: formData.founderEducation,
        founderWorkHistory: formData.founderWorkHistory,
        founderAchievements: formData.founderAchievements,
        relevantProjects: formData.relevantProjects,
        monthlyProjections: formData.monthlyProjections,
        customerAcquisitionCost: parseInt(formData.customerAcquisitionCost) || 0,
        lifetimeValue: parseInt(formData.lifetimeValue) || 0,
        paybackPeriod: parseInt(formData.paybackPeriod) || 1,
        fundingSources: formData.fundingSources,
        detailedCosts: formData.detailedCosts,
        competitors: formData.competitors,
        competitiveDifferentiation: formData.competitiveDifferentiation,
        customerInterviews: formData.customerInterviews,
        lettersOfIntent: formData.lettersOfIntent || '',
        willingnessToPay: formData.willingnessToPay,
        marketSize: formData.marketSize,
        regulatoryRequirements: formData.regulatoryRequirements,
        complianceTimeline: formData.complianceTimeline,
        complianceBudget: parseInt(formData.complianceBudget) || 0,
        hiringPlan: formData.hiringPlan,
        specificRegions: formData.specificRegions,
        internationalPlan: formData.internationalPlan || '',
        targetEndorser: formData.targetEndorser,
        contactPointsStrategy: formData.contactPointsStrategy,
        supportingEvidence: formData.supportingEvidence || '',
        // Computed fields required by backend validation
        technology: (formData.techStack || '') + "\n\n" + (formData.dataArchitecture || ''),
        experience: formData.experience || '',
        // Theme settings from current selection
        themeId: selectedTheme || null,
        themePrimaryColor: primaryColor || null,
        themeSecondaryColor: secondaryColor || null,
        themeFont: selectedFont || null,
        themeAppliedAt: selectedTheme ? new Date() : null,
        // Custom cover image (Canva uploads)
        backgroundImage: backgroundImage || null,
        useFullCoverImage: useFullCoverImage || false,
        textElements: textElements.length > 0 ? JSON.stringify(textElements) : null,
      };

      console.log('[ThemeSelection] Submitting with theme data:', {
        themeId: data.themeId,
        themePrimaryColor: data.themePrimaryColor,
        themeSecondaryColor: data.themeSecondaryColor,
        themeFont: data.themeFont,
        selectedTheme,
        primaryColor,
        secondaryColor,
        selectedFont,
      });

      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Submission failed');
      }

      if (responseData.planId) {
        // Create checkout session
        const checkoutResponse = await apiRequest('POST', '/api/payment/create-checkout', { 
          planId: responseData.planId 
        });
        const checkoutData = await checkoutResponse.json();

        if (!checkoutResponse.ok) {
          throw new Error(checkoutData.error || "Checkout failed");
        }

        // Clear saved questionnaire data on successful submission
        localStorage.removeItem('autosave_questionnaire-form');
        localStorage.removeItem('autosave_questionnaire-step');

        // Handle free tier - skip checkout and redirect directly
        if (checkoutData.skipCheckout && checkoutData.redirectUrl) {
          window.location.href = checkoutData.redirectUrl;
        } else if (checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          throw new Error("Checkout URL not received");
        }
      } else {
        throw new Error("Plan ID not received");
      }
    } catch (error) {
      console.error("Generation submission error:", error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "Failed to submit. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
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
                      backgroundImage={isSelected ? backgroundImage : null}
                      useFullCoverImage={isSelected ? useFullCoverImage : false}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 z-10 gap-1 bg-background/95 dark:bg-background/90 backdrop-blur-sm border-border text-foreground shadow-lg"
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
                    Color Theme (Excel Style)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a professional color palette. These colors will be available when styling text on your cover.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {EXCEL_COLOR_THEMES.slice(0, 16).map((palette) => (
                      <button
                        key={palette.id}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedPalette === palette.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => {
                          setSelectedPalette(palette.id);
                          setPrimaryColor(palette.colors[palette.primaryIndex]);
                          setSecondaryColor(palette.colors[palette.secondaryIndex]);
                          setThemeApplied(false);
                        }}
                        data-testid={`button-palette-${palette.id}`}
                      >
                        <div className="text-xs font-medium mb-2 truncate">{palette.name}</div>
                        <div className="flex gap-0.5">
                          {palette.colors.slice(0, 8).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 first:rounded-l last:rounded-r"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedPalette && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setSelectedPalette(null);
                        setThemeApplied(false);
                      }}
                      data-testid="button-clear-palette"
                    >
                      Clear palette selection
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4" />
                    Primary Color {selectedPalette && '(from palette)'}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AVAILABLE_FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 bg-popover p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${
                          selectedFont === font.id 
                            ? 'border-emerald-500' 
                            : 'border-muted'
                        }`}
                        style={{ fontFamily: font.id }}
                        onClick={() => {
                          setSelectedFont(font.id);
                          setThemeApplied(false);
                        }}
                        data-testid={`button-font-${font.id}`}
                      >
                        <span className="text-lg font-medium">Aa</span>
                        <span className="text-xs text-muted-foreground mt-1">{font.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4" />
                    Custom Cover Image (Canva, etc.)
                    {!canUploadCanva && (
                      <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Lock className="w-3 h-3 mr-1" />
                        Paid Tiers Only
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your own cover page design from Canva or any design tool. Your image will be used as the full cover page.
                  </p>
                  
                  {!canUploadCanva ? (
                    <div className="p-6 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-900/10 text-center">
                      <Lock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <h4 className="font-semibold text-lg mb-2">Custom Cover Upload</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to any paid plan to upload your own custom cover images from Canva or other design tools.
                      </p>
                      <Button 
                        onClick={() => navigate('/pricing')}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        data-testid="button-upgrade-for-canva"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade from £29
                      </Button>
                    </div>
                  ) : backgroundImage ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <div className="relative w-48 h-64 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-md">
                          <img 
                            src={backgroundImage} 
                            alt="Cover background" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border-border shadow-md"
                          onClick={handleRemoveImage}
                          data-testid="button-remove-image"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <input
                          type="checkbox"
                          id="useFullCover"
                          checked={useFullCoverImage}
                          onChange={(e) => {
                            setUseFullCoverImage(e.target.checked);
                            setThemeApplied(false);
                          }}
                          className="w-4 h-4 accent-emerald-500"
                          data-testid="checkbox-full-cover"
                        />
                        <label htmlFor="useFullCover" className="text-sm font-medium cursor-pointer">
                          Use as full cover page (recommended for Canva designs)
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        When enabled, your uploaded image becomes the entire cover page. When disabled, it appears as a background behind theme decorations.
                      </p>
                      
                      {useFullCoverImage && (
                        <Button
                          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md mt-2"
                          onClick={() => setIsEditorOpen(true)}
                          data-testid="button-edit-cover"
                        >
                          <Edit2 className="w-4 h-4" />
                          Add Text to Cover
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-64 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 cursor-pointer transition-all hover:border-emerald-500 hover:bg-muted/50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        data-testid="input-background-image"
                      />
                      {isUploadingImage ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload Cover Image</span>
                          <span className="text-xs text-muted-foreground/70 mt-1">PNG, JPG up to 15MB</span>
                        </>
                      )}
                    </label>
                  )}
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
              disabled={(!selectedTheme && !backgroundImage) || isApplying}
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
              onClick={() => setShowGenerateConfirm(true)}
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
                  backgroundImage={selectedTheme === previewTheme.id ? backgroundImage : null}
                  useFullCoverImage={selectedTheme === previewTheme.id ? useFullCoverImage : false}
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

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Cover Page Editor
            </DialogTitle>
            <DialogDescription>
              Add and position text elements on your cover page. Drag to move, double-click to edit text.
            </DialogDescription>
          </DialogHeader>
          
          {backgroundImage && (
            <div className="py-4">
              <CoverPageEditor
                backgroundImage={backgroundImage}
                textElements={textElements}
                onTextElementsChange={(elements) => {
                  setTextElements(elements);
                  setThemeApplied(false);
                }}
                paletteColors={selectedPalette ? getPaletteById(selectedPalette)?.colors : undefined}
              />
              
              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                  data-testid="button-cancel-editor"
                >
                  Cancel
                </Button>
                <Button
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
                  disabled={isSavingCover}
                  onClick={async () => {
                    setIsSavingCover(true);
                    try {
                      await saveCoverDesignMutation.mutateAsync({
                        themeId: selectedTheme,
                        primaryColor,
                        secondaryColor,
                        font: selectedFont,
                        backgroundImage,
                        useFullCoverImage,
                        textElements,
                        paletteId: selectedPalette,
                        paletteColors: selectedPalette ? getPaletteById(selectedPalette)?.colors || null : null,
                      });
                      queryClient.invalidateQueries({ queryKey: ['/api/cover-designs/latest'] });
                      setIsEditorOpen(false);
                      toast({
                        title: "Cover Saved",
                        description: "Your cover design has been saved permanently. You can access it anytime.",
                      });
                    } catch (error) {
                      setIsEditorOpen(false);
                      toast({
                        title: "Cover Updated Locally",
                        description: `${textElements.length} text element(s) added to your cover.`,
                      });
                    } finally {
                      setIsSavingCover(false);
                    }
                  }}
                  data-testid="button-save-cover"
                >
                  {isSavingCover ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSavingCover ? 'Saving...' : 'Save Cover Design'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Business Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will proceed to generate your professional business plan using the details you've provided.
              {themeApplied && (
                <span className="block mt-2 text-emerald-600 font-medium">
                  Your theme settings have been saved and will be applied to your plan.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-generate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleGeneratePlan}
              data-testid="button-confirm-generate"
            >
              Generate My Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-xl shadow-xl text-center max-w-md">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Submitting Your Plan</h3>
            <p className="text-muted-foreground">
              Please wait while we process your business plan with your selected theme...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
