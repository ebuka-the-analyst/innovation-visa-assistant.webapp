import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Cpu,
  Wallet,
  Heart,
  Leaf,
  GraduationCap,
  Home,
  Wheat,
  ShoppingCart,
  CheckCircle2,
  Info,
  Sparkles,
  ChevronRight,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IndustryProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  visaCriticalFactors: string[];
  innovationMarkers: string[];
  scalabilityIndicators: string[];
  viabilityMetrics: string[];
  requiredSections: string[];
  optionalSections: string[];
  sortOrder: number;
}

interface IndustryConfiguratorProps {
  selectedIndustry?: string;
  onSelect: (industry: IndustryProfile) => void;
  compact?: boolean;
}

const getIndustryIcon = (slug: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'ai-saas': Cpu,
    'fintech': Wallet,
    'healthtech': Heart,
    'cleantech': Leaf,
    'edtech': GraduationCap,
    'real-estate-proptech': Home,
    'food-agritech': Wheat,
    'e-commerce-retail': ShoppingCart
  };
  return iconMap[slug] || Building2;
};

const getIndustryGradient = (slug: string) => {
  const gradientMap: Record<string, string> = {
    'ai-saas': 'from-violet-500 to-purple-600',
    'fintech': 'from-emerald-500 to-teal-600',
    'healthtech': 'from-red-500 to-rose-600',
    'cleantech': 'from-green-500 to-lime-600',
    'edtech': 'from-blue-500 to-indigo-600',
    'real-estate-proptech': 'from-orange-500 to-amber-600',
    'food-agritech': 'from-yellow-500 to-orange-600',
    'e-commerce-retail': 'from-pink-500 to-fuchsia-600'
  };
  return gradientMap[slug] || 'from-gray-500 to-slate-600';
};

export function IndustryConfigurator({ selectedIndustry, onSelect, compact = false }: IndustryConfiguratorProps) {
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);

  const { data: industries = [], isLoading } = useQuery<IndustryProfile[]>({
    queryKey: ['/api/industries']
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-muted mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4" data-testid="industry-configurator-compact">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {industries.map((industry) => {
            const IconComponent = getIndustryIcon(industry.slug);
            const isSelected = selectedIndustry === industry.slug;
            return (
              <motion.button
                key={industry.slug}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(industry)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all text-left",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20"
                )}
                data-testid={`button-industry-${industry.slug}`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="industry-selected-indicator"
                    className="absolute top-2 right-2"
                    initial={false}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                  `bg-gradient-to-br ${getIndustryGradient(industry.slug)}`
                )}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="font-medium text-sm">{industry.name}</div>
              </motion.button>
            );
          })}
        </div>

        {selectedIndustry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {(() => {
              const industry = industries.find(i => i.slug === selectedIndustry);
              if (!industry) return null;
              return (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        `bg-gradient-to-br ${getIndustryGradient(industry.slug)}`
                      )}>
                        {(() => {
                          const IconComponent = getIndustryIcon(industry.slug);
                          return <IconComponent className="h-5 w-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{industry.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {industry.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {industry.visaCriticalFactors.slice(0, 4).map((factor, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                          {industry.visaCriticalFactors.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{industry.visaCriticalFactors.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="industry-configurator">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Select Your Industry</h2>
        <p className="text-muted-foreground">
          Choose the sector that best matches your business. This helps us tailor the questionnaire and provide industry-specific guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {industries.map((industry) => {
          const IconComponent = getIndustryIcon(industry.slug);
          const isSelected = selectedIndustry === industry.slug;
          const isHovered = hoveredIndustry === industry.slug;

          return (
            <TooltipProvider key={industry.slug}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredIndustry(industry.slug)}
                    onHoverEnd={() => setHoveredIndustry(null)}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300 h-full",
                        isSelected 
                          ? "border-2 border-primary shadow-lg shadow-primary/10" 
                          : "border hover:border-primary/40 hover:shadow-md"
                      )}
                      onClick={() => onSelect(industry)}
                      data-testid={`card-industry-${industry.slug}`}
                    >
                      <CardContent className="p-6 relative">
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </motion.div>
                        )}

                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300",
                          `bg-gradient-to-br ${getIndustryGradient(industry.slug)}`,
                          isHovered && "scale-110"
                        )}>
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{industry.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {industry.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span>{industry.visaCriticalFactors.length} visa factors</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-4">
                  <div className="space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Visa-Critical Factors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {industry.visaCriticalFactors.slice(0, 5).map((factor, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedIndustry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {(() => {
              const industry = industries.find(i => i.slug === selectedIndustry);
              if (!industry) return null;
              
              return (
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        `bg-gradient-to-br ${getIndustryGradient(industry.slug)}`
                      )}>
                        {(() => {
                          const IconComponent = getIndustryIcon(industry.slug);
                          return <IconComponent className="h-6 w-6 text-white" />;
                        })()}
                      </div>
                      <div>
                        <CardTitle>{industry.name}</CardTitle>
                        <CardDescription>{industry.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Visa-Critical Factors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {industry.visaCriticalFactors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-300">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Innovation Markers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {industry.innovationMarkers.map((marker, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300">
                              {marker}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Required Sections
                        </h4>
                        <ul className="space-y-1.5">
                          {industry.requiredSections.map((section, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {industry.optionalSections.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                            Optional Sections
                          </h4>
                          <ul className="space-y-1.5">
                            {industry.optionalSections.map((section, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}