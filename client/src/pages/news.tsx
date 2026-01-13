import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Newspaper, 
  Search, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  TrendingUp,
  Building2,
  FileText,
  Globe,
  Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  id: string;
  sourceId: string | null;
  sourceName: string;
  sourceUrl: string | null;
  title: string;
  description: string | null;
  content: string | null;
  author: string | null;
  url: string;
  imageUrl: string | null;
  category: string;
  tags: string[] | null;
  relevanceScore: number | null;
  publishedAt: string;
  fetchedAt: string;
  aiSummary: string | null;
  keyPoints: string[] | null;
  isActive: boolean;
  isFeatured: boolean;
}

const categoryIcons: Record<string, any> = {
  immigration: Globe,
  visa: FileText,
  policy: Building2,
  business: TrendingUp,
  general: Newspaper
};

const categoryColors: Record<string, string> = {
  immigration: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  visa: "bg-green-500/10 text-green-600 dark:text-green-400",
  policy: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  business: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  general: "bg-gray-500/10 text-gray-600 dark:text-gray-400"
};

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: news, isLoading, refetch, isFetching } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news', activeCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '30');
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : false,
  });

  const { data: featuredNews } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/featured'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-3" data-testid="text-page-title">
                <Newspaper className="h-8 w-8 text-primary" />
                UK Immigration News
              </h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with the latest UK visa and immigration news
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                data-testid="button-auto-refresh"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-updating' : 'Manual refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button type="submit" data-testid="button-search">Search</Button>
          </form>

          {featuredNews && featuredNews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Featured News</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredNews.slice(0, 3).map((article) => (
                  <FeaturedNewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="immigration" data-testid="tab-immigration">Immigration</TabsTrigger>
              <TabsTrigger value="visa" data-testid="tab-visa">Visa</TabsTrigger>
              <TabsTrigger value="policy" data-testid="tab-policy">Policy</TabsTrigger>
              <TabsTrigger value="business" data-testid="tab-business">Business</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </div>
              ) : news && news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function FeaturedNewsCard({ article }: { article: NewsArticle }) {
  const CategoryIcon = categoryIcons[article.category] || Newspaper;

  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-300 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
      {article.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge className={categoryColors[article.category]}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {article.category}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            Featured
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            data-testid={`link-featured-article-${article.id}`}
          >
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.sourceName}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.publishedAt && !isNaN(new Date(article.publishedAt).getTime()) 
              ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
              : "Recently"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const CategoryIcon = categoryIcons[article.category] || Newspaper;

  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-300 flex flex-col h-full" data-testid={`card-news-${article.id}`}>
      {article.imageUrl && (
        <div className="h-36 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader className="pb-2 flex-none">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={categoryColors[article.category]}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {article.category}
          </Badge>
          {article.relevanceScore && article.relevanceScore >= 70 && (
            <Badge variant="outline" className="text-xs">
              Highly Relevant
            </Badge>
          )}
        </div>
        <CardTitle className="text-base line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            data-testid={`link-article-${article.id}`}
          >
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
          {article.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="truncate max-w-[120px]">{article.sourceName}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.publishedAt && !isNaN(new Date(article.publishedAt).getTime()) 
              ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
              : "Recently"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          asChild
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`button-read-more-${article.id}`}
          >
            Read Full Article
            <ExternalLink className="h-3 w-3 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No News Found</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        No news articles match your search criteria. Try adjusting your search or check back later for updates.
      </p>
    </div>
  );
}
