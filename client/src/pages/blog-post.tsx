import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { useEffect } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/blog/${slug}/view`, { method: "POST" });
    },
  });

  useEffect(() => {
    if (slug) {
      viewMutation.mutate();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="responsive-container py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <div className="responsive-container py-12 text-center">
          <Card className="p-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const date = new Date(post.publishedAt);
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <SEOHead
        title={post.metaTitle || `${post.title} | UK Visa Blog`}
        description={post.metaDescription || post.excerpt}
        canonical={`https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}`}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <article className="responsive-container py-8 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">
                {post.category.replace('-', ' ')}
              </Badge>
              {post.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-600">
                  Featured
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-blog-title">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
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
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto" data-testid="button-share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {post.featuredImage && (
            <div className="aspect-video overflow-hidden rounded-xl mb-8">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="border-t pt-6 mb-8">
              <h3 className="text-sm font-semibold mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2">Need Help With Your Visa Application?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get expert AI-powered guidance for your UK Innovator Founder Visa application with our comprehensive tools.
            </p>
            <Link href="/questionnaire">
              <Button data-testid="button-start-plan">
                Start Your Business Plan
              </Button>
            </Link>
          </Card>
        </article>
      </div>

      <Footer />
    </>
  );
}
