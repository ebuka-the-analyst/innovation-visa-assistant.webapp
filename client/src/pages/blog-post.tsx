import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Clock, User, ArrowLeft, Share2, BookOpen,
  ShieldCheck, AlertCircle, CheckCircle2, Eye, ExternalLink, Cpu
} from "lucide-react";
import { useEffect } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

function VerificationBar({ post }: { post: BlogPost }) {
  const p = post as any;
  const status = p.verificationStatus ?? "pending";
  const composite = p.aiVerificationScore;
  const verifiedAt = p.verifiedAt ? new Date(p.verifiedAt) : null;
  const sources = p.sourcesCited ?? 0;

  const isPassed = status === "passed";
  const isReview = status === "human_review";

  if (!composite && status === "pending") return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-md text-xs mb-5 ${
        isPassed
          ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50"
          : isReview
          ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50"
          : "bg-muted border border-border"
      }`}
      data-testid="bar-verification"
    >
      {/* Status icon + label */}
      <span className="flex items-center gap-1.5 font-medium">
        {isPassed ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : isReview ? (
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span className={isPassed ? "text-emerald-700 dark:text-emerald-300" : isReview ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground"}>
          {isPassed ? "Quad-AI Verified" : isReview ? "Under Review" : "Verifying…"}
        </span>
      </span>

      {/* Composite score */}
      {composite !== null && composite !== undefined && (
        <span className={`font-semibold ${composite >= 95 ? "text-emerald-600 dark:text-emerald-400" : composite >= 80 ? "text-amber-600 dark:text-amber-400" : "text-red-600"}`}>
          {composite}/100
        </span>
      )}

      {/* Divider */}
      <span className="text-border select-none hidden sm:inline">·</span>

      {/* Meta */}
      {verifiedAt && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          {verifiedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      )}
      {sources > 0 && (
        <span className="text-muted-foreground">
          {sources} official source{sources !== 1 ? "s" : ""}
        </span>
      )}

      {/* GOV.UK badge on the right */}
      {isPassed && (
        <span className="ml-auto flex-shrink-0">
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-xs px-2 py-0">
            GOV.UK Verified
          </Badge>
        </span>
      )}
    </div>
  );
}

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
    if (slug) viewMutation.mutate();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="responsive-container py-8 max-w-3xl">
          <Skeleton className="h-7 w-24 mb-6" />
          <Skeleton className="h-3 w-16 mb-3" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-4/5 mb-4" />
          <Skeleton className="h-3 w-48 mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`h-3 ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="responsive-container py-16 text-center max-w-lg">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Article Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This article doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const p = post as any;
  const isTripleVerified = p.verificationStatus === "passed" && p.aiVerificationScore >= 95;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://innovatorfoundervisaassistant.co.uk",
    },
    publisher: {
      "@type": "Organization",
      name: "UK Innovator Founder Visa Assistant",
      url: "https://innovatorfoundervisaassistant.co.uk",
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}`,
    },
    ...(isTripleVerified && {
      reviewedBy: {
        "@type": "Organization",
        name: "Quad-AI Fact Verification (Qwen + Gemini + OpenAI + Claude)",
      },
    }),
  };

  return (
    <>
      <SEOHead
        title={post.metaTitle || `${post.title} | UK Visa Blog`}
        description={post.metaDescription || post.excerpt}
        canonical={`https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-background">
        <article className="responsive-container py-6 max-w-3xl">

          {/* Back */}
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-5 -ml-2" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4 mr-1.5" />Blog
            </Button>
          </Link>

          {/* Slim meta bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">{post.category.replace(/-/g, " ")}</Badge>
            {post.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
            {isTripleVerified && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs gap-1" data-testid="badge-triple-verified">
                <ShieldCheck className="w-3 h-3" />Verified
              </Badge>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <User className="w-3 h-3" />{post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{post.readingTime} min
            </span>
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />{post.views.toLocaleString()}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleShare} className="h-6 px-2" data-testid="button-share">
              <Share2 className="w-3 h-3 mr-1" />Share
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3" data-testid="heading-blog-title">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-muted-foreground mb-5 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Compact verification bar */}
          <VerificationBar post={post} />

          {/* Content */}
          <div
            className="prose prose-sm md:prose dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-5 border-t mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Trust footer row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground border rounded-md px-3 py-2.5 bg-muted/30 mb-5">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" />Verified against GOV.UK</span>
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-500" />Quad-AI fact-checked</span>
            <span className="flex items-center gap-1">Re-verified every 90 days</span>
            <a
              href="https://www.gov.uk/innovator-founder-visa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />GOV.UK
            </a>
          </div>

          {/* CTA */}
          <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
            <p className="text-sm font-semibold mb-1">Need help with your visa application?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Access 109 AI-powered tools to build your business plan and prepare your Innovator Founder Visa application.
            </p>
            <Link href="/questionnaire">
              <Button size="sm" data-testid="button-start-plan">Start Your Business Plan</Button>
            </Link>
          </div>

        </article>
      </div>

      <Footer />
    </>
  );
}
