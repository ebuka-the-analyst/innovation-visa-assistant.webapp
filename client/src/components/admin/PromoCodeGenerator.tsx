import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Wand2,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Tag,
  Percent,
  PoundSterling,
  Clock,
  Users,
  Target,
  Zap,
  Shield,
  Gift,
  Crown,
  Star,
  Rocket,
  TrendingUp,
  Calendar as CalendarIcon,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  Settings,
  Layers,
  Hash,
  Type,
  Shuffle,
} from "lucide-react";

/** 
 * Represents a generated promo code in memory before saving to database.
 * Currency values (minPurchaseAmount, discountValue for fixed type) are in GBP pounds.
 * The API converts to pence when saving to the database.
 */
interface GeneratedCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  /** For percentage: 0-100 percent. For fixed: amount in GBP pounds */
  discountValue: number;
  maxTotalUses: number | null;
  maxUsesPerUser: number;
  validFrom: Date | null;
  validUntil: Date | null;
  eligibleTiers: string[] | null;
  /** Minimum purchase amount in GBP pounds (converted to pence by API) */
  minPurchaseAmount: number | null;
}

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prefix: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validityDays: number;
  color: string;
}

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Discount',
    description: 'New user welcome offer',
    icon: <Gift className="h-5 w-5" />,
    prefix: 'WELCOME',
    discountType: 'percentage',
    discountValue: 20,
    validityDays: 30,
    color: 'text-green-500',
  },
  {
    id: 'seasonal',
    name: 'Seasonal Sale',
    description: 'Limited time seasonal offer',
    icon: <Star className="h-5 w-5" />,
    prefix: 'SEASON',
    discountType: 'percentage',
    discountValue: 25,
    validityDays: 14,
    color: 'text-amber-500',
  },
  {
    id: 'vip',
    name: 'VIP Exclusive',
    description: 'Special offer for premium users',
    icon: <Crown className="h-5 w-5" />,
    prefix: 'VIP',
    discountType: 'percentage',
    discountValue: 30,
    validityDays: 7,
    color: 'text-purple-500',
  },
  {
    id: 'flash',
    name: 'Flash Sale',
    description: '24-hour limited offer',
    icon: <Zap className="h-5 w-5" />,
    prefix: 'FLASH',
    discountType: 'percentage',
    discountValue: 40,
    validityDays: 1,
    color: 'text-yellow-500',
  },
  {
    id: 'partner',
    name: 'Partner Code',
    description: 'Affiliate & partner discount',
    icon: <Users className="h-5 w-5" />,
    prefix: 'PARTNER',
    discountType: 'percentage',
    discountValue: 15,
    validityDays: 90,
    color: 'text-blue-500',
  },
  {
    id: 'launch',
    name: 'Launch Special',
    description: 'Product launch promotion',
    icon: <Rocket className="h-5 w-5" />,
    prefix: 'LAUNCH',
    discountType: 'fixed',
    discountValue: 10,
    validityDays: 7,
    color: 'text-rose-500',
  },
];

const WORD_POOLS = {
  adjectives: ['SUPER', 'MEGA', 'ULTRA', 'PRIME', 'ELITE', 'GOLDEN', 'ROYAL', 'SPECIAL', 'EXCLUSIVE', 'PREMIUM'],
  nouns: ['SAVE', 'DEAL', 'OFFER', 'GIFT', 'BONUS', 'REWARD', 'PROMO', 'SALE', 'VALUE', 'WIN'],
  visa: ['VISA', 'FOUNDER', 'INNOVATOR', 'UK', 'STARTUP', 'BUSINESS', 'SUCCESS', 'DREAM'],
  months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
};

