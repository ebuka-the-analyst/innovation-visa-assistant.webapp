import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Clock, User, ArrowLeft, Share2, BookOpen,
  ArrowRight, Tag
} from "lucide-react";
import { useEffect } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";

const CAT_COLORS: Record<string, string> = {
  "visa-updates":     "bg-red-600 text-white",
  "business-planning":"bg-[#005EB8] text-white",
  "endorsement":      "bg-purple-600 text-white",
  "success-stories":  "bg-emerald-600 text-white",
  "uk-immigration":   "bg-orange-600 text-white",
  "guides":           "bg-teal-600 text-white",
};

const CAT_GRADIENT: Record<string, string> = {
  "visa-updates":     "from-red-900 to-red-700",
  "business-planning":"from-[#003f7a] to-[#005EB8]",
  "endorsement":      "from-purple-900 to-purple-700",
  "success-stories":  "from-emerald-900 to-emerald-700",
  "uk-immigration":   "from-orange-900 to-orange-700",
  "guides":           "from-teal-900 to-teal-700",
};

function catBadgeClass(cat: string) { return CAT_COLORS[cat] ?? "bg-[#005EB8] text-white"; }
function cardGradient(cat: string) { return CAT_GRADIENT[cat] ?? "from-slate-800 to-slate-700"; }
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function fmtDateShort(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function CatLabel({ cat, size = "sm" }: { cat: string; size?: "sm" | "lg" }) {
  const base = catBadgeClass(cat);
  return (
    <span className={`inline-block font-bold uppercase tracking-widest rounded ${
      size === "lg" ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"
    } ${base}`}>
      {cat.replace(/-/g, " ")}
    </span>
  );
}

function SidebarPostRow({ post }: { post: BlogPost }) {
  const p = post as any;
  const img = p.featuredImage || null;
  const gradient = cardGradient(post.category);
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group flex gap-2.5 py-2.5 border-b last:border-b-0 cursor-pointer">
        <div className={`w-14 h-14 rounded flex-shrink-0 overflow-hidden ${!img ? `bg-gradient-to-br ${gradient}` : ""}`}>
          {img && <img src={img} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <CatLabel cat={post.category} />
          <p className="text-xs font-semibold leading-snug mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDateShort(post.publishedAt)}</p>
        </div>
      </div>
    </Link>
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

  const { data: recentPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog?limit=6");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const viewMutation = useMutation({
    mutationFn: async () => { await fetch(`/api/blog/${slug}/view`, { method: "POST" }); },
  });

  useEffect(() => { if (slug) viewMutation.mutate(); }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[260px] md:h-[380px]" />
        <div className="responsive-container py-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className={`h-3 ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 py-20" data-testid="error-post-not-found">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Article Not Found</h1>
        <p className="text-sm text-muted-foreground">This article doesn't exist or has been removed.</p>
        <Link href="/blog">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const p = post as any;
  const img = p.featuredImage || null;
  const gradient = cardGradient(post.category);
  const isTripleVerified = p.verificationStatus === "passed" && p.aiVerificationScore >= 95;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const related = (recentPosts || []).filter(rp => rp.slug !== post.slug && rp.category === post.category).slice(0, 5);
  const moreRecent = (recentPosts || []).filter(rp => rp.slug !== post.slug && rp.category !== post.category).slice(0, 5 - related.length);
  const sidebarPosts = [...related, ...moreRecent].slice(0, 5);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author, url: "https://innovatorfoundervisaassistant.co.uk" },
    publisher: { "@type": "Organization", name: "UK Innovator Founder Visa Assistant", url: "https://innovatorfoundervisaassistant.co.uk" },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}` },
    ...(isTripleVerified && { reviewedBy: { "@type": "Organization", name: "Quad-AI Fact Verification (Qwen + Gemini + OpenAI + Claude)" } }),
  };

  return (
    <>
      <SEOHead
        title={post.metaTitle || `${post.title} | UK Visa Blog`}
        description={post.metaDescription || post.excerpt}
        canonical={`https://innovatorfoundervisaassistant.co.uk/blog/${post.slug}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="min-h-screen bg-background">

        {/* ── Hero banner ── */}
        <div className="relative w-full h-[240px] md:h-[360px] overflow-hidden">
          {img ? (
            <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

          {/* Back button */}
          <div className="absolute top-4 left-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-3 text-xs" data-testid="button-back-blog">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Blog
              </Button>
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <CatLabel cat={post.category} size="lg" />
                {post.isFeatured && (
                  <span className="text-xs font-bold uppercase tracking-widest text-yellow-300 border border-yellow-400/50 px-2.5 py-0.5 rounded">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-3" data-testid="heading-blog-title">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{post.author}</span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{fmtDate(post.publishedAt)}</span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{post.readingTime} min read</span>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-white/65 hover:text-white ml-auto transition-colors" data-testid="button-share">
                  <Share2 className="w-3 h-3" />Share
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* ── Body: article + sidebar ── */}
        <div className="responsive-container py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Article */}
            <article className="lg:col-span-2">
              {/* Excerpt standfirst */}
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 mb-6 italic">
                {post.excerpt}
              </p>

              {/* Content */}
              <div
                className="prose prose-sm md:prose dark:prose-invert max-w-none mb-8
                  prose-headings:font-black prose-headings:tracking-tight
                  prose-h2:text-xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/40 prose-blockquote:rounded-r-md prose-blockquote:py-1
                  prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-5 border-t mb-6">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}


              {/* CTA */}
              <div className="border-2 border-primary rounded-md p-5 bg-primary/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Ready to Apply?</p>
                <p className="font-bold text-base mb-1.5 leading-snug">109 AI-powered tools for your Innovator Founder Visa</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Build your business plan, pass your endorsement interview, and submit a flawless visa application — all in one platform.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/questionnaire">
                    <Button size="sm" data-testid="button-start-plan">
                      Start Your Business Plan <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button size="sm" variant="outline" data-testid="button-view-tools">Explore All Tools</Button>
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">

              {/* Related / latest */}
              {sidebarPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {related.length > 0 ? "Related Articles" : "Latest Articles"}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {sidebarPosts.map(rp => <SidebarPostRow key={rp.id} post={rp} />)}
                  <Link href="/blog">
                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs" data-testid="button-all-posts">
                      All Articles <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Share */}
              <div className="border rounded-md p-4 bg-card">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Share This Article</p>
                <p className="text-xs text-muted-foreground mb-3">Help other founders discover this guide.</p>
                <Button size="sm" variant="outline" className="w-full" onClick={handleShare} data-testid="button-share-sidebar">
                  <Share2 className="w-3.5 h-3.5 mr-2" />Share Article
                </Button>
              </div>


              {/* About */}
              <div className="border rounded-md p-4 bg-card">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">About This Blog</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Written by specialist immigration analysts and cross-verified by 4 independent AI models against GOV.UK official guidance. Updated every 90 days.
                </p>
              </div>

            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
