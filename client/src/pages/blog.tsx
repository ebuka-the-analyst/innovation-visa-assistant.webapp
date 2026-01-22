import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Clock, User, ArrowRight, Search, TrendingUp, BookOpen, 
  Newspaper, Sparkles, Eye, ChevronLeft, ChevronRight, Flame, Star,
  Tag, Filter, LayoutGrid, List
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

const categories = [
  { id: "all", label: "All Posts", icon: Newspaper, color: "bg-primary" },
  { id: "visa-updates", label: "Visa Updates", icon: TrendingUp, color: "bg-blue-500" },
  { id: "business-planning", label: "Business Planning", icon: BookOpen, color: "bg-emerald-500" },
  { id: "endorsement", label: "Endorsement", icon: User, color: "bg-amber-500" },
  { id: "success-stories", label: "Success Stories", icon: Star, color: "bg-purple-500" },
  { id: "uk-immigration", label: "UK Immigration", icon: Calendar, color: "bg-rose-500" },
  { id: "guides", label: "Guides", icon: BookOpen, color: "bg-cyan-500" },
];

function getCategoryColor(category: string): string {
  const cat = categories.find(c => c.id === category);
  return cat?.color || "bg-primary";
}

function FeaturedHeroCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishedAt);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-blue-900/90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${getCategoryColor(post.category)} text-white border-0`}>
              {post.category.replace('-', ' ')}
            </Badge>
            <Badge className="bg-amber-500/90 text-white border-0 gap-1">
              <Flame className="w-3 h-3" />
              Featured
            </Badge>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:underline decoration-2 underline-offset-4">
            {post.title}
          </h2>
          
          <p className="text-white/80 text-lg mb-6 line-clamp-2 max-w-3xl">
            {post.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {post.views || 0} views
            </span>
          </div>
        </div>
        
        <div className="absolute top-6 right-6">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCarousel({ posts }: { posts: BlogPost[] }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % posts.length);
    }, 6000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [posts.length]);
  
  const goTo = (index: number) => {
    setCurrent(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % posts.length);
    }, 6000);
  };
  
  if (posts.length === 0) return null;
  
  return (
    <div className="relative mb-12">
      <FeaturedHeroCard post={posts[current]} />
      
      {posts.length > 1 && (
        <>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {posts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === current ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                }`}
                data-testid={`button-carousel-dot-${idx}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => goTo((current - 1 + posts.length) % posts.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => goTo((current + 1) % posts.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
    </div>
  );
}

function BlogPostCard({ post, variant = "default" }: { post: BlogPost; variant?: "default" | "compact" | "horizontal" }) {
  const date = new Date(post.publishedAt);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  if (variant === "horizontal") {
    return (
      <Link href={`/blog/${post.slug}`}>
        <Card className="hover-elevate transition-all duration-300 group overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <Newspaper className="w-12 h-12 text-primary/40" />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {post.category.replace('-', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime} min
                </span>
              </div>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="hover-elevate transition-all duration-300 group h-full flex flex-col overflow-hidden border-0 shadow-lg dark:shadow-none dark:border">
        <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDVFQjgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-10 h-10 text-primary/60" />
            </div>
          </div>
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className={`${getCategoryColor(post.category)} text-white text-xs border-0 shadow-md`}>
              {post.category.replace('-', ' ')}
            </Badge>
            {post.isFeatured && (
              <Badge className="bg-amber-500 text-white text-xs border-0 shadow-md gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        <CardHeader className="pb-2 flex-1">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm mt-2">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime} min
              </span>
            </div>
            <span className="flex items-center gap-1 text-primary font-medium">
              Read
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BlogSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-[16/10]">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

function StatsBar({ posts }: { posts: BlogPost[] }) {
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalPosts = posts.length;
  const categories = new Set(posts.map(p => p.category)).size;
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: "Articles", value: totalPosts, icon: Newspaper },
        { label: "Categories", value: categories, icon: Tag },
        { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
      ].map((stat) => (
        <div key={stat.label} className="bg-card rounded-xl p-4 flex items-center gap-3 border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <stat.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  const featuredPosts = posts?.filter(p => p.isFeatured).slice(0, 3) || [];
  const regularPosts = posts?.filter(p => !p.isFeatured) || [];
  const allPosts = posts || [];

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Blog | Latest News & Expert Insights"
        description="Stay updated with the latest UK Innovator Founder Visa news, immigration updates, business planning tips, and success stories. Expert insights for visa applicants."
        canonical="https://innovatorfoundervisaassistant.co.uk/blog"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-b">
          <div className="responsive-container py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Newspaper className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="heading-blog">
                    UK Visa Insights
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Expert guidance for Innovator Founder Visa applicants
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 text-sm gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Updated Daily
                </Badge>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-6 max-w-3xl text-lg">
              Stay informed with the latest immigration updates, business planning strategies, 
              endorsement tips, and success stories from applicants who've successfully navigated 
              the UK visa process.
            </p>
          </div>
        </div>

        <div className="responsive-container py-8">
          {/* Stats */}
          {!isLoading && allPosts.length > 0 && <StatsBar posts={allPosts} />}
          
          {/* Featured Carousel */}
          {!isLoading && featuredPosts.length > 0 && selectedCategory === "all" && !searchQuery && (
            <FeaturedCarousel posts={featuredPosts} />
          )}
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl border-2 focus:border-primary"
                data-testid="input-blog-search"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-12 w-12 rounded-xl"
                data-testid="button-view-grid"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-12 w-12 rounded-xl"
                data-testid="button-view-list"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`gap-2 rounded-full px-4 ${
                  selectedCategory === cat.id ? "" : "hover:bg-accent"
                }`}
                data-testid={`button-category-${cat.id}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : allPosts.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Newspaper className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? "Try adjusting your search terms or browse a different category" 
                  : "Check back soon for new content. We publish new articles daily!"}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-6" 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                >
                  Clear filters
                </Button>
              )}
            </Card>
          ) : (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {selectedCategory === "all" ? "Latest Articles" : categories.find(c => c.id === selectedCategory)?.label}
                  <Badge variant="secondary" className="ml-2">{regularPosts.length + featuredPosts.length}</Badge>
                </h2>
              </div>
              
              {/* Posts Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...featuredPosts.filter(p => selectedCategory !== "all" || searchQuery), ...regularPosts].map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[...featuredPosts.filter(p => selectedCategory !== "all" || searchQuery), ...regularPosts].map((post) => (
                    <BlogPostCard key={post.id} post={post} variant="horizontal" />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Newsletter CTA */}
          {!isLoading && allPosts.length > 0 && (
            <div className="mt-16 mb-8">
              <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20 overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Stay Updated
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        Get Weekly Visa Insights
                      </h3>
                      <p className="text-muted-foreground max-w-lg">
                        Join thousands of entrepreneurs receiving our weekly digest of visa tips, 
                        business planning strategies, and success stories.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <Input 
                        placeholder="Enter your email" 
                        className="h-12 w-full sm:w-72 rounded-xl"
                        data-testid="input-newsletter-email"
                      />
                      <Button size="lg" className="h-12 px-8 rounded-xl gap-2" data-testid="button-subscribe">
                        Subscribe
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
