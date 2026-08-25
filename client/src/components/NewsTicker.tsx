import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NewsModal from "./NewsModal";
import type { NewsItem } from "./NewsModal";

type LiveNewsArticle = {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  sourceName?: string | null;
  category?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  aiSummary?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isStrictTickerArticle(article: LiveNewsArticle) {
  if (!article?.id || !/\binnovator[\s-]+founder\b/i.test(String(article.title || ""))) return false;
  if (!article.publishedAt || Number.isNaN(new Date(article.publishedAt).getTime())) return false;

  try {
    const hostname = new URL(String(article.url || "")).hostname.toLowerCase();
    return hostname === "gov.uk" || hostname === "www.gov.uk";
  } catch {
    return false;
  }
}

function toNewsItem(article: LiveNewsArticle): NewsItem {
  return {
    id: article.id,
    title: article.title,
    date: formatDate(article.publishedAt),
    content: article.description || "Open GOV.UK for the full official update.",
    source: "GOV.UK (Home Office / UKVI)",
    category: "Innovator Founder",
    sourceUrl: article.url || undefined,
  };
}

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/news?limit=20");
      if (!response.ok) throw new Error(`News request failed (${response.status})`);
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("News feed returned an invalid response");

      // Defence in depth: even if the API is accidentally broadened later, the
      // homepage will only render directly named Innovator Founder GOV.UK items.
      setNewsItems(payload.filter(isStrictTickerArticle).map(toNewsItem));
      setLoadError(false);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setLoadError(true);
      setNewsItems([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchNews();
    const interval = setInterval(() => void fetchNews(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tickerRef.current || newsItems.length === 0) return;
    let currentScroll = tickerRef.current.scrollLeft;
    const itemWidth = 320;
    const totalWidth = Math.max(itemWidth, newsItems.length * itemWidth);
    scrollIntervalRef.current = setInterval(() => {
      currentScroll += 1;
      if (tickerRef.current) tickerRef.current.scrollLeft = currentScroll % totalWidth;
    }, 24);
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    };
  }, [newsItems]);

  const scrollBy = (amount: number) => {
    tickerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex items-center gap-1 border-b bg-background px-2 py-2" data-testid="live-news-ticker">
        <div className="flex-shrink-0 rounded bg-[#005EB8] px-1">
          <Button variant="ghost" size="icon" onClick={() => scrollBy(-320)} className="h-6 w-6 hover:bg-[#004B93]" disabled={!newsItems.length} data-testid="button-ticker-backward">
            <ChevronLeft className="h-3 w-3 text-white" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden" ref={tickerRef}>
          {newsItems.length ? (
            <div className="flex min-w-max items-center gap-4">
              {newsItems.map((item) => (
                <button key={item.id} onClick={() => { setSelectedArticle(item); setModalOpen(true); }} className="w-80 flex-shrink-0 cursor-pointer px-3 py-1 text-left text-xs text-foreground transition-colors hover:text-red-700 hover:underline dark:hover:text-red-300">
                  <div className="line-clamp-2 leading-4"><span className="mr-1 text-red-500">•</span>{item.title}</div>
                  <div className="mt-0.5 pl-3 text-[10px] text-muted-foreground">GOV.UK · {item.date}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-8 items-center justify-center gap-2 text-xs text-muted-foreground">
              {refreshing ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Checking official Innovator Founder updates...</> : loadError ? <button className="hover:text-red-700 hover:underline" onClick={() => void fetchNews()}>Official news feed unavailable. Retry</button> : "No new official Innovator Founder updates are available right now."}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 rounded bg-[#005EB8] px-1">
          <Button variant="ghost" size="icon" onClick={() => scrollBy(320)} className="h-6 w-6 hover:bg-[#004B93]" disabled={!newsItems.length} data-testid="button-ticker-forward">
            <ChevronRight className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>

      {selectedArticle && <NewsModal open={modalOpen} onOpenChange={setModalOpen} article={selectedArticle} />}
    </>
  );
}
