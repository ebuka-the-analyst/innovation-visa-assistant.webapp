import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import NewsModal from "./NewsModal";
import type { NewsItem } from "./NewsModal";

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  { id: "official-1", title: "Innovator Founder Visa: 3-year initial stay with Settlement (ILR) available after 3 years", date: "Official", content: "The Innovator Founder visa allows you to stay in the UK for 3 years initially. You can apply for Indefinite Leave to Remain (Settlement) after 3 years if you meet the requirements. Always verify at gov.uk/innovator-founder-visa", source: "gov.uk", category: "Visa Duration", sourceUrl: "https://www.gov.uk/innovator-founder-visa" },
  { id: "official-2", title: "Three Key Criteria: Innovation, Viability, and Scalability must be demonstrated", date: "Official", content: "Your business idea must be endorsed by an approved body. The endorsing body will assess: Innovation (genuine and original idea), Viability (skills and market knowledge), and Scalability (growth potential). Source: gov.uk/innovator-founder-visa", source: "gov.uk", category: "Requirements", sourceUrl: "https://www.gov.uk/innovator-founder-visa" },
  { id: "official-3", title: "No Fixed Minimum Investment: Investment assessed case-by-case since April 2023", date: "Official", content: "Since April 2023, there is no fixed minimum investment requirement. Your endorsing body will assess whether you have adequate funds for your specific business plan. Source: gov.uk/innovator-founder-visa", source: "gov.uk", category: "Investment", sourceUrl: "https://www.gov.uk/innovator-founder-visa" },
  { id: "official-4", title: "English Language: B2 Level Required (equivalent to IELTS 5.5-6.5 in each component)", date: "Official", content: "You must prove your English language ability at B2 level on the CEFR. This can be demonstrated through approved tests, nationality, or previous degrees taught in English. Source: gov.uk/innovator-founder-visa", source: "gov.uk", category: "Requirements", sourceUrl: "https://www.gov.uk/innovator-founder-visa/knowledge-of-english" },
  { id: "official-5", title: "Endorsed by Approved Bodies: Must obtain endorsement before visa application", date: "Official", content: "You must be endorsed by an approved endorsing body before you can apply for this visa. The endorsing body will assess your business idea against the criteria. Source: gov.uk/government/publications/endorsing-bodies-innovator-founder", source: "gov.uk", category: "Endorsement", sourceUrl: "https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder" },
  { id: "official-6", title: "Contact Points: Regular meetings with endorsing body required during visa period", date: "Official", content: "After your visa is granted, you must maintain contact with your endorsing body at set points. They will monitor your business progress and confirm you are meeting milestones. Source: gov.uk/innovator-founder-visa", source: "gov.uk", category: "Ongoing", sourceUrl: "https://www.gov.uk/innovator-founder-visa/your-responsibilities" },
  { id: "official-7", title: "Always Verify: Check gov.uk for the latest official requirements and guidance", date: "Important", content: "Immigration rules can change. Always verify the latest requirements directly on gov.uk before making any decisions. This platform provides guidance only - official sources are authoritative.", source: "Disclaimer", category: "Important", sourceUrl: "https://www.gov.uk/innovator-founder-visa" },
  { id: "official-8", title: "Processing Time: Standard visa decisions within 3 weeks of biometrics appointment", date: "Official", content: "Most visa applications are decided within 3 weeks of your biometrics appointment. Priority and super-priority services may be available for faster decisions. Source: gov.uk/innovator-founder-visa", source: "gov.uk", category: "Timeline", sourceUrl: "https://www.gov.uk/innovator-founder-visa/how-long-it-takes" }
];

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch news on mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (response.ok) {
          const news = await response.json();
          setNewsItems(news);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll horizontally
  useEffect(() => {
    if (!tickerRef.current || newsItems.length === 0) return;

    let currentScroll = 0;
    const itemWidth = 300; // Width per item
    const totalWidth = newsItems.length * itemWidth * 2;

    scrollIntervalRef.current = setInterval(() => {
      currentScroll += 1;
      if (tickerRef.current) {
        tickerRef.current.scrollLeft = currentScroll % totalWidth;
      }
    }, 16); // ~60fps

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [newsItems]);

  const handleBackward = () => {
    if (tickerRef.current) {
      tickerRef.current.scrollLeft -= 300;
    }
  };

  const handleForward = () => {
    if (tickerRef.current) {
      tickerRef.current.scrollLeft += 300;
    }
  };

  const handleArticleClick = (article: NewsItem) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1 px-2 py-2 bg-background border-b">
        {/* Left Navigation */}
        <div style={{ backgroundColor: "#41B6E6" }} className="rounded px-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackward}
            className="h-6 w-6"
            data-testid="button-ticker-backward"
          >
            <ChevronLeft className="w-3 h-3 text-white" />
          </Button>
        </div>

        {/* Horizontal scrolling ticker */}
        <div className="flex-1 overflow-hidden" ref={tickerRef}>
          <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
            {/* First pass */}
            {newsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleArticleClick(item)}
                className="flex-shrink-0 w-80 px-3 py-1 text-xs text-foreground hover:text-primary transition-colors cursor-pointer hover:underline text-left whitespace-normal line-clamp-2"
              >
                <span className="text-primary/60 mr-2">•</span>
                {item.title}
              </button>
            ))}
            {/* Duplicate for seamless loop */}
            {newsItems.map((item) => (
              <button
                key={`dup-${item.id}`}
                onClick={() => handleArticleClick(item)}
                className="flex-shrink-0 w-80 px-3 py-1 text-xs text-foreground hover:text-primary transition-colors cursor-pointer hover:underline text-left whitespace-normal line-clamp-2"
              >
                <span className="text-primary/60 mr-2">•</span>
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right Navigation */}
        <div style={{ backgroundColor: "#41B6E6" }} className="rounded px-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleForward}
            className="h-6 w-6"
            data-testid="button-ticker-forward"
          >
            <ChevronRight className="w-3 h-3 text-white" />
          </Button>
        </div>
      </div>

      {/* News Modal */}
      {selectedArticle && (
        <NewsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          article={selectedArticle}
        />
      )}
    </>
  );
}
