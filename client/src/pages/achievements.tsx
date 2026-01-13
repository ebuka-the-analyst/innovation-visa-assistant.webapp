import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Star, Zap, Crown, Medal, Target, Shield, Award, 
  Download, Share2, Calendar, Flame, CheckCircle, Lock,
  ChevronRight, Users, TrendingUp, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  iconName: string;
  badgeColor: string;
  requirementType: string;
  requirementValue: number;
  progress?: number;
  isComplete?: boolean;
  earnedAt?: string;
}

interface Certificate {
  id: number;
  type: string;
  title: string;
  description: string;
  certificateNumber: string;
  issuedAt: string;
  isShareable: boolean;
}

const iconMap: Record<string, typeof Trophy> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  crown: Crown,
  medal: Medal,
  target: Target,
  shield: Shield,
  award: Award,
  calendar: Calendar,
  flame: Flame,
  checkCircle: CheckCircle,
  users: Users,
  trendingUp: TrendingUp,
  sparkles: Sparkles
};

function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const IconComponent = iconMap[achievement.iconName] || Award;
  const progress = achievement.progress || 0;
  const progressPercent = Math.min((progress / achievement.requirementValue) * 100, 100);

  return (
    <Card className={`transition-all duration-300 ${isUnlocked ? 'border-2' : 'opacity-60'}`}
      style={{ borderColor: isUnlocked ? achievement.badgeColor : undefined }}
      data-testid={`achievement-card-${achievement.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div 
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
              isUnlocked ? '' : 'grayscale'
            }`}
            style={{ backgroundColor: `${achievement.badgeColor}20` }}
          >
            {isUnlocked ? (
              <IconComponent className="w-7 h-7" style={{ color: achievement.badgeColor }} />
            ) : (
              <Lock className="w-6 h-6 text-destructive" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{achievement.name}</h3>
              <Badge variant="secondary" className="shrink-0">
                {achievement.points} pts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {achievement.description}
            </p>
            
            {!isUnlocked && achievement.requirementValue > 1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}/{achievement.requirementValue}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
            
            {isUnlocked && achievement.earnedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Earned {new Date(achievement.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const handleDownload = () => {
    window.open(`/api/certificates/${certificate.id}/download`, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
    if (navigator.share) {
      await navigator.share({
        title: certificate.title,
        text: `I earned the "${certificate.title}" certificate!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20" data-testid={`certificate-card-${certificate.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">{certificate.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {certificate.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Badge variant="outline" className="font-mono text-xs">
                {certificate.certificateNumber}
              </Badge>
              <span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDownload} data-testid={`button-download-cert-${certificate.id}`}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              {certificate.isShareable && (
                <Button size="sm" variant="outline" onClick={handleShare} data-testid={`button-share-cert-${certificate.id}`}>
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Achievements() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: achievementsData, isLoading: achievementsLoading } = useQuery<{
    all: Achievement[];
    user: Achievement[];
    points: number;
  }>({
    queryKey: ['/api/achievements'],
    enabled: !!user
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
    enabled: !!user
  });

  if (authLoading || achievementsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead
          title="Achievements | UK Innovator Founder Visa Assistant"
          description="Track your progress and earn achievements as you complete your UK Innovator Founder Visa journey."
        />
        <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
          <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h1 className="text-lg font-bold mb-4">Sign In to View Achievements</h1>
          <p className="text-muted-foreground mb-6">
            Create an account to track your progress and earn achievements.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login" data-testid="link-login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup" data-testid="link-signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const allAchievements = achievementsData?.all || [];
  const userAchievements = achievementsData?.user || [];
  const totalPoints = achievementsData?.points || 0;

  const earnedAchievements = userAchievements.filter(a => a.isComplete);
  const inProgressAchievements = userAchievements.filter(a => !a.isComplete && a.progress && a.progress > 0);
  
  const earnedIds = new Set(earnedAchievements.map(a => a.id));
  const inProgressIds = new Set(inProgressAchievements.map(a => a.id));
  const lockedAchievements = allAchievements.filter(a => !earnedIds.has(a.id) && !inProgressIds.has(a.id));

  const enrichedInProgress = inProgressAchievements.map(ua => {
    const base = allAchievements.find(a => a.id === ua.id);
    return { ...base, ...ua };
  });

  const categories = Array.from(new Set(allAchievements.map(a => a.category)));

  return (
    <>
      <SEOHead
        title="Your Achievements | UK Innovator Founder Visa Assistant"
        description="Track your progress, earn badges, and celebrate milestones on your UK Innovator Founder Visa journey."
      />
      
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-3" data-testid="heading-achievements">
            <Trophy className="w-8 h-8 text-amber-500" />
            Your Achievements
          </h1>
          <p className="text-muted-foreground">
            Track your visa journey progress and celebrate your milestones
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-amber-500" data-testid="text-total-points">{totalPoints}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-green-500" data-testid="text-earned-count">{earnedAchievements.length}</div>
              <p className="text-sm text-muted-foreground">Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-blue-500" data-testid="text-in-progress-count">{inProgressAchievements.length}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-muted-foreground" data-testid="text-locked-count">{lockedAchievements.length}</div>
              <p className="text-sm text-muted-foreground">Locked</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6" data-testid="tabs-achievements">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">
              Earned ({earnedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({inProgressAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="certificates">
              Certificates ({certificates?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {categories.map(category => {
              const categoryAchievements = allAchievements.filter(a => a.category === category);
              const categoryEarned = categoryAchievements.filter(a => earnedIds.has(a.id));

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold capitalize">
                      {category.replace(/_/g, ' ')}
                    </h2>
                    <Badge variant="outline">
                      {categoryEarned.length}/{categoryAchievements.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAchievements.map(achievement => {
                      const userAch = userAchievements.find(ua => ua.id === achievement.id);
                      return (
                        <AchievementCard
                          key={achievement.id}
                          achievement={{ ...achievement, ...userAch }}
                          isUnlocked={earnedIds.has(achievement.id)}
                        />
                      );
                    })}
                  </div>
                  <Separator className="mt-6" />
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="earned" className="space-y-4">
            {earnedAchievements.length === 0 ? (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Complete tools and reach milestones to earn achievements!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {enrichedInProgress.length === 0 ? (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start using tools to begin earning achievements!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrichedInProgress.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement as Achievement}
                    isUnlocked={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            {certificatesLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : certificates && certificates.length > 0 ? (
              <div className="space-y-4">
                {certificates.map(cert => (
                  <CertificateCard key={cert.id} certificate={cert} />
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-8 text-center">
                  <Award className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete key milestones to earn official certificates that you can share on LinkedIn!
                  </p>
                  <Button asChild>
                    <Link href="/tools-hub" data-testid="link-tools-hub">
                      Start Earning <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Ready to Earn More?</h3>
                <p className="text-sm text-muted-foreground">
                  Complete tools to unlock achievements and earn certificates
                </p>
              </div>
              <Button asChild>
                <Link href="/tools-hub" data-testid="link-explore-tools">
                  Explore Tools <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
