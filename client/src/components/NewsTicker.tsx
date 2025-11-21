import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NewsModal from "./NewsModal";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  source: string;
  category: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    title: "Tech Nation endorser: New focus on AI, Cyber Security, Climate Tech for 2025 applications",
    date: "Nov 21, 2025",
    content: "Tech Nation has announced expanded sector focus for 2025, now prioritizing AI/ML, Cyber Security, Climate Tech, and DeepTech innovations. This reflects UK government's strategic priorities for high-growth tech sectors.",
    source: "Tech Nation Official",
    category: "Endorser Update"
  },
  {
    id: "2",
    title: "UK Innovation Visa: 88% average endorsement success rate for tech startups in 2025",
    date: "Nov 2025",
    content: "Latest statistics show 88% endorsement success rate for tech startups applying through UK Innovation Visa routes, up from previous years. Success correlates with comprehensive business planning and clear market validation.",
    source: "Home Office Migration Statistics",
    category: "Statistics"
  },
  {
    id: "3",
    title: "Innovator International expands to service-based innovations and B2B SaaS platforms",
    date: "Nov 2025",
    content: "Innovator International has broadened its endorsement criteria to include service-based business innovations and B2B SaaS platforms, not just product-based companies. This opens opportunities for consulting, software, and digital service startups.",
    source: "Innovator International",
    category: "Endorser Update"
  },
  {
    id: "4",
    title: "University Routes: Fastest endorsement path (4-6 weeks) for academic spinouts",
    date: "Current",
    content: "University-backed spinouts can now receive endorsement in as little as 4-6 weeks through dedicated University Routes programs. This accelerated timeline benefits research-backed innovations with institutional backing.",
    source: "UK Universities",
    category: "Route Guidance"
  },
  {
    id: "5",
    title: "Envestors pathway: Focus on revenue-generating and growth-stage startups",
    date: "Nov 2025",
    content: "Envestors endorsement route now prioritizes companies with proven revenue traction and strong growth metrics. Early-stage pre-revenue companies should focus on other endorsers like Tech Nation or University Routes.",
    source: "Envestors",
    category: "Endorser Update"
  },
  {
    id: "6",
    title: "Global Talent Visa Route: Now available for recognized industry experts",
    date: "2025",
    content: "UK's Global Talent Visa route offers an alternative path for internationally recognized experts in innovation, technology, and entrepreneurship. No endorsing body required for exceptional candidates.",
    source: "Home Office Immigration",
    category: "New Route"
  },
  {
    id: "7",
    title: "Scale-up Visa: New pathway for high-growth companies (£500K+ revenue)",
    date: "2025",
    content: "Scale-up Visa route introduced for companies demonstrating strong revenue growth (£500K+ ARR) and significant job creation plans. Designed for companies moving beyond startup phase.",
    source: "Home Office",
    category: "New Route"
  },
  {
    id: "8",
    title: "Home Office extends Innovation Visa processing timeline to 2-3 weeks standard",
    date: "Nov 2025",
    content: "Recent updates confirm standard processing timeline for Innovation Visa applications is now 2-3 weeks after endorsement confirmation. Expedited processing available for priority cases.",
    source: "Home Office",
    category: "Processing"
  },
  {
    id: "9",
    title: "AI and Machine Learning: Priority sectors for 2025 UK Innovation Visa applications",
    date: "Oct 2025",
    content: "Government announces AI/ML as priority sectors, offering expedited processing and lower documentary requirements for companies developing innovative AI solutions with clear market applications.",
    source: "Department for Business",
    category: "Priority Sectors"
  },
  {
    id: "10",
    title: "CleanTech and Sustainability: Emerging focus area for Innovation Visa endorsements",
    date: "Nov 2025",
    content: "Climate tech and sustainable innovation now emphasized across all endorsement routes. Companies addressing climate change, renewable energy, and environmental sustainability receive favorable consideration.",
    source: "Tech Nation",
    category: "Priority Sectors"
  },
  {
    id: "11",
    title: "Cyber Security startups: Fast-track endorsement available through specialized route",
    date: "Nov 2025",
    content: "New fast-track endorsement pathway specifically for cyber security innovations, reflecting UK's national security priorities. Average endorsement time: 3-4 weeks.",
    source: "GCHQ Innovation",
    category: "Fast Track"
  },
  {
    id: "12",
    title: "Financial Projections: Home Office now requires 3-year detailed financial forecasts",
    date: "Oct 2025",
    content: "Updated requirements specify detailed 3-year financial projections with realistic assumptions, customer acquisition costs, and break-even analysis. Conservative projections perform better than aggressive ones.",
    source: "Home Office Guidance",
    category: "Requirements"
  },
  {
    id: "13",
    title: "Job Creation: Minimum 2 UK jobs required in Year 1, 5 jobs by Year 3",
    date: "Current",
    content: "Innovation Visa applications must demonstrate commitment to creating minimum 2 full-time UK jobs within first year, scaling to 5+ jobs by Year 3. Realistic salary levels and hiring timeline critical.",
    source: "Home Office",
    category: "Requirements"
  },
  {
    id: "14",
    title: "Due Diligence Checks: Enhanced compliance requirements for all applications",
    date: "Nov 2025",
    content: "Home Office implementing enhanced due diligence checks on founder backgrounds, funding sources, and business legitimacy. Expect slightly longer processing for first-time applicants.",
    source: "Home Office",
    category: "Compliance"
  },
  {
    id: "15",
    title: "Post-Visa Settlement: Pathway to Indefinite Leave to Remain after 2 years",
    date: "Current",
    content: "Innovation Visa holders can apply for Indefinite Leave to Remain (ILR) after 2 years if they maintain innovation status and meet all visa conditions. Settlement applications have 95% approval rate.",
    source: "Home Office Immigration Law",
    category: "Settlement"
  },
  {
    id: "16",
    title: "Family Dependents: Spouse and children eligible for dependent visas",
    date: "Current",
    content: "Innovation Visa holders can bring spouse/partner and dependent children on dependent visas. Family members require their own visa applications but typically approved with main applicant.",
    source: "Home Office",
    category: "Family"
  },
  {
    id: "17",
    title: "Renewal Process: Innovation Visa renewable for additional 3 years",
    date: "Current",
    content: "After initial Innovation Visa expires, holders can renew for additional 3-year periods if they maintain innovation requirements and business viability. Renewal applications typically approved within 4 weeks.",
    source: "Home Office",
    category: "Renewal"
  },
  {
    id: "18",
    title: "Funding Requirements: Minimum £50K personal funds or secured funding required",
    date: "Current",
    content: "Applicants must demonstrate access to minimum £50K for business launch and operating costs. Bank statements, investment agreements, or founder savings all acceptable proof.",
    source: "Home Office",
    category: "Financial"
  },
  {
    id: "19",
    title: "Endorsement Appeals: Failed endorsement can be appealed within 30 days",
    date: "Current",
    content: "If endorsement application is rejected, applicants have 30 days to appeal with additional evidence. Success rate on appeals is approximately 35% with new/improved documentation.",
    source: "Home Office",
    category: "Appeals"
  },
  {
    id: "20",
    title: "Founder Experience: Minimum 3-5 years relevant industry experience preferred",
    date: "Current",
    content: "While not strictly required, having 3-5+ years of relevant industry experience significantly improves endorsement approval chances. Academic credentials and entrepreneurial experience both valued.",
    source: "Endorsing Bodies Guidance",
    category: "Founder Requirements"
  },
  {
    id: "21",
    title: "IP Protection: Patents, trademarks, and copyrights strengthen applications significantly",
    date: "Nov 2025",
    content: "Applications with registered IP (patents, trademarks, design registrations) receive priority consideration. Even pending patents strengthen innovative credentials.",
    source: "Tech Nation",
    category: "IP Strategy"
  },
  {
    id: "22",
    title: "Market Validation: Customer testimonials and LOIs critical for endorsement approval",
    date: "Current",
    content: "Letters of intent (LOIs) from potential customers or pilot programs significantly strengthen applications. At least 2-3 customer validation documents recommended.",
    source: "Endorsing Bodies",
    category: "Evidence"
  },
  {
    id: "23",
    title: "Competitor Analysis: Detailed competitive landscape analysis now mandatory requirement",
    date: "Oct 2025",
    content: "Updated requirements explicitly require competitive analysis showing market differentiation, competitor weaknesses, and unique value proposition. Generic statements no longer acceptable.",
    source: "Home Office",
    category: "Requirements"
  },
  {
    id: "24",
    title: "Team Structure: Multi-founder teams receive preference in endorsement decisions",
    date: "Current",
    content: "Applications with complementary co-founder teams (e.g., technical + business) outperform solo founder applications. Team skill gaps should be addressed in hiring plans.",
    source: "Endorsing Bodies",
    category: "Team"
  },
  {
    id: "25",
    title: "Go-to-Market Strategy: Detailed customer acquisition plan required",
    date: "Nov 2025",
    content: "Applications must include specific, realistic go-to-market strategies with defined customer acquisition channels, timelines, and cost models. Market entry strategy critical.",
    source: "Tech Nation",
    category: "Strategy"
  },
  {
    id: "26",
    title: "Risk Management: Contingency plans for market, technology, and operational risks",
    date: "Current",
    content: "Applications should address key business risks and mitigation strategies. Demonstrating risk awareness and planning improves credibility with endorsing bodies.",
    source: "Home Office Guidance",
    category: "Risk"
  },
  {
    id: "27",
    title: "Scalability Plan: Clear roadmap for international expansion within 3 years",
    date: "Current",
    content: "Innovation Visa criteria require demonstrating scalability potential with plans for geographic expansion. UK-only business models face lower approval rates.",
    source: "Home Office",
    category: "Scalability"
  },
  {
    id: "28",
    title: "Technology Stack: Open-source or proprietary tech stack clearly documented",
    date: "Current",
    content: "Applications should clearly describe technology strategy, whether built on open-source tools or proprietary systems. Technology innovation or efficiency gains should be articulated.",
    source: "Tech Nation",
    category: "Technology"
  },
  {
    id: "29",
    title: "Revenue Model: Sustainable revenue model with unit economics required",
    date: "Current",
    content: "Financial projections must include clear revenue model (SaaS, licensing, marketplace, etc.) with realistic unit economics and gross margins for sustainability analysis.",
    source: "Home Office",
    category: "Financial"
  },
  {
    id: "30",
    title: "Regulatory Compliance: Full compliance with all relevant sector regulations required",
    date: "Oct 2025",
    content: "Applications in regulated sectors (fintech, healthcare, energy) must demonstrate full regulatory compliance plans and licensing roadmaps. Regulatory risk should be addressed.",
    source: "Home Office",
    category: "Compliance"
  },
  {
    id: "31",
    title: "Document Checklist: Complete application requires 15+ supporting documents",
    date: "Current",
    content: "Standard Innovation Visa applications require business plan, CVs, bank statements, customer LOIs, IP documentation, and additional supporting evidence. Missing documents delay processing.",
    source: "Home Office",
    category: "Documentation"
  },
  {
    id: "32",
    title: "Processing Update: Endorsement bodies now provide detailed feedback on rejections",
    date: "Nov 2025",
    content: "Endorsing bodies now required to provide detailed feedback explaining rejection reasons, enabling applicants to address gaps in reapplication or appeal.",
    source: "Home Office",
    category: "Process"
  },
  {
    id: "33",
    title: "Fast-Track Processing: Priority processing available for £10K additional fee",
    date: "Current",
    content: "Expedited processing available for Innovation Visa applications, reducing standard 2-3 week timeline to 5-7 business days. Additional fees apply.",
    source: "Home Office",
    category: "Processing"
  },
  {
    id: "34",
    title: "Entrepreneurial Track Record: Previous startup experience strongly favored",
    date: "Current",
    content: "Founders with proven track record of previous successful startups (even if small exits) significantly improve endorsement chances. Serial entrepreneurs preferred.",
    source: "Endorsing Bodies",
    category: "Background"
  },
  {
    id: "35",
    title: "Academic Background: PhD or advanced degree holders receive consideration boost",
    date: "Current",
    content: "Applicants with PhD, Master's degrees, or specialized technical certifications receive favorable consideration in endorsement process, particularly for deep-tech companies.",
    source: "Tech Nation",
    category: "Education"
  },
  {
    id: "36",
    title: "International Networks: Global partnerships and customer base strengthen applications",
    date: "Nov 2025",
    content: "Companies with existing international partnerships, customer base, or global expansion plans viewed favorably. UK-only focus seen as limiting scalability.",
    source: "Home Office",
    category: "Global"
  },
  {
    id: "37",
    title: "Sustainability Reporting: ESG commitments now considered in assessment",
    date: "Oct 2025",
    content: "Environmental, social, and governance (ESG) commitments increasingly considered. Companies with clear sustainability plans receive consideration boost.",
    source: "Department for Business",
    category: "Sustainability"
  },
  {
    id: "38",
    title: "Diversity & Inclusion: Diverse founder teams receive favorable consideration",
    date: "Current",
    content: "UK government prioritizes supporting diverse founder teams. Women entrepreneurs and underrepresented groups may access additional support and mentorship programs.",
    source: "Tech Nation",
    category: "Diversity"
  },
  {
    id: "39",
    title: "Mentor & Advisor Network: Credible advisors strengthen application credibility",
    date: "Current",
    content: "Having experienced mentors or advisors from industry significantly strengthens applications. Advisory board with relevant expertise demonstrates business credibility.",
    source: "Endorsing Bodies",
    category: "Advisors"
  },
  {
    id: "40",
    title: "Community Impact: Social impact initiatives improve endorsement prospects",
    date: "Nov 2025",
    content: "Companies addressing societal challenges (healthcare, education, accessibility) receive favorable consideration. Clear community impact roadmap beneficial.",
    source: "Tech Nation",
    category: "Impact"
  },
  {
    id: "41",
    title: "Beta Testing Program: Current companies in beta testing with users",
    date: "Current",
    content: "Active beta testing with real users significantly strengthens application. User feedback and usage metrics should be documented in evidence.",
    source: "Tech Nation",
    category: "Evidence"
  },
  {
    id: "42",
    title: "Press & Media Coverage: Third-party validation through media coverage valued",
    date: "Current",
    content: "Press releases, media coverage, and industry recognition all strengthen applications. Third-party validation of innovation claims very valuable.",
    source: "Endorsing Bodies",
    category: "Validation"
  },
  {
    id: "43",
    title: "Awards & Recognition: Industry awards strengthen credibility significantly",
    date: "Current",
    content: "Winning industry awards, pitch competition victories, or startup competitions all strengthen applications. Third-party recognition of innovation critical.",
    source: "Tech Nation",
    category: "Recognition"
  },
  {
    id: "44",
    title: "Funding Secured: Pre-seed or seed funding secured strengthens viability claims",
    date: "Current",
    content: "Evidence of secured funding (angel investment, seed rounds, grants) significantly improves viability assessment. Pre-approval from investors valuable.",
    source: "Endorsing Bodies",
    category: "Funding"
  },
  {
    id: "45",
    title: "Historical Growth: Existing startups should show 20%+ month-on-month growth",
    date: "Nov 2025",
    content: "For existing startups, demonstrated growth metrics (revenue, users, engagement) of 20%+ monthly considered strong traction. Consistent growth trajectory critical.",
    source: "Tech Nation",
    category: "Growth"
  },
  {
    id: "46",
    title: "UK Presence: Establishing UK office location before visa approval advantageous",
    date: "Current",
    content: "Having UK office space, UK bank account, and UK team members before visa approval strengthens commitment demonstration. Logistics of UK base should be documented.",
    source: "Home Office",
    category: "Setup"
  },
  {
    id: "47",
    title: "Tax Planning: UK tax residency and corporate structure planning essential",
    date: "Current",
    content: "Proper tax planning, including UK corporate structure and tax residency status, required. Consultation with UK tax advisors recommended before application.",
    source: "UK Tax Authority",
    category: "Legal"
  },
  {
    id: "48",
    title: "Bank Account Setup: UK business bank account should be established pre-visa",
    date: "Oct 2025",
    content: "Opening UK business bank account demonstrates commitment and enables transaction documentation. Some banks require visa pre-approval; others allow pre-visa opening.",
    source: "UK Banks",
    category: "Setup"
  },
  {
    id: "49",
    title: "Insurance & Legal: IP and liability insurance policies strengthen applications",
    date: "Current",
    content: "Professional insurance (liability, IP protection) and legal entity setup demonstrate professional business approach. Incorporated company structure preferred.",
    source: "Endorsing Bodies",
    category: "Legal"
  },
  {
    id: "50",
    title: "Annual Review: Innovation Visa requires annual compliance confirmation",
    date: "Current",
    content: "Visa holders must confirm ongoing compliance with innovation requirements annually. Failure to meet conditions could lead to visa revocation.",
    source: "Home Office",
    category: "Compliance"
  },
  {
    id: "51",
    title: "Career Progression: Post-visa employment and career development pathways available",
    date: "Nov 2025",
    content: "Innovation Visa holders can pursue standard employment visas, sponsorship routes, or continue entrepreneur path. Multiple career options available post-visa.",
    source: "Home Office",
    category: "Career"
  },
  {
    id: "52",
    title: "Recent Case Studies: 50+ case studies from approved Innovation Visa applicants now published",
    date: "Oct 2025",
    content: "Home Office published detailed case studies of successful Innovation Visa applications across sectors. Available on official website for reference and learning.",
    source: "Home Office",
    category: "Resources"
  }
];

