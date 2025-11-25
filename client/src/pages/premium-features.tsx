import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, Trophy, FileText, Mic, BookOpen, Calendar, 
  HeadphonesIcon, FileCheck, Star, Award, Crown,
  ArrowRight, CheckCircle2, Lock, Sparkles, TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { useTierAccess } from "@/hooks/useTierAccess";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  points: number;
  requiredTier: string;
  requirementType?: string;
  requirementValue?: number;
  progress?: number;
  isComplete?: boolean;
  earnedAt?: string;
}

interface AchievementsData {
  userAchievements: Achievement[];
  allAchievements: Achievement[];
  totalPoints: number;
}

const FEATURE_CARDS = [
  {
    id: "notifications",
    title: "Smart Email Notifications",
    description: "Weekly progress digests, deadline reminders, and breaking news alerts delivered to your inbox.",
    icon: Bell,
    color: "from-blue-500 to-cyan-500",
    tier: "basic",
    link: "/settings"
  },
  {
    id: "achievements",
    title: "Achievement System",
    description: "Earn badges, track milestones, and get certificates to celebrate your visa journey progress.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    tier: "free",
    link: "/premium-features?tab=achievements"
  },
  {
    id: "templates",
    title: "Document Templates",
    description: "50+ professional templates for business plans, personal statements, and evidence documents.",
    icon: FileText,
    color: "from-emerald-500 to-teal-500",
    tier: "basic",
    link: "/premium-features?tab=templates"
  },
  {
    id: "document-review",
    title: "AI Document Review",
    description: "Upload your documents and get instant AI-powered feedback with improvement suggestions.",
    icon: FileCheck,
    color: "from-purple-500 to-violet-500",
    tier: "premium",
    link: "/premium-features?tab=document-review"
  },
  {
    id: "interview",
    title: "Interview Practice",
    description: "Practice endorser and Home Office interviews with AI-powered feedback on your responses.",
    icon: Mic,
    color: "from-rose-500 to-pink-500",
    tier: "enterprise",
    link: "/premium-features?tab=interview"
  },
  {
    id: "success-stories",
    title: "Success Story Library",
    description: "Learn from real anonymized case studies of successful Innovator Founder Visa applicants.",
    icon: BookOpen,
    color: "from-indigo-500 to-blue-500",
    tier: "premium",
    link: "/premium-features?tab=stories"
  },
  {
    id: "calendar",
    title: "Calendar Integration",
    description: "Track deadlines and milestones with exportable calendar events for your visa journey.",
    icon: Calendar,
    color: "from-green-500 to-emerald-500",
    tier: "basic",
    link: "/premium-features?tab=calendar"
  },
  {
    id: "support",
    title: "Priority Support",
    description: "Get faster response times and dedicated support based on your subscription tier.",
    icon: HeadphonesIcon,
    color: "from-slate-500 to-gray-600",
    tier: "premium",
    link: "/support"
  }
];

const TIER_ORDER = ['free', 'basic', 'premium', 'enterprise', 'ultimate'];

function getTierBadge(tier: string) {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    premium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    enterprise: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ultimate: "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
  };
  return colors[tier] || colors.free;
}

function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Rocket: TrendingUp, Compass: Star, Star, Crown, Trophy, Shield: CheckCircle2,
    TrendingUp, Lightbulb: Sparkles, Target: TrendingUp, Mic, Flame: Sparkles,
    Award, FileText, Users: Mic, BadgeCheck: CheckCircle2
  };
  return icons[iconName] || Star;
}

