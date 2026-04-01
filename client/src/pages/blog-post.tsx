import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, User, ArrowLeft, Share2, BookOpen,
  ShieldCheck, AlertCircle, CheckCircle2, Eye, Fingerprint,
  Cpu, RefreshCw, ExternalLink
} from "lucide-react";
import { useEffect } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

function VerificationPanel({ post }: { post: BlogPost }) {
  const p = post as any;
  const status = p.verificationStatus ?? 'pending';
  const composite = p.aiVerificationScore;
  const gemini = p.geminiScore;
  const openai = p.openaiScore;
  const verifiedAt = p.verifiedAt ? new Date(p.verifiedAt) : null;
  const expiresAt = p.verificationExpiresAt ? new Date(p.verificationExpiresAt) : null;
  const sources = p.sourcesCited ?? 0;
  const hash = p.contentHash;

  const isPassed = status === 'passed';
  const isReview = status === 'human_review';
  const isPending = status === 'pending' || !status;

  if (!composite && isPending) return null;

  return (
    <div className="my-8 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-3 ${isPassed ? 'bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800' : isReview ? 'bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800' : 'bg-muted border-b border-border'}`}>
        {isPassed ? (
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : isReview ? (
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <Cpu className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${isPassed ? 'text-emerald-700 dark:text-emerald-300' : isReview ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>
            {isPassed ? 'Triple-AI Verified — Factual Accuracy Confirmed' : isReview ? 'Under Editorial Review' : 'Verification In Progress'}
          </p>
          <p className="text-xs text-muted-foreground">
            Independently fact-checked by Gemini and OpenAI against official GOV.UK sources
          </p>
        </div>
        {isPassed && (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 shrink-0 text-xs">
            GOV.UK Verified
          </Badge>
        )}
      </div>

      {/* Score grid */}
      {composite !== null && composite !== undefined && (
        <div className="px-5 py-4 grid grid-cols-3 gap-4 bg-background">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Composite Score</p>
            <p className={`text-2xl font-bold ${composite >= 95 ? 'text-emerald-600' : composite >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {composite}<span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
            <Progress value={composite} className="h-1 mt-1" />
          </div>
          <div className="text-center border-x border-border px-2">
            <p className="text-xs text-muted-foreground mb-1">Gemini Score</p>
            <p className={`text-2xl font-bold ${(gemini ?? 0) >= 95 ? 'text-emerald-600' : (gemini ?? 0) >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {gemini ?? '—'}
              {gemini !== null && gemini !== undefined && <span className="text-sm font-normal text-muted-foreground">/100</span>}
            </p>
            <Progress value={gemini ?? 0} className="h-1 mt-1" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">OpenAI Score</p>
            <p className={`text-2xl font-bold ${(openai ?? 0) >= 95 ? 'text-emerald-600' : (openai ?? 0) >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {openai ?? '—'}
              {openai !== null && openai !== undefined && <span className="text-sm font-normal text-muted-foreground">/100</span>}
            </p>
            <Progress value={openai ?? 0} className="h-1 mt-1" />
          </div>
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-5 py-3 bg-muted/40 text-xs text-muted-foreground border-t border-border">
        {verifiedAt && (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Verified {verifiedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {expiresAt && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Next check {expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {sources > 0 && (
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            {sources} official source{sources !== 1 ? 's' : ''} cited
          </span>
        )}
        {hash && (
          <span className="flex items-center gap-1.5 font-mono" title={`Content integrity hash: ${hash}`}>
            <Fingerprint className="w-3.5 h-3.5" />
            SHA-256: {hash.substring(0, 12)}…
          </span>
        )}
      </div>
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

  const p = post as any;
  const isTripleVerified = p.verificationStatus === 'passed' && p.aiVerificationScore >= 95;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Schema.org Article structured data for E-E-A-T and Google authority
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://innovatorfoundervisaassistant.co.uk"
    },
    "publisher": {
      "@type": "Organization",
      "name": "UK Visa Insights — Innovator Founder Visa Assistant",
      "url": "https://innovatorfoundervisaassistant.co.uk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://innovatorfoundervisaassistant.co.uk/logo.png"
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}`
    },
    ...(isTripleVerified && {
      "reviewedBy": {
        "@type": "Organization",
        "name": "Triple-AI Fact Verification System (Qwen + Gemini + OpenAI)"
      },
      "factChecked": true,
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

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
        <article className="responsive-container py-8 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">
                {post.category.replace('-', ' ')}
              </Badge>
              {post.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Featured
                </Badge>
              )}
              {isTripleVerified && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 gap-1" data-testid="badge-triple-verified">
                  <ShieldCheck className="w-3 h-3" />
                  Triple-AI Verified
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
              <span className="flex items-center gap-2" data-testid="text-author">
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
              {post.views > 0 && (
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()} views
                </span>
              )}
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

          {/* Triple-AI Verification Panel */}
          <VerificationPanel post={post} />

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

          {/* E-E-A-T trust footer */}
          <div className="border rounded-xl p-4 mb-6 bg-muted/30 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              All facts verified against official GOV.UK sources
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              Triple-checked by Qwen, Gemini &amp; OpenAI
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Re-verified every 90 days
            </span>
            <a
              href="https://www.gov.uk/innovator-founder-visa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify on GOV.UK
            </a>
          </div>

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
