import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, Clock, Building2, Award, Lock, Search, Filter,
  CheckCircle, Lightbulb, Target, TrendingUp, ChevronRight, Crown,
  Briefcase, Quote
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";

interface SuccessStory {
  id: string;
  title: string;
  applicantAlias: string;
  industry: string;
  endorserBody: string;
  timeToApproval: string;
  businessDescription?: string;
  innovationHighlights?: string[];
  challengesFaced?: string[];
  keyLessons?: string[];
  tipForApplicants?: string;
  outcome?: string;
  requiredTier: string;
  isAccessible: boolean;
}

const industryIcons: Record<string, typeof Building2> = {
  technology: TrendingUp,
  healthcare: CheckCircle,
  fintech: Briefcase,
  education: Lightbulb,
  retail: Target,
  default: Building2
};

function StoryCard({ story, onReadMore }: { story: SuccessStory; onReadMore: () => void }) {
  const IconComponent = industryIcons[story.industry.toLowerCase()] || industryIcons.default;

  return (
    <Card className={`hover-elevate transition-all ${!story.isAccessible ? 'opacity-70' : ''}`} data-testid={`story-card-${story.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${story.isAccessible ? 'bg-primary/10' : 'bg-muted'}`}>
              <IconComponent className={`w-5 h-5 ${story.isAccessible ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base">{story.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{story.applicantAlias}</p>
            </div>
          </div>
          {!story.isAccessible && (
            <Badge variant="outline" className="bg-amber-500 text-white border-none">
              <Lock className="w-3 h-3 mr-1" />
              {story.requiredTier}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Building2 className="w-3 h-3 mr-1" />
            {story.industry}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Award className="w-3 h-3 mr-1" />
            {story.endorserBody}
          </Badge>
          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
            <Clock className="w-3 h-3 mr-1" />
            {story.timeToApproval}
          </Badge>
        </div>

        {story.businessDescription && story.isAccessible && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {story.businessDescription}
          </p>
        )}

        <Button 
          className="w-full" 
          variant={story.isAccessible ? "default" : "outline"}
          onClick={onReadMore}
          data-testid={`button-read-story-${story.id}`}
        >
          {story.isAccessible ? (
            <>
              Read Full Story <ChevronRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Read
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function StoryDetailDialog({ story, open, onOpenChange }: { 
  story: SuccessStory | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!story || !story.isAccessible) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {story.title}
          </DialogTitle>
          <DialogDescription>
            {story.applicantAlias} - {story.industry}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge>
                <Award className="w-3 h-3 mr-1" />
                {story.endorserBody}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Clock className="w-3 h-3 mr-1" />
                Approved in {story.timeToApproval}
              </Badge>
            </div>

            {story.businessDescription && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  The Business
                </h4>
                <p className="text-sm text-muted-foreground">{story.businessDescription}</p>
              </div>
            )}

            {story.innovationHighlights && story.innovationHighlights.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-green-600">
                  <Lightbulb className="w-4 h-4" />
                  Innovation Highlights
                </h4>
                <ul className="space-y-2">
                  {story.innovationHighlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {story.challengesFaced && story.challengesFaced.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-600">
                  <Target className="w-4 h-4" />
                  Challenges Faced
                </h4>
                <ul className="space-y-2">
                  {story.challengesFaced.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 text-xs text-amber-600">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {story.keyLessons && story.keyLessons.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-600">
                  <Lightbulb className="w-4 h-4" />
                  Key Lessons
                </h4>
                <ul className="space-y-2">
                  {story.keyLessons.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 text-xs text-blue-600">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {story.tipForApplicants && (
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Quote className="w-4 h-4 text-primary" />
                  Advice for Applicants
                </h4>
                <p className="text-sm italic">"{story.tipForApplicants}"</p>
              </div>
            )}

            {story.outcome && (
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-green-600">Outcome</h4>
                <p className="text-sm">{story.outcome}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <Link href="/tools-hub">
              Start Your Journey <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SuccessStories() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { data: stories, isLoading } = useQuery<SuccessStory[]>({
    queryKey: ['/api/success-stories']
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allStories = stories || [];
  const industries = Array.from(new Set(allStories.map(s => s.industry)));
  
  const filteredStories = allStories.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                          s.applicantAlias.toLowerCase().includes(search.toLowerCase()) ||
                          s.industry.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === "all" || s.industry.toLowerCase() === industryFilter.toLowerCase();
    return matchesSearch && matchesIndustry;
  });

  const accessibleCount = allStories.filter(s => s.isAccessible).length;
  const endorserCount = new Set(allStories.map(s => s.endorserBody).filter(Boolean)).size;

  return (
    <>
      <SEOHead
        title="Success Stories | UK Innovator Founder Visa Assistant"
        description="Read inspiring success stories from UK Innovator Founder Visa applicants. Learn from real experiences and strategies that led to visa approval."
      />

      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-3" data-testid="heading-success-stories">
            <Trophy className="w-8 h-8 text-amber-500" />
            Success Stories
          </h1>
          <p className="text-muted-foreground">
            Learn from real applicants who successfully obtained the UK Innovator Founder Visa
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-amber-500" data-testid="text-total-stories">{allStories.length}</div>
              <p className="text-sm text-muted-foreground">Success Stories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-green-500" data-testid="text-accessible-stories">{accessibleCount}</div>
              <p className="text-sm text-muted-foreground">Available to You</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-blue-500" data-testid="text-industries">{industries.length}</div>
              <p className="text-sm text-muted-foreground">Industries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-purple-500">{endorserCount}</div>
              <p className="text-sm text-muted-foreground">Endorsing Bodies</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-industry">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry.toLowerCase()}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!user && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Sign in to read full stories</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account to access detailed case studies and expert tips
                </p>
              </div>
              <Button asChild>
                <Link href="/signup" data-testid="link-signup">
                  Get Started <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {filteredStories.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stories Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onReadMore={() => {
                  if (story.isAccessible) {
                    setSelectedStory(story);
                    setShowDetail(true);
                  }
                }}
              />
            ))}
          </div>
        )}

        <StoryDetailDialog
          story={selectedStory}
          open={showDetail}
          onOpenChange={setShowDetail}
        />

        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Want to be our next success story?
              </h3>
              <p className="text-sm text-muted-foreground">
                Start your visa application journey with our professional tools
              </p>
            </div>
            <Button asChild>
              <Link href="/tools-hub" data-testid="link-tools-hub">
                Explore Tools <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