export default function PremiumFeatures() {
  const [activeTab, setActiveTab] = useState("overview");
  const { userTier, hasAccessToTier: hasAccess } = useTierAccess();

  const { data: achievementsData } = useQuery<AchievementsData>({
    queryKey: ['/api/achievements'],
  });

  const { data: templates } = useQuery<any[]>({
    queryKey: ['/api/templates'],
  });

  const { data: successStories } = useQuery<any[]>({
    queryKey: ['/api/success-stories'],
  });

  const { data: calendarEvents } = useQuery<any[]>({
    queryKey: ['/api/calendar-events'],
  });

  const { data: slaInfo } = useQuery<any>({
    queryKey: ['/api/support/sla'],
  });

  const earnedCount = achievementsData?.userAchievements?.filter(a => a.isComplete).length || 0;
  const totalAchievements = achievementsData?.allAchievements?.length || 1;
  const totalPoints = achievementsData?.totalPoints || 0;
  const achievementProgress = totalAchievements > 0 ? (earnedCount / totalAchievements) * 100 : 0;

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Premium Features
          </h1>
          <p className="text-muted-foreground mt-1">
            Unlock powerful tools to accelerate your visa journey
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getTierBadge(userTier)} data-testid="badge-user-tier">
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
          </Badge>
          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-700 dark:text-amber-400" data-testid="text-total-points">{totalPoints}</span>
            <span className="text-sm text-amber-600 dark:text-amber-500">pts</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs md:text-sm">Achievements</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs md:text-sm">Templates</TabsTrigger>
          <TabsTrigger value="stories" className="text-xs md:text-sm">Stories</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
          <TabsTrigger value="support" className="text-xs md:text-sm">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;
              const isUnlocked = hasAccess(feature.tier);
              const tierIndex = TIER_ORDER.indexOf(feature.tier);
              const userTierIndex = TIER_ORDER.indexOf(userTier);

              return (
                <Card 
                  key={feature.id} 
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${!isUnlocked ? 'opacity-75' : ''}`}
                  data-testid={`card-feature-${feature.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {!isUnlocked && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          {feature.tier}
                        </Badge>
                      )}
                      {isUnlocked && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-4">
                      {feature.description}
                    </CardDescription>
                    {isUnlocked ? (
                      <Link href={feature.link}>
                        <Button size="sm" className="w-full" data-testid={`button-explore-${feature.id}`}>
                          Explore <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/pricing">
                        <Button size="sm" variant="outline" className="w-full" data-testid={`button-upgrade-${feature.id}`}>
                          Upgrade to Unlock
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Achievements Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-earned-count">{earnedCount} / {totalAchievements}</div>
                <Progress value={achievementProgress} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-points">{totalPoints}</div>
                <p className="text-sm text-muted-foreground mt-1">Keep earning to unlock rewards</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {totalPoints < 100 ? '100 points - Bronze Status' : 
                   totalPoints < 500 ? '500 points - Silver Status' : 
                   totalPoints < 1000 ? '1000 points - Gold Status' : 'Legend Status!'}
                </div>
                <Progress value={Math.min((totalPoints / (totalPoints < 100 ? 100 : totalPoints < 500 ? 500 : 1000)) * 100, 100)} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {achievementsData?.allAchievements?.map((achievement) => {
              const userAchievement = achievementsData.userAchievements?.find(
                ua => ua.id === achievement.id || ua.code === achievement.code
              );
              const isComplete = userAchievement?.isComplete;
              const progress = userAchievement?.progress || 0;
              const IconComp = getIconComponent(achievement.icon);

              return (
                <Card 
                  key={achievement.id} 
                  className={`relative ${isComplete ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                  data-testid={`card-achievement-${achievement.code}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isComplete ? 'bg-amber-100 dark:bg-amber-900' : 'bg-muted'}`}>
                        <IconComp className={`h-5 w-5 ${isComplete ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {achievement.name}
                          {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    {!isComplete && achievement.requirementValue && (
                      <Progress value={(progress / achievement.requirementValue) * 100} className="h-2" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates?.map((template: any) => {
              const isAccessible = template.isAccessible ?? hasAccess(template.requiredTier);
              
              return (
                <Card key={template.id} className={!isAccessible ? 'opacity-75' : ''} data-testid={`card-template-${template.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge className={getTierBadge(template.requiredTier)}>
                        {template.requiredTier}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                    <Badge variant="outline" className="w-fit">{template.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-4">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{template.downloadCount || 0} downloads</span>
                    </div>
                    {isAccessible ? (
                      <Button size="sm" className="w-full" data-testid={`button-use-template-${template.id}`}>
                        Use Template
                      </Button>
                    ) : (
                      <Link href="/pricing">
                        <Button size="sm" variant="outline" className="w-full">
                          <Lock className="h-3 w-3 mr-1" /> Upgrade to Access
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <div className="grid gap-6">
            {successStories?.map((story: any) => {
              const isAccessible = story.hasAccess ?? hasAccess(story.requiredTier);

              return (
                <Card key={story.id} className={!isAccessible ? 'opacity-75' : ''} data-testid={`card-story-${story.id}`}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{story.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{story.industry}</Badge>
                          <Badge variant="outline">{story.endorserBody}</Badge>
                          {story.timeToApproval && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {story.timeToApproval} days to approval
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={getTierBadge(story.requiredTier)}>
                        {story.requiredTier} tier
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-base">
                      {story.applicantAlias}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{story.summary}</p>
                    
                    {isAccessible ? (
                      <div className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="whitespace-pre-line">{story.fullStory}</p>
                        </div>
                        
                        {story.keySuccessFactors && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Key Success Factors
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {(story.keySuccessFactors as string[]).map((factor: string, i: number) => (
                                <li key={i}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {story.adviceGiven && (
                          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Their Advice
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {(story.adviceGiven as string[]).map((advice: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                  {advice}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Upgrade to {story.requiredTier} tier to read the full story
                        </p>
                        <Link href="/pricing">
                          <Button>Upgrade Now</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visa Journey Calendar
              </CardTitle>
              <CardDescription>
                Track your deadlines and milestones. Export to your favorite calendar app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendarEvents && calendarEvents.length > 0 ? (
                  <>
                    {calendarEvents.map((event: any) => (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`event-${event.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.startDate).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </div>
                    ))}
                    <Separator />
                    <Button className="w-full" asChild>
                      <a href="/api/calendar-events/export" download data-testid="button-export-calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Export to Calendar (.ics)
                      </a>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Events Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start using tools to automatically track your visa journey milestones
                    </p>
                    <Link href="/tools">
                      <Button>Explore Tools</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Your Support Level
              </CardTitle>
              <CardDescription>
                Based on your {userTier} tier subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slaInfo && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">First Response Time</p>
                    <p className="text-2xl font-bold">{slaInfo.firstResponseTime}h</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Resolution Time</p>
                    <p className="text-2xl font-bold">{slaInfo.resolutionTime}h</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Priority Level</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star 
                          key={level} 
                          className={`h-5 w-5 ${level <= slaInfo.priorityLevel ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Premium Features</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {slaInfo.dedicatedAgent && <Badge>Dedicated Agent</Badge>}
                      {slaInfo.callbackAvailable && <Badge>Callbacks</Badge>}
                      {slaInfo.liveChat && <Badge>Live Chat</Badge>}
                      {!slaInfo.dedicatedAgent && !slaInfo.callbackAvailable && !slaInfo.liveChat && (
                        <Badge variant="outline">Standard Support</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/support" className="flex-1">
                  <Button className="w-full" data-testid="button-contact-support">
                    <HeadphonesIcon className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                {userTier !== 'ultimate' && (
                  <Link href="/pricing" className="flex-1">
                    <Button variant="outline" className="w-full" data-testid="button-upgrade-support">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Upgrade for Better SLA
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