export function PromoCodeGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('single');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validFromOpen, setValidFromOpen] = useState(false);
  const [validUntilOpen, setValidUntilOpen] = useState(false);
  
  const [codeConfig, setCodeConfig] = useState({
    prefix: '',
    suffix: '',
    pattern: 'alphanumeric',
    length: 8,
    includeNumbers: true,
    includeLetters: true,
    separator: '',
    separatorPosition: 4,
  });
  
  const [discountConfig, setDiscountConfig] = useState({
    type: 'percentage' as 'percentage' | 'fixed',
    value: 20,
    maxTotalUses: null as number | null,
    maxUsesPerUser: 1,
    validFrom: null as Date | null,
    validUntil: null as Date | null,
    minPurchaseAmount: null as number | null,
  });
  
  const [targetingConfig, setTargetingConfig] = useState({
    eligibleTiers: [] as string[],
    newUsersOnly: false,
    firstPurchaseOnly: false,
  });
  
  const [bulkConfig, setBulkConfig] = useState({
    quantity: 10,
    uniquePerUser: true,
    batchName: '',
  });

  const generateRandomString = useCallback((length: number, pattern: string): string => {
    let chars = '';
    if (pattern === 'alphanumeric' || pattern === 'letters') {
      chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (pattern === 'alphanumeric' || pattern === 'numbers') {
      chars += '0123456789';
    }
    if (pattern === 'memorable') {
      const adj = WORD_POOLS.adjectives[Math.floor(Math.random() * WORD_POOLS.adjectives.length)];
      const noun = WORD_POOLS.nouns[Math.floor(Math.random() * WORD_POOLS.nouns.length)];
      const num = Math.floor(Math.random() * 100);
      return `${adj}${noun}${num}`;
    }
    if (pattern === 'visa-themed') {
      const visa = WORD_POOLS.visa[Math.floor(Math.random() * WORD_POOLS.visa.length)];
      const num = Math.floor(Math.random() * 1000);
      return `${visa}${num}`;
    }
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const generateSingleCode = useCallback((): string => {
    let code = '';
    
    if (codeConfig.prefix) {
      code += codeConfig.prefix.toUpperCase();
    }
    
    const randomPart = generateRandomString(codeConfig.length, codeConfig.pattern);
    
    if (codeConfig.separator && codeConfig.separatorPosition > 0) {
      const parts = [];
      for (let i = 0; i < randomPart.length; i += codeConfig.separatorPosition) {
        parts.push(randomPart.slice(i, i + codeConfig.separatorPosition));
      }
      code += parts.join(codeConfig.separator);
    } else {
      code += randomPart;
    }
    
    if (codeConfig.suffix) {
      code += codeConfig.suffix.toUpperCase();
    }
    
    return code;
  }, [codeConfig, generateRandomString]);

  const handleGenerateSingle = useCallback(() => {
    const code = generateSingleCode();
    const validUntil = discountConfig.validUntil || 
      (selectedTemplate ? new Date(Date.now() + CODE_TEMPLATES.find(t => t.id === selectedTemplate)!.validityDays * 24 * 60 * 60 * 1000) : null);
    
    const newCode: GeneratedCode = {
      code,
      discountType: discountConfig.type,
      discountValue: discountConfig.value,
      maxTotalUses: discountConfig.maxTotalUses,
      maxUsesPerUser: discountConfig.maxUsesPerUser,
      validFrom: discountConfig.validFrom,
      validUntil,
      eligibleTiers: targetingConfig.eligibleTiers.length > 0 ? targetingConfig.eligibleTiers : null,
      minPurchaseAmount: discountConfig.minPurchaseAmount,
    };
    
    setGeneratedCodes([newCode, ...generatedCodes]);
  }, [generateSingleCode, discountConfig, targetingConfig, selectedTemplate, generatedCodes]);

  const handleGenerateBulk = useCallback(() => {
    const codes: GeneratedCode[] = [];
    const validUntil = discountConfig.validUntil || 
      (selectedTemplate ? new Date(Date.now() + CODE_TEMPLATES.find(t => t.id === selectedTemplate)!.validityDays * 24 * 60 * 60 * 1000) : null);
    
    for (let i = 0; i < bulkConfig.quantity; i++) {
      const code = generateSingleCode();
      codes.push({
        code,
        discountType: discountConfig.type,
        discountValue: discountConfig.value,
        maxTotalUses: discountConfig.maxTotalUses,
        maxUsesPerUser: bulkConfig.uniquePerUser ? 1 : discountConfig.maxUsesPerUser,
        validFrom: discountConfig.validFrom,
        validUntil,
        eligibleTiers: targetingConfig.eligibleTiers.length > 0 ? targetingConfig.eligibleTiers : null,
        minPurchaseAmount: discountConfig.minPurchaseAmount,
      });
    }
    
    setGeneratedCodes([...codes, ...generatedCodes]);
    toast({ title: `Generated ${bulkConfig.quantity} promo codes` });
  }, [generateSingleCode, discountConfig, targetingConfig, bulkConfig, selectedTemplate, generatedCodes, toast]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = CODE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    setSelectedTemplate(templateId);
    setCodeConfig(prev => ({ ...prev, prefix: template.prefix }));
    setDiscountConfig(prev => ({
      ...prev,
      type: template.discountType,
      value: template.discountValue,
      validUntil: new Date(Date.now() + template.validityDays * 24 * 60 * 60 * 1000),
    }));
  }, []);

  const createPromoCodeMutation = useMutation({
    mutationFn: async (code: GeneratedCode) => {
      const response = await apiRequest('POST', '/api/admin/promos', {
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue,
        maxTotalUses: code.maxTotalUses,
        maxUsesPerUser: code.maxUsesPerUser,
        validFrom: code.validFrom?.toISOString() || null,
        validUntil: code.validUntil?.toISOString() || null,
        eligibleTiers: code.eligibleTiers,
        minPurchaseAmount: code.minPurchaseAmount,
      });
      return response;
    },
    onSuccess: (_, savedCode) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promos'] });
      toast({ title: "Promo code saved successfully" });
      // Remove this code from the list after successful save
      setGeneratedCodes(prev => prev.filter(c => c.code !== savedCode.code));
    },
    onError: (error: any) => {
      const details = error?.details || error?.message || 'Unknown error';
      toast({ title: "Failed to save promo code", description: details, variant: "destructive" });
    },
  });

  const createBulkPromoCodesMutation = useMutation({
    mutationFn: async (codes: GeneratedCode[]) => {
      // Convert dates to ISO strings for proper JSON serialization
      const serializedCodes = codes.map(c => ({
        ...c,
        validFrom: c.validFrom?.toISOString() || null,
        validUntil: c.validUntil?.toISOString() || null,
      }));
      await apiRequest('POST', '/api/admin/promos/bulk', { codes: serializedCodes, batchName: bulkConfig.batchName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promos'] });
      toast({ title: `Successfully saved ${generatedCodes.length} promo codes` });
      setGeneratedCodes([]);
    },
    onError: (error: any) => {
      const details = error?.details || error?.message || 'Unknown error';
      toast({ title: "Failed to save promo codes", description: details, variant: "destructive" });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  const copyAllCodes = () => {
    const codes = generatedCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codes);
    toast({ title: `Copied ${generatedCodes.length} codes to clipboard` });
  };

  const exportCodes = () => {
    const csv = [
      'Code,Discount Type,Discount Value,Max Uses,Valid From,Valid Until,Eligible Tiers,Min Purchase',
      ...generatedCodes.map(c => 
        `${c.code},${c.discountType},${c.discountValue},${c.maxTotalUses || 'Unlimited'},${c.validFrom ? format(c.validFrom, 'yyyy-MM-dd') : 'N/A'},${c.validUntil ? format(c.validUntil, 'yyyy-MM-dd') : 'N/A'},${c.eligibleTiers?.join(';') || 'All'},${c.minPurchaseAmount || 'None'}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promo-codes-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported codes to CSV" });
  };

  const removeCode = (index: number) => {
    setGeneratedCodes(generatedCodes.filter((_, i) => i !== index));
  };

  const clearAllCodes = () => {
    setGeneratedCodes([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-500" />
            Smart Promo Code Generator
          </h2>
          <p className="text-muted-foreground">Create intelligent, targeted promotional codes</p>
        </div>
        <Badge variant="outline" className="text-purple-500 border-purple-500/30">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Quick Templates
              </CardTitle>
              <CardDescription>Start with a pre-configured template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CODE_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer hover-elevate border-2 transition-all ${
                      selectedTemplate === template.id 
                        ? 'border-purple-500 bg-purple-500/5' 
                        : 'border-transparent hover:border-muted-foreground/20'
                    }`}
                    onClick={() => applyTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className={`${template.color} mb-2`}>{template.icon}</div>
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.discountType === 'percentage' ? `${template.discountValue}%` : `£${template.discountValue}`}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.validityDays}d
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Single Code
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Bulk Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-green-500" />
                    Code Format
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        placeholder="e.g., WELCOME"
                        value={codeConfig.prefix}
                        onChange={(e) => setCodeConfig({ ...codeConfig, prefix: e.target.value.toUpperCase() })}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Suffix</Label>
                      <Input
                        placeholder="e.g., 2024"
                        value={codeConfig.suffix}
                        onChange={(e) => setCodeConfig({ ...codeConfig, suffix: e.target.value.toUpperCase() })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pattern Style</Label>
                    <Select
                      value={codeConfig.pattern}
                      onValueChange={(v) => setCodeConfig({ ...codeConfig, pattern: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alphanumeric">Alphanumeric (ABC123)</SelectItem>
                        <SelectItem value="letters">Letters Only (ABCDEF)</SelectItem>
                        <SelectItem value="numbers">Numbers Only (123456)</SelectItem>
                        <SelectItem value="memorable">Memorable Words (SUPERBONUS42)</SelectItem>
                        <SelectItem value="visa-themed">Visa Themed (FOUNDER789)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Random Length: {codeConfig.length}</Label>
                    </div>
                    <Slider
                      value={[codeConfig.length]}
                      onValueChange={([v]) => setCodeConfig({ ...codeConfig, length: v })}
                      min={4}
                      max={16}
                      step={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Separator</Label>
                      <Select
                        value={codeConfig.separator || "none"}
                        onValueChange={(v) => setCodeConfig({ ...codeConfig, separator: v === "none" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="-">Dash (-)</SelectItem>
                          <SelectItem value="_">Underscore (_)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Every N Characters</Label>
                      <Input
                        type="number"
                        min={2}
                        max={8}
                        value={codeConfig.separatorPosition}
                        onChange={(e) => setCodeConfig({ ...codeConfig, separatorPosition: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Preview</Label>
                    <p className="font-mono text-lg font-bold mt-1">{generateSingleCode()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                    Bulk Generation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Batch Name (optional)</Label>
                    <Input
                      placeholder="e.g., Summer Campaign 2024"
                      value={bulkConfig.batchName}
                      onChange={(e) => setBulkConfig({ ...bulkConfig, batchName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Number of Codes: {bulkConfig.quantity}</Label>
                    </div>
                    <Slider
                      value={[bulkConfig.quantity]}
                      onValueChange={([v]) => setBulkConfig({ ...bulkConfig, quantity: v })}
                      min={5}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <Label>One use per code (unique codes)</Label>
                    </div>
                    <Switch
                      checked={bulkConfig.uniquePerUser}
                      onCheckedChange={(v) => setBulkConfig({ ...bulkConfig, uniquePerUser: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {discountConfig.type === 'percentage' ? (
                  <Percent className="h-5 w-5 text-green-500" />
                ) : (
                  <PoundSterling className="h-5 w-5 text-green-500" />
                )}
                Discount Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={discountConfig.type}
                    onValueChange={(v: 'percentage' | 'fixed') => 
                      setDiscountConfig({ ...discountConfig, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    min={1}
                    max={discountConfig.type === 'percentage' ? 100 : undefined}
                    value={discountConfig.value}
                    onChange={(e) => setDiscountConfig({ ...discountConfig, value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Total Uses</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={discountConfig.maxTotalUses || ''}
                    onChange={(e) => setDiscountConfig({ 
                      ...discountConfig, 
                      maxTotalUses: e.target.value ? Number(e.target.value) : null 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Purchase (£)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="No minimum"
                    value={discountConfig.minPurchaseAmount || ''}
                    onChange={(e) => setDiscountConfig({ 
                      ...discountConfig, 
                      minPurchaseAmount: e.target.value ? Number(e.target.value) : null 
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setValidFromOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {discountConfig.validFrom ? format(discountConfig.validFrom, 'PPP') : 'Immediately'}
                  </Button>
                  <Dialog open={validFromOpen} onOpenChange={setValidFromOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select Start Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={discountConfig.validFrom || undefined}
                          onSelect={(date) => {
                            setDiscountConfig({ ...discountConfig, validFrom: date || null });
                            setValidFromOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setValidUntilOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {discountConfig.validUntil ? format(discountConfig.validUntil, 'PPP') : 'No expiry'}
                  </Button>
                  <Dialog open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select End Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={discountConfig.validUntil || undefined}
                          onSelect={(date) => {
                            setDiscountConfig({ ...discountConfig, validUntil: date || null });
                            setValidUntilOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Targeting Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Eligible Tiers</Label>
                <div className="flex flex-wrap gap-2">
                  {['free', 'basic', 'premium', 'enterprise', 'ultimate'].map((tier) => (
                    <Badge
                      key={tier}
                      variant={targetingConfig.eligibleTiers.includes(tier) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        const tiers = targetingConfig.eligibleTiers.includes(tier)
                          ? targetingConfig.eligibleTiers.filter(t => t !== tier)
                          : [...targetingConfig.eligibleTiers, tier];
                        setTargetingConfig({ ...targetingConfig, eligibleTiers: tiers });
                      }}
                    >
                      {tier}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Leave empty to allow all tiers</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <Label>New Users Only</Label>
                </div>
                <Switch
                  checked={targetingConfig.newUsersOnly}
                  onCheckedChange={(v) => setTargetingConfig({ ...targetingConfig, newUsersOnly: v })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-500" />
                  <Label>First Purchase Only</Label>
                </div>
                <Switch
                  checked={targetingConfig.firstPurchaseOnly}
                  onCheckedChange={(v) => setTargetingConfig({ ...targetingConfig, firstPurchaseOnly: v })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={activeTab === 'single' ? handleGenerateSingle : handleGenerateBulk}
              className="flex-1"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              {activeTab === 'single' ? 'Generate Code' : `Generate ${bulkConfig.quantity} Codes`}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={activeTab === 'single' ? handleGenerateSingle : handleGenerateBulk}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-500" />
                  Generated Codes
                  <Badge variant="secondary" className="text-amber-600 bg-amber-100">Not Saved</Badge>
                </CardTitle>
                <Badge>{generatedCodes.length}</Badge>
              </div>
              <CardDescription className="text-amber-600">
                Click "Save" on each code or "Save All to Database" below to activate them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedCodes.length > 0 ? (
                <>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyAllCodes} className="flex-1">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy All
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportCodes} className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" onClick={clearAllCodes} className="w-full">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                  <Separator />
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {generatedCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="font-mono font-bold">{code.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {code.discountType === 'percentage' ? `${code.discountValue}%` : `£${code.discountValue}`} off
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createPromoCodeMutation.mutate(code)}
                              disabled={createPromoCodeMutation.isPending}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeCode(index)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator />
                  <Button 
                    className="w-full" 
                    onClick={() => createBulkPromoCodesMutation.mutate(generatedCodes)}
                    disabled={createBulkPromoCodesMutation.isPending}
                  >
                    {createBulkPromoCodesMutation.isPending ? 'Saving...' : 'Save All to Database'}
                  </Button>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Tag className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No codes generated yet.<br />Configure and click Generate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Use memorable codes for social media campaigns and random codes for email campaigns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
