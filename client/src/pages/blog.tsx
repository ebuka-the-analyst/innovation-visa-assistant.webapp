import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Clock, Search, ArrowRight, Tag, Newspaper
} from "lucide-react";
import { useState } from "react";
import type { BlogPost } from "@shared/schema";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "visa-updates", label: "Visa Updates" },
  { id: "business-planning", label: "Business Planning" },
  { id: "endorsement", label: "Endorsement" },
  { id: "success-stories", label: "Success Stories" },
  { id: "uk-immigration", label: "UK Immigration" },
  { id: "guides", label: "Guides" },
];

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

function catBadgeClass(cat: string) {
  return CAT_COLORS[cat] ?? "bg-[#005EB8] text-white";
}

function cardGradient(cat: string) {
  return CAT_GRADIENT[cat] ?? "from-slate-800 to-slate-700";
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function CatLabel({ cat }: { cat: string }) {
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${catBadgeClass(cat)}`}>
      {cat.replace(/-/g, " ")}
    </span>
  );
}

/* ─── Hero card (featured / first post) ─── */
function HeroCard({ post }: { post: BlogPost }) {
  const gradient = cardGradient(post.category);

  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-hero-${post.slug}`}>
      <div className="group relative overflow-hidden rounded-md cursor-pointer h-[340px] md:h-[420px]">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
          <div className="flex items-center gap-2 mb-2">
            <CatLabel cat={post.category} />
            {post.isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-300 border border-yellow-400/50 px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-white leading-snug mb-2 group-hover:underline decoration-white/60 underline-offset-2" data-testid={`text-hero-title-${post.id}`}>
            {post.title}
          </h2>
          <p className="text-sm text-white/80 line-clamp-2 mb-3 hidden md:block">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Standard post card ─── */
function PostCard({ post }: { post: BlogPost }) {
  const gradient = cardGradient(post.category);

  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-card-${post.slug}`}>
      <article className="group flex flex-col h-full bg-card border rounded-md overflow-hidden cursor-pointer hover-elevate">
        {/* Gradient header with title overlaid */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute top-2 left-2">
            <CatLabel cat={post.category} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3
              className="font-bold text-sm leading-snug line-clamp-3 text-white group-hover:text-white/90 transition-colors"
              data-testid={`text-card-title-${post.id}`}
            >
              {post.title}
            </h3>
          </div>
        </div>
        {/* Card body — excerpt + metadata only */}
        <div className="flex flex-col flex-1 p-3">
          <p className="text-xs text-muted-foreground line-clamp-2 mb-auto">{post.excerpt}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1 text-primary font-medium">Read <ArrowRight className="w-3 h-3" /></span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Sidebar compact list row ─── */
function SidebarRow({ post }: { post: BlogPost }) {
  const gradient = cardGradient(post.category);

  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-sidebar-${post.slug}`}>
      <div className="group flex gap-2.5 py-2.5 border-b last:border-b-0 cursor-pointer">
        <div className={`w-14 h-14 rounded flex-shrink-0 bg-gradient-to-br ${gradient}`} />
        <div className="flex-1 min-w-0">
          <CatLabel cat={post.category} />
          <p className="text-xs font-semibold leading-snug mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(post.publishedAt)}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeletons ─── */
function HeroSkeleton() {
  return <Skeleton className="w-full h-[340px] md:h-[420px] rounded-md" />;
}
function CardSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden">
      <Skeleton className="w-full h-36" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/* ─── Page ─── */
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

  const allPosts = posts || [];
  const featured = allPosts.find(p => p.isFeatured) || allPosts[0];
  const remaining = allPosts.filter(p => p !== featured);

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa Blog | Expert Insights"
        description="Latest news, guides, and expert analysis on the UK Innovator Founder Visa. Quad-AI verified for accuracy."
        canonical="https://innovatorfoundervisaassistant.co.uk/blog"
      />
      <Header />

      <div className="min-h-screen bg-background">

        {/* ── Newspaper masthead ── */}
        <div className="bg-foreground text-background">
          <div className="responsive-container py-0">
            {/* Top ticker */}
            <div className="flex items-center gap-3 border-b border-background/10 py-1.5 text-xs text-background/60">
              <span className="font-bold text-background/80 shrink-0">UK VISA INSIGHTS</span>
              <span className="flex items-center gap-1"><Newspaper className="w-3 h-3" />{allPosts.length} articles published</span>
            </div>
            {/* Masthead title */}
            <div className="py-4 border-b border-background/10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-background leading-none" data-testid="heading-blog">
                  UK Visa Insights
                </h1>
                <p className="text-sm text-background/60 mt-1 font-medium">
                  Expert guidance on the UK Innovator Founder Visa
                </p>
              </div>
            </div>
            {/* Category nav bar */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 text-xs font-semibold px-3 py-1 rounded transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-background text-foreground"
                      : "text-background/70 hover:text-background hover:bg-background/10"
                  }`}
                  data-testid={`button-cat-${cat.id}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="responsive-container py-6">
          {/* Search bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
              data-testid="input-blog-search"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HeroSkeleton />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2.5 py-2.5 border-b">
                    <Skeleton className="w-14 h-14 rounded shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : allPosts.length === 0 ? (
            <div className="py-20 text-center" data-testid="text-no-posts">
              <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-base font-semibold mb-1">No articles found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "New articles are published daily — check back soon"}
              </p>
              {(searchQuery || selectedCategory !== "all") && (
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} data-testid="button-clear-filters">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ─── Main column ─── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Hero */}
                {featured && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Top Story</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <HeroCard post={featured} />
                  </div>
                )}

                {/* Post grid */}
                {remaining.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Latest Articles
                        {selectedCategory !== "all" && ` · ${CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground shrink-0" data-testid="text-results-count">{remaining.length} articles</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="posts-grid">
                      {remaining.map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Sidebar ─── */}
              <aside className="space-y-6">

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Topics</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-1">
                    {CATEGORIES.filter(c => c.id !== "all").map(cat => {
                      const count = allPosts.filter(p => p.category === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                          }`}
                          data-testid={`button-sidebar-cat-${cat.id}`}
                        >
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-xs opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Latest posts sidebar */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Latest</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div data-testid="sidebar-latest">
                    {allPosts.slice(0, 6).map(post => <SidebarRow key={post.id} post={post} />)}
                  </div>
                </div>

                {/* CTA box */}
                <div className="border-2 border-primary rounded-md p-4 bg-primary/5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Free Tools</p>
                  <p className="font-bold text-sm mb-1.5 leading-snug">109 AI tools for your Innovator Founder Visa</p>
                  <p className="text-xs text-muted-foreground mb-3">Business plans, compliance checklists, financial models — all built for GOV.UK requirements.</p>
                  <Link href="/tools">
                    <Button size="sm" className="w-full" data-testid="button-sidebar-tools">
                      Explore Tools <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>


              </aside>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
