import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, TrendingUp, BookOpen, Newspaper } from "lucide-react";
import { useState } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

const categories = [
  { id: "all", label: "All Posts", icon: Newspaper },
  { id: "visa-updates", label: "Visa Updates", icon: TrendingUp },
  { id: "business-planning", label: "Business Planning", icon: BookOpen },
  { id: "endorsement", label: "Endorsement", icon: User },
  { id: "success-stories", label: "Success Stories", icon: Calendar },
  { id: "uk-immigration", label: "UK Immigration", icon: Clock },
];

function BlogPostCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishedAt);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Card className="hover-elevate transition-all duration-300 group h-full flex flex-col">
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {post.category.replace('-', ' ')}
          </Badge>
          {post.isFeatured && (
            <Badge className="text-xs bg-amber-500/20 text-amber-600">
              Featured
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`} data-testid={`link-blog-${post.slug}`}>
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime} min read
            </span>
          </div>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {post.author}
          </span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <Button variant="ghost" size="sm" className="mt-4 w-full group/btn" data-testid={`button-read-${post.slug}`}>
            Read Article
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function BlogSkeleton() {
  return (
    <Card className="h-full">
      <div className="aspect-video">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const featuredPosts = posts?.filter(p => p.isFeatured).slice(0, 2) || [];
  const regularPosts = posts?.filter(p => !p.isFeatured) || [];

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Blog | Latest News & Expert Insights"
        description="Stay updated with the latest UK Innovator Founder Visa news, immigration updates, business planning tips, and success stories. Expert insights for visa applicants."
        canonical="https://innovatorfoundervisaassistant.co.uk/blog"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="border-b bg-primary/5">
          <div className="responsive-container py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="heading-blog">UK Visa Insights Blog</h1>
                <p className="text-muted-foreground">Expert guidance on UK Innovator Founder Visa</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Stay informed with the latest immigration updates, business planning strategies, endorsement tips, and success stories from successful applicants.
            </p>
          </div>
        </div>

        <div className="responsive-container py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-blog-search"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2"
                  data-testid={`button-category-${cat.id}`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BlogSkeleton key={i} />
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <Card className="p-12 text-center">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Check back soon for new content"}
              </p>
            </Card>
          ) : (
            <>
              {featuredPosts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Featured Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
