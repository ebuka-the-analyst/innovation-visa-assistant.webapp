import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Eye, Calendar, Clock, Edit, Trash2, RefreshCw, 
  TrendingUp, BarChart3, Globe, Search, Filter, Plus, 
  CheckCircle, AlertCircle, Loader2, ExternalLink, Copy,
  Sparkles, Send, Archive, Play, Pause, Settings, ChevronDown,
  PenTool, Image, Share2, ThumbsUp, MessageSquare, Target,
  Zap, Timer, BookOpen, Award, ShieldCheck, ShieldAlert,
  Fingerprint, Cpu, Check, X, Wand2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { BlogPost } from "@shared/schema";

interface BlogStats {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
  archived: number;
  totalViews: number;
  avgViews: number;
  totalLikes: number;
  totalShares: number;
  topPerforming: BlogPost[];
  recentPosts: BlogPost[];
  scheduledPosts: BlogPost[];
  upcomingQueue: any[];
}

export default function BlogDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch blog stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<BlogStats>({
    queryKey: ["/api/admin/blog/stats"],
  });

  // Fetch all posts with filtering
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog/posts", filterStatus, searchQuery],
  });

  // Fetch generation queue
  const { data: queue, refetch: refetchQueue } = useQuery<any[]>({
    queryKey: ["/api/admin/blog/queue"],
  });

  // Generate next day post mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/blog/generate-next");
    },
    onSuccess: () => {
      toast({ title: "Post Generated", description: "Tomorrow's post has been generated and scheduled." });
      refetchStats();
      refetchPosts();
      refetchQueue();
    },
    onError: (error: any) => {
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<BlogPost> }) => {
      return apiRequest("PATCH", `/api/admin/blog/posts/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({ title: "Post Updated", description: "Changes saved successfully." });
      setIsEditorOpen(false);
      setEditingPost(null);
      refetchPosts();
      refetchStats();
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  // Publish post mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/blog/posts/${id}/publish`);
    },
    onSuccess: () => {
      toast({ title: "Post Published", description: "Post is now live." });
      refetchPosts();
      refetchStats();
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Post Deleted", description: "Post has been removed." });
      refetchPosts();
      refetchStats();
      refetchReview();
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message || "Could not delete post. Please try again.", variant: "destructive" });
    },
  });

  // Human review queue
  const { data: reviewQueue, isLoading: reviewLoading, refetch: refetchReview } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog/review-queue"],
  });

  // Verifier health status — only fetched on demand
  const [verifierCheckEnabled, setVerifierCheckEnabled] = useState(false);
  const { data: verifierStatus, isLoading: verifierStatusLoading, refetch: refetchVerifierStatus } = useQuery<{
    checkedAt: string;
    compositeScore: number;
    verifiers: Array<{ name: string; status: "ok" | "unavailable" | "error"; score: number | null; error?: string }>;
  }>({
    queryKey: ["/api/admin/blog/verifier-status"],
    enabled: verifierCheckEnabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Re-verify single post mutation
  const reverifyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/blog/posts/${id}/reverify`);
    },
    onSuccess: () => {
      toast({ title: "Re-verification Complete", description: "AI verification scores updated." });
      refetchReview();
      refetchPosts();
    },
    onError: (error: any) => {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    },
  });

  // Re-verify ALL queued posts sequentially (avoids hammering rate limits)
  const [reverifyAllProgress, setReverifyAllProgress] = useState<{ done: number; total: number } | null>(null);
  const reverifyAllMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setReverifyAllProgress({ done: 0, total: ids.length });
      for (let i = 0; i < ids.length; i++) {
        await apiRequest("POST", `/api/admin/blog/posts/${ids[i]}/reverify`);
        setReverifyAllProgress({ done: i + 1, total: ids.length });
      }
    },
    onSuccess: () => {
      setReverifyAllProgress(null);
      toast({ title: "All Re-verified", description: "All queued posts have been re-verified by the AI panel." });
      refetchReview();
      refetchPosts();
    },
    onError: (error: any) => {
      setReverifyAllProgress(null);
      toast({ title: "Reverify All Failed", description: error.message, variant: "destructive" });
    },
  });

  // Approve human-review post
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/blog/posts/${id}/approve`);
    },
    onSuccess: () => {
      toast({ title: "Post Approved", description: "Post published successfully." });
      refetchReview();
      refetchPosts();
      refetchStats();
    },
    onError: (error: any) => {
      toast({ title: "Approval Failed", description: error.message, variant: "destructive" });
    },
  });

  // Auto-fix a single post (Qwen corrects flags → re-verifies → auto-publishes if passes)
  const [fixingPostId, setFixingPostId] = useState<string | null>(null);
  const autoFixMutation = useMutation({
    mutationFn: async (id: string) => {
      setFixingPostId(id);
      return apiRequest("POST", `/api/admin/blog/posts/${id}/auto-fix`);
    },
    onSuccess: (data: any) => {
      setFixingPostId(null);
      if (data?.autoPublished) {
        toast({
          title: "Fixed & Auto-Published",
          description: `All ${data.flagsAddressed} flag(s) corrected. Composite score: ${data.compositeScore}/100. Post is now live.`,
        });
      } else {
        toast({
          title: "Fixed — Still In Review",
          description: `${data?.flagsAddressed ?? 0} flag(s) addressed. New composite: ${data?.compositeScore ?? "?"}/100. Some issues remain — check the updated scores.`,
          variant: "default",
        });
      }
      refetchReview();
      refetchPosts();
      refetchStats();
    },
    onError: (error: any) => {
      setFixingPostId(null);
      toast({ title: "Auto-Fix Failed", description: error.message, variant: "destructive" });
    },
  });

  // Fix ALL queued posts sequentially
  const [fixAllProgress, setFixAllProgress] = useState<{ done: number; total: number } | null>(null);
  const autoFixAllMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setFixAllProgress({ done: 0, total: ids.length });
      for (let i = 0; i < ids.length; i++) {
        await apiRequest("POST", `/api/admin/blog/posts/${ids[i]}/auto-fix`);
        setFixAllProgress({ done: i + 1, total: ids.length });
      }
    },
    onSuccess: () => {
      setFixAllProgress(null);
      toast({ title: "Fix All Complete", description: "All queued posts have been corrected and re-verified." });
      refetchReview();
      refetchPosts();
      refetchStats();
    },
    onError: (error: any) => {
      setFixAllProgress(null);
      toast({ title: "Fix All Failed", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return styles[status] || styles.draft;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPosts = posts?.filter(post => {
    const matchesStatus = filterStatus === "all" || post.postStatus === filterStatus;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#005EB8]" />
              Blog Content Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              PhD-level comprehensive blog management, analytics, and automation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                refetchStats();
                refetchPosts();
                refetchQueue();
              }}
              data-testid="button-refresh-blog"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-[#005EB8] hover:bg-[#004494]"
              data-testid="button-generate-post"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Tomorrow's Post
            </Button>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-[#005EB8]/10 to-[#005EB8]/5 border-[#005EB8]/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-[#005EB8]/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats?.published || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-500">{stats?.scheduled || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats?.draft || 0}</p>
                </div>
                <Edit className="h-8 w-8 text-yellow-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-purple-500">{stats?.totalViews?.toLocaleString() || 0}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Views</p>
                  <p className="text-2xl font-bold text-pink-500">{Math.round(stats?.avgViews || 0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              All Posts
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="queue" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Generation Queue
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#005EB8] data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white" data-testid="tab-review-queue">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Review Queue
              {reviewQueue && reviewQueue.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {reviewQueue.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Performing Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top Performing Posts
                  </CardTitle>
                  <CardDescription>Highest views in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats?.topPerforming?.slice(0, 5).map((post, i) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-sm text-muted-foreground">{post.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views?.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No posts yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Scheduled Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Upcoming Scheduled Posts
                  </CardTitle>
                  <CardDescription>Posts waiting to be published</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats?.scheduledPosts?.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate">
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.scheduledFor)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingPost(post);
                            setIsEditorOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => publishMutation.mutate(post.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">No scheduled posts</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#005EB8]" />
                  Recent Posts
                </CardTitle>
                <CardDescription>Latest blog activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.recentPosts?.slice(0, 10).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate">
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusBadge(post.postStatus || 'published')}>
                          {post.postStatus || 'published'}
                        </Badge>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.category} • {formatDate(post.publishedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" /> {post.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" /> {post.shares || 0}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingPost(post);
                            setIsEditorOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Blog Posts</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search posts..." 
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-posts"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40" data-testid="select-filter-status">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="draft">Drafts</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#005EB8]" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate">
                        <div className="flex items-center gap-4 flex-1">
                          <Badge className={getStatusBadge(post.postStatus || 'published')}>
                            {post.postStatus || 'published'}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{post.title}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{post.category}</span>
                              <span>•</span>
                              <span>{post.readingTime} min read</span>
                              <span>•</span>
                              <span>{formatDate(post.publishedAt)}</span>
                              {post.isAutoGenerated && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Generated
                                  </Badge>
                                </>
                              )}
                              {post.wasEdited && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edited
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" /> {post.views}
                            </span>
                            {post.seoScore && (
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" /> {post.seoScore}%
                              </span>
                            )}
                            {(post as any).aiVerificationScore != null && (
                              <span className={`flex items-center gap-1 font-medium ${(post as any).verificationStatus === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {(post as any).aiVerificationScore}
                              </span>
                            )}
                            {(post as any).humanReviewRequired && (
                              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] py-0">
                                Review
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingPost(post);
                                setIsEditorOpen(true);
                              }}
                              data-testid={`button-edit-post-${post.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            {post.postStatus === 'scheduled' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => publishMutation.mutate(post.id)}
                                data-testid={`button-publish-post-${post.id}`}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this post?')) {
                                  deleteMutation.mutate(post.id);
                                }
                              }}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredPosts.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No posts found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Scheduled Posts Calendar
                </CardTitle>
                <CardDescription>
                  Posts generated at 6pm daily, auto-published at 6am the next day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.scheduledPosts?.length ? (
                    stats.scheduledPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="h-4 w-4" />
                              <span>Scheduled for: {formatDate(post.scheduledFor)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{post.category}</Badge>
                              {post.isAutoGenerated && (
                                <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setEditingPost(post);
                              setIsEditorOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            className="bg-[#005EB8] hover:bg-[#004494]"
                            onClick={() => publishMutation.mutate(post.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Publish Now
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scheduled posts</p>
                      <p className="text-sm mt-2">Generate tomorrow's post to schedule it</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <Eye className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-pink-500/20">
                      <ThumbsUp className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                      <p className="text-2xl font-bold">{stats?.totalLikes || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Share2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-2xl font-bold">{stats?.totalShares || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Views/Post</p>
                      <p className="text-2xl font-bold">{Math.round(stats?.avgViews || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics for all published content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {posts?.filter(p => p.postStatus === 'published' || p.isPublished).slice(0, 10).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground">{post.category}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{post.views}</p>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{post.likes || 0}</p>
                          <p className="text-xs text-muted-foreground">Likes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{post.shares || 0}</p>
                          <p className="text-xs text-muted-foreground">Shares</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{post.readingTime}m</p>
                          <p className="text-xs text-muted-foreground">Read Time</p>
                        </div>
                        {post.seoScore && (
                          <div className="text-center">
                            <p className="font-bold text-emerald-500">{post.seoScore}%</p>
                            <p className="text-xs text-muted-foreground">SEO</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generation Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Auto-Generation Queue
                </CardTitle>
                <CardDescription>
                  Posts are auto-generated at 6pm daily for the next day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queue?.length ? (
                    queue.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            item.status === 'generated' ? 'bg-emerald-500/20' :
                            item.status === 'generating' ? 'bg-blue-500/20' :
                            item.status === 'failed' ? 'bg-red-500/20' :
                            'bg-yellow-500/20'
                          }`}>
                            {item.status === 'generated' ? <CheckCircle className="h-6 w-6 text-emerald-500" /> :
                             item.status === 'generating' ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> :
                             item.status === 'failed' ? <AlertCircle className="h-6 w-6 text-red-500" /> :
                             <Clock className="h-6 w-6 text-yellow-500" />}
                          </div>
                          <div>
                            <p className="font-medium">
                              Post for {new Date(item.targetDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.topic || 'Topic to be selected'} • {item.category || 'Category TBD'}
                            </p>
                            {item.error && (
                              <p className="text-sm text-red-400 mt-1">{item.error}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={
                          item.status === 'generated' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.status === 'generating' ? 'bg-blue-500/20 text-blue-400' :
                          item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No items in generation queue</p>
                      <p className="text-sm mt-2">Posts are automatically queued at 6pm daily</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Generation Settings</CardTitle>
                <CardDescription>Configure automatic blog post generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-Generate Posts</p>
                    <p className="text-sm text-muted-foreground">Generate tomorrow's post automatically at 6pm</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-Publish</p>
                    <p className="text-sm text-muted-foreground">Automatically publish scheduled posts at 6am</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Generate Featured Image</p>
                    <p className="text-sm text-muted-foreground">Create AI-generated images for each post</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="p-4 rounded-lg border">
                  <Label>Default Author</Label>
                  <Input defaultValue="UK Visa Expert" className="mt-2" />
                </div>

                <div className="p-4 rounded-lg border">
                  <Label>Post Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Visa Guide', 'Compliance', 'Business Planning', 'Success Stories', 'Updates'].map(cat => (
                      <Badge key={cat} variant="outline" className="cursor-pointer hover-elevate">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Human Review Queue Tab */}
          <TabsContent value="review" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Human Review Queue
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Posts held for review — composite score must be ≥95 and no individual verifier may score below 80
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetchReview()} data-testid="button-refresh-review">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-check-verifiers"
                  disabled={verifierStatusLoading}
                  onClick={() => {
                    setVerifierCheckEnabled(true);
                    setTimeout(() => refetchVerifierStatus(), 50);
                  }}
                >
                  {verifierStatusLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-2" />
                  )}
                  Check Verifiers
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={reverifyAllMutation.isPending || autoFixAllMutation.isPending || !reviewQueue?.length}
                  onClick={() => reviewQueue && reverifyAllMutation.mutate(reviewQueue.map((p: any) => p.id))}
                  data-testid="button-reverify-all"
                >
                  {reverifyAllMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {reverifyAllProgress
                        ? `${reverifyAllProgress.done}/${reverifyAllProgress.total} done…`
                        : "Starting…"}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reverify All ({reviewQueue?.length ?? 0})
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={autoFixAllMutation.isPending || reverifyAllMutation.isPending || !reviewQueue?.length}
                  onClick={() => reviewQueue && autoFixAllMutation.mutate(reviewQueue.map((p: any) => p.id))}
                  data-testid="button-fix-all"
                  title="Qwen corrects all flagged content then re-verifies. Posts that pass are auto-published."
                >
                  {autoFixAllMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {fixAllProgress
                        ? `Fixing ${fixAllProgress.done}/${fixAllProgress.total}…`
                        : "Starting…"}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Fix All & Re-verify
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Verifier Status Panel */}
            {verifierStatus && (
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-500" />
                      Quad-AI Verifier Health Check
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Checked {new Date(verifierStatus.checkedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {verifierStatus.verifiers.map((v) => (
                      <div key={v.name} className="text-center">
                        <div className={`text-xs font-bold mb-1 ${v.status === "ok" ? "text-emerald-600" : "text-red-500"}`}>
                          {v.status === "ok" ? (
                            <Check className="h-4 w-4 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 mx-auto" />
                          )}
                        </div>
                        <div className="text-xs font-medium">{v.name}</div>
                        <div className={`text-xs ${v.status === "ok" ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {v.status === "ok" ? `${v.score}/100` : "Unavailable"}
                        </div>
                        {v.error && (
                          <div className="text-[10px] text-red-500 mt-1 break-all leading-tight" title={v.error}>
                            {v.error.substring(0, 60)}{v.error.length > 60 ? "…" : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {reviewLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-3">Loading review queue…</p>
                </CardContent>
              </Card>
            ) : !reviewQueue || reviewQueue.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShieldCheck className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">All Clear</h3>
                  <p className="text-muted-foreground">No posts are waiting for human review. All auto-generated content passed triple-AI consensus.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviewQueue.map((post) => {
                  const p = post as any;
                  const composite = p.aiVerificationScore;
                  const gemini = p.geminiScore;
                  const openai = p.openaiScore;
                  const qwen = p.qwenScore;
                  const claude = p.claudeScore;
                  const isStale = p.verificationExpiresAt && new Date(p.verificationExpiresAt) < new Date();
                  return (
                    <Card key={post.id} className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 text-xs">
                                  Human Review Required
                                </Badge>
                                {isStale && (
                                  <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 text-xs">
                                    Verification Stale
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{post.category}</Badge>
                              </div>
                              <h3 className="font-semibold line-clamp-2" data-testid={`text-review-title-${post.id}`}>
                                {post.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Generated {formatDate(post.createdAt as any)} · {post.readingTime} min read
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reverifyMutation.mutate(post.id)}
                                disabled={reverifyMutation.isPending || autoFixMutation.isPending}
                                data-testid={`button-reverify-${post.id}`}
                              >
                                {reverifyMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Cpu className="h-3 w-3 mr-1" />
                                )}
                                Re-verify
                              </Button>
                              <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={() => autoFixMutation.mutate(post.id)}
                                disabled={autoFixMutation.isPending || reverifyMutation.isPending}
                                data-testid={`button-autofix-${post.id}`}
                                title="Qwen reads all flags and surgically corrects the content, then re-verifies automatically"
                              >
                                {fixingPostId === post.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Wand2 className="h-3 w-3 mr-1" />
                                )}
                                {fixingPostId === post.id ? "Fixing…" : "Fix & Re-verify"}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => approveMutation.mutate(post.id)}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-${post.id}`}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Approve &amp; Publish
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(post.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-review-${post.id}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Score Bars */}
                          <div className="grid grid-cols-5 gap-3 bg-background rounded-lg p-3 border text-xs">
                            {[
                              { label: "Composite", value: composite, icon: true },
                              { label: "Gemini", value: gemini, icon: false },
                              { label: "OpenAI", value: openai, icon: false },
                              { label: "Claude", value: claude, icon: false },
                              { label: "Qwen", value: qwen, icon: false },
                            ].map(({ label, value, icon }) => (
                              <div key={label}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    {icon && <Cpu className="h-3 w-3" />}{label}
                                  </span>
                                  <span className={`font-bold ${(value ?? 0) >= 95 ? 'text-emerald-600' : (value ?? 0) >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {value != null ? `${value}/100` : '—'}
                                  </span>
                                </div>
                                <Progress value={value ?? 0} className="h-1" />
                              </div>
                            ))}
                          </div>

                          {p.contentHash && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                              <Fingerprint className="h-3 w-3" />
                              SHA-256: {p.contentHash.substring(0, 20)}…
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Post Editor Dialog */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Edit Post
              </DialogTitle>
            </DialogHeader>
            {editingPost && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    data-testid="input-edit-title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input 
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={editingPost.postStatus || 'published'}
                      onValueChange={(v) => setEditingPost({...editingPost, postStatus: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <Textarea 
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea 
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    rows={15}
                    className="font-mono text-sm"
                    data-testid="textarea-edit-content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input 
                      value={editingPost.metaTitle || ''}
                      onChange={(e) => setEditingPost({...editingPost, metaTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Input 
                      value={editingPost.metaDescription || ''}
                      onChange={(e) => setEditingPost({...editingPost, metaDescription: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (editingPost) {
                    updateMutation.mutate({
                      id: editingPost.id,
                      updates: {
                        title: editingPost.title,
                        excerpt: editingPost.excerpt,
                        content: editingPost.content,
                        category: editingPost.category,
                        postStatus: editingPost.postStatus,
                        metaTitle: editingPost.metaTitle,
                        metaDescription: editingPost.metaDescription,
                        wasEdited: true,
                        editedAt: new Date(),
                      }
                    });
                  }
                }}
                disabled={updateMutation.isPending}
                className="bg-[#005EB8] hover:bg-[#004494]"
                data-testid="button-save-post"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
