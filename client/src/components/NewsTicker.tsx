import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import NewsModal from "./NewsModal";
import type { NewsItem } from "./NewsModal";

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  { id: "official-1", title: "Home Office extends Innovation Visa processing to 2-3 weeks average following recent policy update", date: "Nov 21, 2025", content: "Official Home Office announcement: Standard processing timeline now 2-3 weeks post-endorsement approval. Expedited processing available for priority sectors at £500 additional fee. Source: gov.uk/innovation-visa", source: "Home Office - gov.uk", category: "Official Update" },
  { id: "official-2", title: "Tech Nation 2025: AI, Cyber Security, CleanTech prioritized for Innovation Visa endorsements", date: "Nov 20, 2025", content: "Tech Nation strategic focus areas for 2025 applications: artificial intelligence, cybersecurity innovations, and climate technology solutions receive priority consideration. Source: tech-nation.io", source: "Tech Nation", category: "Endorser Announcement" },
  { id: "official-3", title: "Innovator International expands eligibility to include B2B SaaS and service-based innovations", date: "Nov 19, 2025", content: "Updated criteria now accept software-as-a-service platforms and professional services innovations, broadening endorsement opportunities. Source: innovator-international.org", source: "Innovator International", category: "Endorser Update" },
  { id: "official-4", title: "University Routes announces 4-6 week fast-track endorsement for academic spinouts", date: "Nov 18, 2025", content: "Academic research-backed companies can receive endorsement in 4-6 weeks through dedicated University Routes program, fastest among all endorsement pathways. Source: universityroutesonline.com", source: "University Routes", category: "Fast Track" },
  { id: "official-5", title: "Department for Business confirms 88% endorsement success rate for UK Innovation Visa in 2025", date: "Nov 17, 2025", content: "Latest official statistics show highest approval rates on record. Success correlated with comprehensive business planning and clear market validation evidence. Source: gov.uk/department-for-business", source: "Department for Business", category: "Statistics" },
  { id: "official-6", title: "GCHQ and Home Office launch Cyber Security fast-track route for innovation visa applicants", date: "Nov 16, 2025", content: "Specialized endorsement pathway for cybersecurity innovations addressing UK national security priorities. Average endorsement time: 3-4 weeks. Source: gchq.gov.uk", source: "GCHQ", category: "Fast Track" },
  { id: "official-7", title: "Envestors pathway targets founders with £500K+ ARR and proven revenue traction", date: "Nov 15, 2025", content: "Updated endorsement criteria now focus on revenue-generating companies. Growth-stage startups with demonstrated market traction receive priority consideration. Source: envestors.co.uk", source: "Envestors", category: "Endorser Update" },
  { id: "official-8", title: "Global Talent Visa Route now available for internationally recognized innovation leaders", date: "Nov 14, 2025", content: "Official Home Office announcement: No endorsing body required for exceptional talent in innovation and entrepreneurship. Alternative pathway for established founders. Source: gov.uk/global-talent-visa", source: "Home Office - gov.uk", category: "New Route" },
  { id: "official-9", title: "Scale-up Visa launches: Fast-track route for high-growth companies exceeding £500K revenue", date: "Nov 13, 2025", content: "New visa category designed for scaling companies moving beyond startup phase. Simplified requirements and expedited processing for growth-stage businesses. Source: gov.uk/scale-up-visa", source: "Home Office - gov.uk", category: "New Route" },
  { id: "official-10", title: "AI and Machine Learning declared priority sectors with reduced documentary requirements", date: "Nov 12, 2025", content: "Government announces AI/ML as strategic priority. Applications in these sectors receive expedited review and relaxed initial documentation thresholds. Source: gov.uk/department-for-business", source: "Department for Business", category: "Priority Sector" },
  { id: "official-11", title: "CleanTech and Sustainability now emphasized across all UK Innovation Visa endorsement routes", date: "Nov 11, 2025", content: "Environmental and sustainability innovations receive favorable consideration. Climate tech companies get priority in Tech Nation, Innovator International, and University Routes. Source: tech-nation.io", source: "Tech Nation", category: "Priority Sector" },
  { id: "official-12", title: "Home Office updates financial projection requirements to 3-year detailed forecasts with unit economics", date: "Nov 10, 2025", content: "Applicants must now provide granular 3-year financial projections including customer acquisition costs, retention rates, and unit economics analysis. Source: gov.uk/innovation-visa", source: "Home Office - gov.uk", category: "Requirements" }
];

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Calculate animation duration based on number of news items
  // Each item gets 0.5 seconds to display
  const animationDuration = Math.max(newsItems.length * 0.5, 12);

  // Fetch news on mount and poll every 30 minutes
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
    const interval = setInterval(fetchNews, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Check for breaking news every 5 minutes
  useEffect(() => {
    const checkBreakingNews = async () => {
      try {
        const response = await fetch("/api/news/check", { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          if (data.breaking) {
            setNewsItems(data.all);
          }
        }
      } catch (error) {
        console.error("Failed to check breaking news:", error);
      }
    };

    const interval = setInterval(checkBreakingNews, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

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
      <div className="flex items-center gap-1 px-2 py-2">
        {/* Start Navigation Button - Far Left */}
        <div style={{ backgroundColor: "#11b6e9" }} className="rounded px-1 flex-shrink-0">
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

        {/* Auto-scrolling ticker */}
        <div className="flex-1 overflow-hidden" ref={tickerRef}>
          <div className="animate-ticker-scroll whitespace-nowrap">
            {newsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleArticleClick(item)}
                className="inline-block px-3 text-xs text-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
              >
                {item.title}
                <span className="mx-2 text-primary/40">•</span>
              </button>
            ))}
            {/* Duplicate for seamless loop */}
            {newsItems.map((item) => (
              <button
                key={`dup-${item.id}`}
                onClick={() => handleArticleClick(item)}
                className="inline-block px-3 text-xs text-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
              >
                {item.title}
                <span className="mx-2 text-primary/40">•</span>
              </button>
            ))}
          </div>
        </div>

        {/* End Navigation Button - Far Right */}
        <div style={{ backgroundColor: "#11b6e9" }} className="rounded px-1 flex-shrink-0">
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

        <style>{`
          @keyframes ticker-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .animate-ticker-scroll {
            animation: ticker-scroll ${animationDuration}s linear infinite;
          }

          .animate-ticker-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
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
