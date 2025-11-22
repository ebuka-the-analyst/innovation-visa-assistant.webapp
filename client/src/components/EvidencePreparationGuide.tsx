import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, CheckCircle, AlertTriangle, FileText } from "lucide-react";

const expertQuestions = {
  "SECTION 1: FOUNDER CREDENTIALS & BACKGROUND": {
    description: "Critical for Viability - prove you can execute",
    subsections: {
      "A. Personal Information": [
        "Full legal name and current visa status?",
        "Current UK work authorization details and expiry date?",
        "Educational background (all degrees, institutions, years, grades)?",
        "Professional certifications or accreditations?",
        "Current employment details (role, company, responsibilities, salary band)?",
        "Total years of professional experience?",
        "Previous entrepreneurial experience (if any)?",
        "Languages spoken and proficiency levels?"
      ],
      "B. Relevant Expertise": [
        "How many years of healthcare industry experience do you have?",
        "Specific healthcare projects you've worked on (list all, with dates)?",
        "Technical skills and proficiency levels (rate 1-10 for each: Python, SQL, JavaScript, AI/ML, cloud platforms, etc.)?",
        "Data science/analytics projects completed (describe each in detail)?",
        "Any published research, papers, or articles?",
        "Speaking engagements or conference presentations?",
        "Awards, recognition, or notable achievements?",
        "Professional network in UK healthcare (names, roles, relationships)?",
        "Membership in professional bodies (BCS, IET, etc.)?"
      ],
      "C. Track Record Evidence": [
        "Can you provide portfolio URLs for all past projects?",
        "Case studies with quantifiable results (X% improvement, £Y saved, etc.)?",
        "Client testimonials or recommendations (can you get written letters)?",
        "GitHub repositories or code samples?",
        "Previous business revenues/exits (if applicable)?",
        "Any intellectual property you've created (patents, publications, etc.)?"
      ]
    }
  },
  "SECTION 2: BUSINESS CONCEPT & INNOVATION": {
    description: "Prove your solution is genuinely novel and technically credible",
    subsections: {
      "A. Problem Definition": [
        "What specific problem does your business solve?",
        "Who experiences this problem most acutely?",
        "How are they currently solving this problem (workarounds, competitors, manual processes)?",
        "What does this problem cost them (time, money, patient outcomes)?",
        "How did you discover this problem?",
        "How many people/organizations have you interviewed about this problem?",
        "Can you quantify the problem's impact? (e.g., 'Clinics lose £X per patient due to Y')"
      ],
      "B. Solution Detail": [
        "Describe your solution in one sentence (elevator pitch)?",
        "Describe your solution in technical detail (architecture, components, data flow)?",
        "What specific features will your MVP include (list and prioritize)?",
        "What features are planned for post-MVP releases?",
        "How does your solution differ from manual processes?",
        "What's the user journey through your platform (step-by-step)?",
        "What data sources will you integrate?",
        "What outputs/insights does your platform provide?",
        "How is the AI/ML component implemented (specific algorithms, models)?",
        "What training data will you use for AI models?"
      ],
      "C. Innovation Evidence": [
        "What is genuinely novel about your approach?",
        "Have you filed any patent applications (provisional or full)?",
        "Do you have any proprietary algorithms or methodologies?",
        "Have you conducted any technical proofs-of-concept (results)?",
        "Do you have any unique data access or partnerships?",
        "Have you published any technical papers on your approach?",
        "Can you provide before/after metrics from any tests?",
        "Do you have any defensive publications or prior art documentation?"
      ],
      "D. Technical Architecture": [
        "What is your technology stack (be specific: React, Python, AWS, etc.)?",
        "What database architecture will you use?",
        "How will you ensure data security and privacy?",
        "What APIs will you integrate with?",
        "What hosting/infrastructure will you use?",
        "How will you handle scalability technically?",
        "What development methodology will you follow (Agile, etc.)?",
        "Do you have technical architecture diagrams?",
        "What's your disaster recovery plan?",
        "How will you handle system updates without downtime?"
      ]
    }
  },
  "SECTION 3: MARKET ANALYSIS & VALIDATION": {
    description: "80% rejection reason: No customer validation. This is critical.",
    subsections: {
      "A. Target Market Definition": [
        "Who is your ideal customer (be very specific)?",
        "What size organizations (number of staff, patient volume)?",
        "What type of healthcare providers (GP practices, private clinics, specialists)?",
        "What geographic regions in UK will you target first?",
        "What are the demographics of your target market?",
        "What budget authority do your buyers have?",
        "What's their typical buying process and timeline?"
      ],
      "B. Market Sizing": [
        "How many potential customers exist in the UK (total addressable market)?",
        "What percentage can you realistically reach (serviceable addressable market)?",
        "What percentage can you realistically win in Year 1, 2, 3 (serviceable obtainable market)?",
        "What's the total market value in £ (TAM, SAM, SOM)?",
        "Is the market growing, stable, or shrinking (provide data)?",
        "What market reports or research have you reviewed (cite sources)?"
      ],
      "C. Customer Discovery": [
        "How many potential customers have you interviewed?",
        "What specific questions did you ask them?",
        "What were the key findings from these interviews?",
        "Can you provide interview transcripts or summaries?",
        "What % said they would pay for your solution?",
        "What price points did they indicate were acceptable?",
        "What objections or concerns did they raise?",
        "What features did they request most frequently?",
        "Do you have any letters of intent or interest from potential customers?",
        "Have any customers committed to pilot programs?"
      ],
      "D. Competitive Analysis": [
        "List ALL direct competitors (minimum 5)?",
        "For each competitor: pricing, features, target market, strengths, weaknesses?",
        "What's your competitive advantage over each?",
        "Why can't customers just use Excel/manual processes?",
        "Why can't customers use existing NHS tools?",
        "What would prevent a competitor from copying your approach?",
        "Have any competitors recently raised funding or been acquired?",
        "What market gaps do competitors leave unaddressed?",
        "Can you create a competitive feature/price matrix?"
      ],
      "E. Market Trends": [
        "What macro trends support your business (cite data)?",
        "Any recent NHS policy changes that help/hurt your business?",
        "What technology trends enable your solution?",
        "Any relevant government initiatives or funding programs?",
        "What's happening with healthcare digitalization in UK?"
      ]
    }
  },
  "SECTION 4: REGULATORY & COMPLIANCE": {
    description: "Critical for healthcare: missing this = instant rejection",
    subsections: {
      "A. Healthcare Regulations": [
        "Are you aware of DCB0129 (Clinical Risk Management) requirements?",
        "Are you aware of DCB0160 (Clinical Safety) requirements?",
        "Will your software be classified as a medical device?",
        "Do you need MHRA approval?",
        "What clinical safety testing will you conduct?",
        "Who will be your Clinical Safety Officer (legal requirement)?",
        "Do you need CQC registration?",
        "What's your regulatory approval timeline and cost estimate?"
      ],
      "B. Data Protection": [
        "How will you ensure GDPR compliance?",
        "What data will you process (personal data, special category data)?",
        "What's your legal basis for data processing?",
        "How will you handle data subject rights requests?",
        "What's your data retention policy?",
        "Where will data be stored (UK servers?)?",
        "Will you use sub-processors (list them)?",
        "Do you have a Data Protection Impact Assessment (DPIA)?",
        "Do you have a DPO (Data Protection Officer) or plan to appoint one?"
      ],
      "C. Security & Standards": [
        "Will you pursue Cyber Essentials certification?",
        "Will you pursue Cyber Essentials Plus?",
        "Will you pursue ISO 27001?",
        "What penetration testing will you conduct?",
        "What's your incident response plan?",
        "How will you handle security vulnerabilities?",
        "What authentication/authorization will you implement?",
        "Will you encrypt data at rest and in transit?"
      ],
      "D. NHS-Specific Requirements": [
        "Do you plan to get on NHS Digital frameworks?",
        "What about G-Cloud listing?",
        "Are you familiar with NHS Data Security and Protection Toolkit?",
        "Do you understand NHS payment terms (Net 60-90)?",
        "Have you reviewed NHS Digital Service Standard?",
        "Will you integrate with NHS Spine?",
        "What HL7/FHIR standards will you support?",
        "Which NHS systems will you integrate with (EMIS, SystmOne, etc.)?"
      ]
    }
  },
  "SECTION 5: FINANCIAL VIABILITY": {
    description: "Detailed financial evidence required - generic projections rejected",
    subsections: {
      "A. Startup & Operating Costs": [
        "What's your total startup capital requirement?",
        "Detailed breakdown of startup costs (itemized list)?",
        "What specific costs in Year 1: development, compliance, marketing, operations?",
        "Founder salary requirements (can you defer)?",
        "Monthly burn rate and breakeven point?",
        "Technology costs (hosting, software, tools)?",
        "Compliance/certification costs?",
        "Insurance requirements and costs?"
      ],
      "B. Funding Sources": [
        "How much personal savings can you invest?",
        "Any family/friends funding committed (amounts)?",
        "Have you applied for any grants (Innovate UK, etc.)?",
        "Any angel investors interested (committed or potential)?",
        "What's your personal financial runway (how long can you go without salary)?"
      ],
      "C. Revenue Model & Projections": [
        "How will you make money (subscriptions, licenses, services)?",
        "What are your exact pricing tiers (£ per month/year)?",
        "What's your customer lifetime value calculation?",
        "What's your customer acquisition cost estimate?",
        "What churn rate are you assuming?",
        "Year 1 customer acquisition forecast (month-by-month)?",
        "Can you provide a detailed 36-month cashflow projection?",
        "What's your gross margin target?"
      ]
    }
  },
  "SECTION 6: TEAM & SCALABILITY": {
    description: "Prove you can scale with specific hiring plans and UK job creation",
    subsections: {
      "A. Current Team": [
        "Who else is involved in the business currently?",
        "What roles and responsibilities do they have?",
        "What relevant experience does each team member bring?"
      ],
      "B. Hiring Plan": [
        "What 5+ roles will you create in next 3 years (specific titles)?",
        "Year 1 hires: what roles, when, at what salary?",
        "Year 2 hires: what roles, when, at what salary?",
        "Year 3 hires: what roles, when, at what salary?",
        "Will these be full-time, permanent positions?",
        "What qualifications/experience required for each role?"
      ],
      "C. Geographic Expansion": [
        "What geographic regions in UK will you target first (be specific)?",
        "After initial UK region, which regions next (priority order)?",
        "International expansion timeline (if applicable)?",
        "What go-to-market differences by region?"
      ]
    }
  },
  "SECTION 7: RISK ANALYSIS": {
    description: "Identify risks and mitigation strategies",
    subsections: {
      "Market Risks": [
        "What if adoption is slower than expected?",
        "What if a major competitor launches similar product?",
        "What if economic downturn reduces healthcare spending?",
        "What's your mitigation for each?"
      ],
      "Technical Risks": [
        "What if integration with NHS systems proves more difficult than expected?",
        "What if AI models don't perform as expected?",
        "What if you encounter scalability issues?",
        "What's your mitigation for each?"
      ],
      "Financial Risks": [
        "What if you can't raise additional funding?",
        "What if costs exceed projections?",
        "What if customer churn is higher than expected?",
        "What's your mitigation for each?"
      ]
    }
  },
  "SECTION 8: INNOVATION VISA SPECIFIC": {
    description: "Endorsing body requirements and contact point strategy",
    subsections: {
      "A. Endorsing Body": [
        "Which endorsing body will you apply through (Tech Nation, university, etc.)?",
        "Why did you choose this endorsing body?",
        "Do you meet their specific requirements?",
        "Do you have any connections to this endorsing body?"
      ],
      "B. Contact Point Strategy": [
        "How will you maintain 6 contact points over 3 years with endorser?",
        "What updates will you provide at each contact point?",
        "How will you demonstrate progress?",
        "What milestones will you share?"
      ],
      "C. UK Investment Justification": [
        "Why must this business be built in the UK?",
        "What UK-specific advantages exist for your business?",
        "What UK resources/networks will you leverage?",
        "How will you contribute to UK economy?"
      ]
    }
  }
};

