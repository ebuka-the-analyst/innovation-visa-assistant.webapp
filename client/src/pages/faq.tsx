import { SEOHead } from "@/components/SEOHead";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { createFAQSchema } from "@/lib/seo-schemas";

const faqs = [
  {
    category: "Visa Basics",
    questions: [
      {
        q: "What is the UK Innovator Founder Visa?",
        a: "The UK Innovator Founder Visa is a visa route for experienced businesspeople seeking to establish an innovative, viable and scalable business in the UK. It replaced the Innovator visa in April 2023 and requires endorsement from an approved endorsing body. The visa is initially granted for 3 years and can lead to settlement (indefinite leave to remain) after 3 years if specific criteria are met."
      },
      {
        q: "What are the key requirements for the Innovator Founder Visa?",
        a: "Key requirements include: (1) A genuine, innovative business idea that is viable and scalable. (2) Endorsement from an approved endorsing body confirming your business meets innovation, viability, and scalability criteria. (3) Access to sufficient funds to establish and run your business (no fixed minimum amount required). (4) English language proficiency at B2 level (CEFR). (5) Sufficient maintenance funds (£1,270 for 28 consecutive days). (6) Intent to work only on your endorsed business."
      },
      {
        q: "How much does the UK Innovator Founder Visa cost?",
        a: "The visa application fee is £1,191 if applying from outside the UK or £1,486 if applying from within the UK. You'll also need to pay the Immigration Health Surcharge (IHS) of £1,035 per year (£3,105 for 3 years). Additionally, budget for endorsement body fees (typically £1,000-£3,000), legal fees if using immigration lawyers (£2,000-£5,000), and business setup costs."
      },
      {
        q: "How long does it take to get the Innovator Founder Visa?",
        a: "Processing times vary: applications from outside the UK typically take 3 weeks, while applications from within the UK take about 8 weeks. However, the total timeline is longer when you include endorsement preparation (4-12 weeks), which must be obtained before applying for the visa. Priority and super-priority services are available for faster processing at additional cost."
      }
    ]
  },
  {
    category: "Endorsement Process",
    questions: [
      {
        q: "What is an endorsing body and how do I choose one?",
        a: "An endorsing body is a UK organization approved by the Home Office to assess whether your business idea meets the innovation, viability, and scalability requirements. Examples include Tech Nation (for digital technology), The Global Entrepreneurs Programme, and Innovator International. Choose based on your industry sector, their endorsement success rate, support services offered, and fee structure. Each body has specific expertise and assessment criteria."
      },
      {
        q: "What does 'innovative' mean for the visa requirements?",
        a: "Innovation means your business idea must have a genuine point of difference from existing market offerings. It doesn't need to be world-first invention - it can be an innovative application of existing technology, a unique business model, or a novel approach to an existing market. The key is demonstrating how your innovation creates competitive advantage and meets genuine market needs."
      },
      {
        q: "What does 'viable' mean for the visa requirements?",
        a: "Viability means your business has realistic potential for success based on your skills, experience, market conditions, and financial projections. You must demonstrate: (1) Understanding of your target market and customer base. (2) Realistic revenue and cost projections. (3) Clear path to profitability. (4) Your ability to execute the business plan. (5) Evidence of market research and validation."
      },
      {
        q: "What does 'scalable' mean for the visa requirements?",
        a: "Scalability means your business has potential for significant growth in employment and revenue. You must show: (1) Plans to create jobs in the UK (ideally skilled roles). (2) Potential to expand into new markets or customer segments. (3) Business model that can grow without proportional cost increases. (4) Strategy for scaling operations, sales, and marketing. (5) Realistic growth projections over 3-5 years."
      },
      {
        q: "How many times can I reapply if my endorsement is rejected?",
        a: "There is no limit to the number of times you can apply for endorsement. However, each application requires paying the endorsement fee again (typically £1,000-£3,000). If rejected, carefully review the feedback provided, address all concerns raised, strengthen your business plan, and consider getting professional help before reapplying. Most bodies allow reapplication immediately, though some may require a cooling-off period."
      }
    ]
  },
  {
    category: "Business Requirements",
    questions: [
      {
        q: "Is there a minimum investment amount required?",
        a: "No, the Innovator Founder Visa (since April 2023) has NO fixed minimum investment requirement. Unlike the previous Innovator visa which required £50,000, you now only need to demonstrate sufficient funds to establish and operate your business as outlined in your business plan. The endorsing body will assess whether your funding is realistic for your specific business. You must still show £1,270 in personal maintenance funds held for 28 consecutive days."
      },
      {
        q: "Can I work for another company while on the Innovator Founder Visa?",
        a: "No, you cannot take employment with another company. You can only work on the business (or businesses) you've been endorsed for. However, you can: (1) Be a director of multiple companies if all are endorsed. (2) Invest in other UK businesses as a passive investor. (3) Work as a consultant/contractor through your endorsed business. (4) Supplement income through dividends from your business."
      },
      {
        q: "Can I start any type of business with this visa?",
        a: "Your business must meet specific criteria: (1) It must be innovative, viable, and scalable. (2) It cannot be in sectors excluded by your endorsing body. (3) It must align with your endorsing body's expertise area. (4) It cannot be primarily property investment or development. Common successful sectors include: technology/software, healthcare innovation, clean energy, advanced manufacturing, creative industries, and professional services with innovative approaches."
      },
      {
        q: "What happens if my business fails?",
        a: "If your endorsed business fails, you may face challenges with visa extension or settlement. Options include: (1) Pivot to a new business idea and seek fresh endorsement. (2) Switch to a different visa category if eligible. (3) Demonstrate you made genuine efforts to make the business succeed. The Home Office understands some businesses fail, but you must show you acted in good faith and met reporting requirements. Keep detailed records of all business activities."
      }
    ]
  },
  {
    category: "Financial Planning",
    questions: [
      {
        q: "What financial documents do I need to provide?",
        a: "Key financial documents include: (1) Bank statements showing sufficient investment funds for your business plan held for 28+ days. (2) Maintenance funds evidence (£1,270 for 28 days). (3) Financial projections for 3-5 years. (4) Evidence of funding sources (savings, investment agreements, grants). (5) Business plan with detailed budget. (6) Personal bank statements. (7) Tax returns if applicable. All documents must be in English or professionally translated."
      },
      {
        q: "Can I use investor funds instead of my own money?",
        a: "Yes, you can use third-party investment to fund your business. Investment can come from: (1) Angel investors or venture capital. (2) UK government grants. (3) Peer-to-peer lending platforms. (4) Corporate investment. (5) Friends and family. You must provide: investment agreements, proof funds are available, confirmation they're for your specific business, and evidence the investor is legitimate. The endorsing body will assess whether the investment is realistic for your business plan."
      },
      {
        q: "How should I structure my financial projections?",
        a: "Effective financial projections should include: (1) Monthly cash flow for year 1, quarterly for years 2-3. (2) Revenue projections with clear assumptions. (3) Detailed cost breakdown (staff, marketing, operations). (4) Break-even analysis. (5) Funding requirements and use of funds. (6) Key financial metrics (gross margin, customer acquisition cost, lifetime value). (7) Scenario planning (best case, base case, worst case). Be conservative and ensure all assumptions are backed by market research."
      }
    ]
  },
  {
    category: "Settlement & Extensions",
    questions: [
      {
        q: "When can I apply for Indefinite Leave to Remain (ILR)?",
        a: "You can apply for ILR after 3 years on the Innovator Founder Visa if you meet at least 2 of 7 criteria: (1) £50,000+ invested in business and actively trading. (2) Customers doubled in last 3 years (minimum 10). (3) Significant research/development in UK. (4) £1M+ revenue in last year. (5) £500,000+ revenue with £100,000+ exports. (6) 10+ full-time UK jobs created. (7) 5+ jobs with £25,000+ salary each. You must also maintain endorsement and meet continuous residence requirements."
      },
      {
        q: "How do I extend my Innovator Founder Visa?",
        a: "To extend your visa, you need: (1) Fresh endorsement from an approved body (can be different from original). (2) Evidence your business is making progress. (3) Continued compliance with visa conditions. (4) Meeting financial requirements. (5) English language and maintenance funds. Extensions are granted for 3 years at a time. You must demonstrate continued business viability and progress toward your original business plan."
      },
      {
        q: "Can my family join me on this visa?",
        a: "Yes, you can bring: (1) Your spouse or civil partner. (2) Unmarried partner (if you've lived together for 2+ years). (3) Children under 18. Family members must apply for dependant visas, which have separate fees (£1,191 from outside UK, £1,486 from within UK) plus IHS. Dependants can work and study in the UK without restrictions. They can apply for ILR at the same time as you if they meet the residence requirements."
      }
    ]
  },
  {
    category: "Common Challenges",
    questions: [
      {
        q: "What are the most common reasons for endorsement rejection?",
        a: "Common rejection reasons include: (1) Business idea not sufficiently innovative or differentiated. (2) Weak market research or unclear target market. (3) Unrealistic financial projections. (4) Lack of scalability potential. (5) Insufficient evidence of applicant's skills/experience. (6) Poor quality business plan. (7) Unclear job creation plans. (8) Missing or inadequate supporting evidence. To avoid rejection: research thoroughly, get professional help, provide comprehensive evidence, and ensure your plan is realistic and well-structured."
      },
      {
        q: "How can I prove my business idea is innovative?",
        a: "Demonstrate innovation through: (1) Competitor analysis showing your unique differentiators. (2) Intellectual property (patents, trademarks, copyrights). (3) Unique technology or methodology. (4) Novel business model or revenue streams. (5) Market validation (customer feedback, pilot results). (6) Expert testimonials. (7) Awards or recognition. (8) Evidence of problem-solving capability. Remember: innovation can be incremental - you don't need a world-first invention, just a genuine point of difference."
      },
      {
        q: "What if I don't have tech or business experience?",
        a: "While relevant experience helps, it's not strictly required. You can demonstrate capability through: (1) Transferable skills from your career. (2) Advisory board or co-founders with relevant expertise. (3) Industry research and self-education. (4) Pilot projects or proof of concept. (5) Hiring key staff with necessary skills. (6) Professional development courses. (7) Mentorship arrangements. Focus on showing you understand the business, have a realistic plan, and can execute with available resources."
      }
    ]
  }
];

export default function FAQ() {
  const faqSchemaData = faqs.flatMap(category => 
    category.questions.map(q => ({ question: q.q, answer: q.a }))
  );

  return (
    <>
      <SEOHead
        title="UK Innovator Founder Visa FAQ | Common Questions Answered"
        description="Get answers to 25+ frequently asked questions about the UK Innovator Founder Visa. Expert guidance on endorsement, requirements, costs, timeline, and settlement."
        path="/faq"
        schemas={[createFAQSchema(faqSchemaData)]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
          <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl font-bold mb-4">
                UK Innovator Founder Visa
                <span className="block text-primary mt-2">Frequently Asked Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Expert answers to your most important questions about the UK Innovator Founder Visa process, requirements, and timeline.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <Card key={idx} data-testid={`faq-category-${idx}`}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} data-testid={`faq-item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-left font-semibold hover:text-primary">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get started with our 100+ professional-level tools designed to guide you through every step of your UK Innovator Founder Visa application.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/tools-hub">
                  <Button size="lg" data-testid="button-explore-tools">
                    Explore All Tools
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" data-testid="button-get-started">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
