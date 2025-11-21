import { AlertCircle } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  date: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    title: "Tech Nation endorser: New focus on AI, Cyber Security, Climate Tech for 2025 applications",
    date: "Nov 2025"
  },
  {
    id: "2",
    title: "UK Innovation Visa: 78% average endorsement success rate for tech startups",
    date: "Current"
  },
  {
    id: "3",
    title: "Innovator International now accepting service-based innovations and B2B platforms",
    date: "2025"
  },
  {
    id: "4",
    title: "University Routes: Fastest endorsement path for academic spinouts (4-6 weeks)",
    date: "Current"
  },
  {
    id: "5",
    title: "Envestors pathway: Focus on revenue-generating and growth-stage startups",
    date: "2025"
  },
  {
    id: "6",
    title: "Global Talent Visa Route: Now available for recognized industry experts",
    date: "Recent"
  }
];

export default function NewsTicker() {
  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-chart-3/10 border-b border-primary/20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider whitespace-nowrap">
              Breaking News
            </span>
          </div>

          {/* Scrolling ticker */}
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap">
              {NEWS_ITEMS.map((item, idx) => (
                <span key={item.id} className="inline-block px-6 text-sm text-foreground">
                  {item.title}
                  {idx < NEWS_ITEMS.length - 1 && (
                    <span className="mx-4 text-primary/40">•</span>
                  )}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {NEWS_ITEMS.map((item) => (
                <span key={`dup-${item.id}`} className="inline-block px-6 text-sm text-foreground">
                  {item.title}
                  <span className="mx-4 text-primary/40">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
