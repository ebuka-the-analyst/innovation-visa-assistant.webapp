import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Calendar, Clock, Search, Newspaper, Eye,
  ArrowRight, ShieldCheck, BookOpen, Tag
} from "lucide-react";
import { useState, useMemo } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const categories = [
  { id: "all", label: "All" },
  { id: "visa-updates", label: "Visa Updates" },
  { id: "business-planning", label: "Business Planning" },
  { id: "endorsement", label: "Endorsement" },
  { id: "success-stories", label: "Success Stories" },
  { id: "uk-immigration", label: "UK Immigration" },
  { id: "guides", label: "Guides" },
];

function PostRow({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const isVerified = (post as any).verificationStatus === "passed" && (post as any).aiVerificationScore >= 95;

  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-post-${post.slug}`}>
      <div className="group flex items-start gap-4 py-4 border-b last:border-b-0 hover-elevate rounded-md px-2 -mx-2 cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <Badge variant="secondary" className="text-xs px-2 py-0" data-testid={`badge-cat-${post.id}`}>
              {post.category.replace(/-/g, " ")}
            </Badge>
            {isVerified && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs px-2 py-0 gap-1" data-testid={`badge-verified-${post.id}`}>
                <ShieldCheck className="w-3 h-3" />
                Verified
              </Badge>
            )}
            {post.isFeatured && (
              <Badge variant="outline" className="text-xs px-2 py-0">Featured</Badge>
            )}
          </div>
          <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors" data-testid={`text-title-${post.id}`}>
            {post.title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-1" data-testid={`text-excerpt-${post.id}`}>
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" data-testid={`text-date-${post.id}`}>
              <Calendar className="w-3 h-3" />{formattedDate}
            </span>
            <span className="flex items-center gap-1" data-testid={`text-readtime-${post.id}`}>
              <Clock className="w-3 h-3" />{post.readingTime} min
            </span>
            {post.views > 0 && (
              <span className="flex items-center gap-1" data-testid={`text-views-${post.id}`}>
                <Eye className="w-3 h-3" />{post.views.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const isVerified = (post as any).verificationStatus === "passed" && (post as any).aiVerificationScore >= 95;

  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-card-${post.slug}`}>
      <div className="group flex flex-col h-full border rounded-lg bg-card hover-elevate cursor-pointer overflow-hidden">
        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {post.category.replace(/-/g, " ")}
            </Badge>
            {isVerified && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs px-2 py-0 gap-1">
                <ShieldCheck className="w-3 h-3" />Verified
              </Badge>
            )}
          </div>
          <h2 className="text-sm font-semibold leading-snug line-clamp-3 mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
        </div>
        <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min</span>
          <span className="flex items-center gap-1 text-primary font-medium">Read <ArrowRight className="w-3 h-3" /></span>
        </div>
      </div>
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="py-4 border-b">
      <div className="flex gap-2 mb-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /></div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <div className="flex gap-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /></div>
    </div>
  );
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  const allPosts = posts || [];
  const totalViews = useMemo(() => allPosts.reduce((s, p) => s + (p.views || 0), 0), [allPosts]);

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Blog | Expert Insights"
        description="Latest news, guides, and expert analysis on the UK Innovator Founder Visa. Quad-AI verified for accuracy."
        canonical="https://innovatorfoundervisaassistant.co.uk/blog"
      />
      <Header />

      <div className="min-h-screen bg-background">
        {/* Compact page header */}
        <div className="border-b bg-muted/30">
          <div className="responsive-container py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <h1 className="text-base font-bold text-primary leading-none" data-testid="heading-blog">UK Visa Insights</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Expert guidance, quad-AI verified</p>
                </div>
              </div>
              {!isLoading && allPosts.length > 0 && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Newspaper className="w-3 h-3" />{allPosts.length} articles</span>
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{new Set(allPosts.map(p => p.category)).size} categories</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{totalViews.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="responsive-container py-4">
          {/* Search + view toggle */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
                data-testid="input-blog-search"
              />
            </div>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="px-3"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >List</Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              className="px-3"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >Grid</Button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
                data-testid={`button-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Post count */}
          {!isLoading && allPosts.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3" data-testid="text-results-count">
              {allPosts.length} article{allPosts.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && ` in ${categories.find(c => c.id === selectedCategory)?.label}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {/* Posts */}
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : ""}>
              {Array.from({ length: 6 }).map((_, i) =>
                viewMode === "list" ? <RowSkeleton key={i} /> : (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                )
              )}
            </div>
          ) : allPosts.length === 0 ? (
            <div className="py-16 text-center" data-testid="text-no-posts">
              <Newspaper className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium">No articles found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Check back soon — new articles are published daily"}
              </p>
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : viewMode === "list" ? (
            <div data-testid="posts-list">
              {allPosts.map((post) => <PostRow key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="posts-grid">
              {allPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