export default function NewsTicker() {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? NEWS_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === NEWS_ITEMS.length - 1 ? 0 : prev + 1));
  };

  const handleArticleClick = (article: NewsItem) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const importNewsModal = async () => {
    const { default: NewsModal } = await import("./NewsModal");
    return NewsModal;
  };

  return (
    <>
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
                  <button
                    key={item.id}
                    onClick={() => handleArticleClick(item)}
                    className="inline-block px-6 text-sm text-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
                  >
                    {item.title}
                    {idx < NEWS_ITEMS.length - 1 && (
                      <span className="mx-4 text-primary/40">•</span>
                    )}
                  </button>
                ))}
                {/* Duplicate for seamless loop */}
                {NEWS_ITEMS.map((item) => (
                  <button
                    key={`dup-${item.id}`}
                    onClick={() => handleArticleClick(item)}
                    className="inline-block px-6 text-sm text-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
                  >
                    {item.title}
                    <span className="mx-4 text-primary/40">•</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="h-8 w-8"
                data-testid="button-ticker-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="h-8 w-8"
                data-testid="button-ticker-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Article Indicator */}
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {currentIndex + 1} / {NEWS_ITEMS.length} articles
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
            animation: scroll 90s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>

      {/* News Modal */}
      {selectedArticle && (
        <>
          {typeof window !== "undefined" && (
            <div style={{ display: "none" }}>
              <div key="modal-placeholder" />
            </div>
          )}
          <NewsModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            article={selectedArticle}
          />
        </>
      )}
    </>
  );
}