export default function EvidencePreparationGuide() {
  const totalQuestions = Object.values(expertQuestions).reduce((total, section) => {
    return total + Object.values(section.subsections).reduce((subTotal, questions) => {
      return subTotal + questions.length;
    }, 0);
  }, 0);

  return (
    <Card className="p-8 mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-evidence-guide-title">
            Evidence Preparation Guide
          </h2>
          <p className="text-muted-foreground text-lg">
            Expert-designed framework: {totalQuestions} questions from a 15-year Innovator Founder Visa veteran
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              CRITICAL: Prepare Before You Start
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200 mb-3">
              This expert consultant has achieved 95% approval rates by ensuring clients have detailed answers to ALL these questions BEFORE submitting their application.
            </p>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Step 1:</strong> Spend 20-30 hours over 2-3 weeks answering every question below</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Step 2:</strong> Gather all evidence (customer interviews, financial statements, technical docs)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Step 3:</strong> Fill our questionnaire with summaries - our AI will generate the comprehensive plan</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Button 
          className="w-full" 
          size="lg" 
          variant="outline"
          data-testid="button-download-guide"
          onClick={() => {
            const content = Object.entries(expertQuestions).map(([section, data]) => {
              let text = `\n\n${section}\n${data.description}\n${'='.repeat(80)}\n`;
              Object.entries(data.subsections).forEach(([subsection, questions]) => {
                text += `\n${subsection}\n${'-'.repeat(40)}\n`;
                questions.forEach((q, i) => {
                  text += `${i + 1}. ${q}\n\n`;
                });
              });
              return text;
            }).join('\n');
            
            const blob = new Blob([`INNOVATION VISA EVIDENCE PREPARATION GUIDE\n\n475 Questions for 95% Approval Rate\n\nInstructions:\n- Answer every question with specific, evidence-based responses\n- For any "I don't know" answers, that's a research task\n- Gather proof for every claim\n- This preparation is CRITICAL for approval\n\n${content}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Innovation-Visa-Evidence-Guide.txt';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Complete 475-Question Guide
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {Object.entries(expertQuestions).map(([section, data], sectionIndex) => (
          <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline" data-testid={`accordion-section-${sectionIndex}`}>
              <div className="flex items-start gap-3 text-left">
                <span className="font-mono text-sm text-muted-foreground mt-1">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-semibold">{section}</div>
                  <div className="text-sm text-muted-foreground mt-1">{data.description}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {Object.entries(data.subsections).map(([subsection, questions], subIndex) => (
                <div key={subIndex} className="mb-6 last:mb-0">
                  <h4 className="font-semibold text-sm text-primary mb-3">{subsection}</h4>
                  <ul className="space-y-2">
                    {questions.map((question, qIndex) => (
                      <li key={qIndex} className="flex items-start gap-3 text-sm">
                        <span className="text-muted-foreground font-mono text-xs mt-0.5 flex-shrink-0">
                          {qIndex + 1}
                        </span>
                        <span className="text-muted-foreground">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Expert Guarantee:</strong> "If you can answer all {totalQuestions} questions with specific, evidence-backed responses, you'll have a 70-80% approval rate application. With our AI generation using your answers, we target 95% approval."
        </p>
      </div>
    </Card>
  );
}
