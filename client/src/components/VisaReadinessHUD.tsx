import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  Lightbulb,
  TrendingUp,
  Rocket,
  Shield,
  Award,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface VisaReadinessHUDProps {
  innovationScore: number;
  viabilityScore: number;
  scalabilityScore: number;
  overallReadiness: number;
  approvalProbability: number;
  currentStreak: number;
  totalXP: number;
  sectionsCompleted: number;
  totalSections: number;
  questionsAnswered: number;
  totalQuestions: number;
  milestones?: Array<{
    id: string;
    title: string;
    icon: string;
    tier: string;
  }>;
}

export default function VisaReadinessHUD({
  innovationScore,
  viabilityScore,
  scalabilityScore,
  overallReadiness,
  approvalProbability,
  currentStreak,
  totalXP,
  sectionsCompleted,
  totalSections,
  questionsAnswered,
  totalQuestions,
  milestones = []
}: VisaReadinessHUDProps) {
  const radarData = [
    { criterion: 'Innovation', score: innovationScore, fullMark: 100 },
    { criterion: 'Viability', score: viabilityScore, fullMark: 100 },
    { criterion: 'Scalability', score: scalabilityScore, fullMark: 100 },
  ];

  const getReadinessLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (score >= 75) return { label: 'Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    if (score >= 40) return { label: 'Developing', color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
    return { label: 'Building', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
  };

  const readinessLevel = getReadinessLevel(overallReadiness);

  const criteriaDetails = [
    {
      name: 'Innovation',
      score: innovationScore,
      icon: Lightbulb,
      color: '#005EB8',
      description: 'Technical uniqueness & IP potential'
    },
    {
      name: 'Viability',
      score: viabilityScore,
      icon: TrendingUp,
      color: '#41B6E6',
      description: 'Financial sustainability & market validation'
    },
    {
      name: 'Scalability',
      score: scalabilityScore,
      icon: Rocket,
      color: '#22c55e',
      description: 'Growth potential & job creation'
    }
  ];

  return (
    <div className="space-y-4" data-testid="visa-readiness-hud">
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Visa Readiness Score
              </h3>
              <p className="text-sm text-muted-foreground">Real-time assessment of your application strength</p>
            </div>
            <Badge className={`${readinessLevel.bgColor} ${readinessLevel.color} border-0`}>
              {readinessLevel.label}
            </Badge>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#readinessGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${overallReadiness * 2.512} 251.2` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#005EB8" />
                    <stop offset="50%" stopColor="#41B6E6" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={overallReadiness}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold"
                >
                  {overallReadiness}%
                </motion.span>
                <span className="text-xs text-muted-foreground">Overall Readiness</span>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--muted))" />
                  <PolarAngleAxis 
                    dataKey="criterion" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criteriaDetails.map((criterion) => {
          const Icon = criterion.icon;
          const level = getReadinessLevel(criterion.score);
          
          return (
            <Card key={criterion.name} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${criterion.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: criterion.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{criterion.name}</h4>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{criterion.score}%</span>
                  <Badge variant="outline" className={level.color}>
                    {level.label}
                  </Badge>
                </div>
                <Progress 
                  value={criterion.score} 
                  className="h-2"
                  style={{ 
                    ['--progress-foreground' as string]: criterion.color 
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>
      
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Approval Probability
          </h4>
          <Badge variant={approvalProbability >= 70 ? "default" : "secondary"}>
            {approvalProbability >= 70 ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Strong Chance</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" /> Keep Building</>
            )}
          </Badge>
        </div>
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-green-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${approvalProbability}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground z-10">
              {approvalProbability}% Estimated Approval Rate
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Based on historical data from successful Innovator Founder Visa applications
        </p>
      </Card>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <Zap className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <div className="text-xl font-bold text-emerald-600">{totalXP}</div>
          <div className="text-xs text-muted-foreground">XP Earned</div>
        </Card>
        
        <Card className="p-3 text-center">
          <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
          <div className="text-xl font-bold text-emerald-600">{currentStreak}x</div>
          <div className="text-xs text-muted-foreground">Streak</div>
        </Card>
      </div>
      
      {milestones.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-primary" />
            Recent Achievements
          </h4>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {milestones.slice(0, 5).map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    variant={milestone.tier === 'gold' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    <span>{milestone.icon}</span>
                    {milestone.title}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </div>
  );
}
