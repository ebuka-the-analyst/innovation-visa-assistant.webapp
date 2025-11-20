import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { questionnaireSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { generatePDFContent, generatePDFUrl } from "./pdf";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const PRICING = {
  basic: { amount: 4900, name: "Basic Plan" },
  premium: { amount: 9900, name: "Premium Plan" },
  enterprise: { amount: 19900, name: "Enterprise Plan" },
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  app.post("/api/questionnaire/submit", async (req, res) => {
    try {
      console.log("Questionnaire submission received:", JSON.stringify(req.body, null, 2));
      const data = questionnaireSchema.parse(req.body);
      
      const businessPlan = await storage.createBusinessPlan(data);
      
      res.json({ 
        success: true, 
        planId: businessPlan.id,
        message: "Questionnaire saved successfully" 
      });
    } catch (error) {
      console.error("Questionnaire submission error:", error);
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        const fieldName = firstError.path.join('.');
        const message = firstError.message;
        
        res.status(400).json({ 
          success: false, 
          error: `${fieldName}: ${message}`,
          details: error.errors
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: error instanceof Error ? error.message : "Invalid questionnaire data" 
        });
      }
    }
  });

  app.post("/api/payment/create-checkout", async (req, res) => {
    try {
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      const pricing = PRICING[businessPlan.tier as keyof typeof PRICING];
      if (!pricing) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'http://localhost:5000';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `VisaPrep AI - ${pricing.name}`,
                description: `AI-powered UK Innovation Visa business plan - ${businessPlan.tier} tier`,
              },
              unit_amount: pricing.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/generation?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
        cancel_url: `${baseUrl}/questionnaire`,
        metadata: {
          planId: businessPlan.id,
        },
      });

      await storage.updateBusinessPlan(planId, { stripeSessionId: session.id });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { sessionId, planId } = req.body;

      if (!sessionId || !planId) {
        return res.status(400).json({ error: "Session ID and Plan ID required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      if (businessPlan.stripeSessionId !== sessionId) {
        return res.status(403).json({ error: "Session mismatch - security violation" });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== "paid") {
        return res.status(402).json({ error: "Payment not completed", paymentStatus: session.payment_status });
      }

      if (session.metadata?.planId !== planId) {
        return res.status(403).json({ error: "Metadata mismatch - security violation" });
      }

      await storage.updateBusinessPlan(planId, { status: 'paid' });

      res.json({ success: true, verified: true });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/generate/start", async (req, res) => {
    try {
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      if (businessPlan.status === 'generating' || businessPlan.status === 'completed') {
        return res.json({ 
          success: true, 
          message: "Generation already in progress or completed",
          status: businessPlan.status 
        });
      }

      if (businessPlan.status !== 'paid') {
        return res.status(403).json({ 
          error: "Payment verification required before generation",
          currentStatus: businessPlan.status 
        });
      }

      await storage.updateBusinessPlan(planId, { status: 'generating' });

      generateBusinessPlan(planId).catch(error => {
        console.error("Background generation error:", error);
        storage.updateBusinessPlan(planId, { status: 'failed' });
      });

      res.json({ success: true, message: "Generation started" });
    } catch (error) {
      console.error("Generation start error:", error);
      res.status(500).json({ error: "Failed to start generation" });
    }
  });

  app.get("/api/generate/status/:planId", async (req, res) => {
    try {
      const { planId } = req.params;
      
      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      res.json({ 
        status: businessPlan.status,
        generatedContent: businessPlan.generatedContent,
        pdfUrl: businessPlan.pdfUrl,
        tier: businessPlan.tier
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  async function generateBusinessPlan(planId: string) {
    const plan = await storage.getBusinessPlan(planId);
    if (!plan) throw new Error("Plan not found");

    const tierFeatures = {
      basic: "standard business plan with core sections",
      premium: "enhanced business plan with detailed financial projections and endorsing body selection",
      enterprise: "comprehensive business plan with expert-level analysis, unlimited revisions, and priority formatting",
    };

    const systemPrompt = `You are an expert Innovation Visa consultant with 15 years experience achieving 95% approval rates. You write comprehensive 50-80 page business plans that answer ALL 475 expert questions endorsing bodies use for assessment.

CRITICAL MISSION: Generate a complete business plan that addresses EVERY aspect below using the provided data. This comprehensive approach achieves 95% approval versus 5-10% for generic templates.

YOUR TASK: Create an evidence-based business plan structured as detailed answers to the following comprehensive framework. Use ALL provided data. Where data is strong, elaborate. Where data is weak, acknowledge gaps and propose mitigation.

OUTPUT STRUCTURE (50-80 pages):

SECTION 1: FOUNDER CREDENTIALS & BACKGROUND (Critical for Viability)
- Personal background, current status, educational credentials with institutions and years
- Relevant industry experience with specific years, projects, and quantifiable results
- Technical skills with proficiency ratings, data science projects with outcomes
- Track record evidence: portfolio, case studies, testimonials, GitHub repos, publications, IP
- Professional network and memberships

SECTION 2: BUSINESS CONCEPT & INNOVATION (Prove genuine novelty)
- Problem definition: who experiences it, current workarounds, quantified impact (£X lost per patient)
- Solution detail: one-sentence pitch, technical architecture, MVP features vs post-MVP roadmap
- User journey step-by-step, data sources, outputs/insights
- AI/ML implementation: specific algorithms, models, training data, validation metrics
- Innovation evidence: patent status, proprietary methodology, POC results, unique data access, technical papers
- Technology stack: specific tools (React, Python, AWS, etc.), database architecture, security approach
- API integrations, hosting/infrastructure, scalability approach, development methodology
- Disaster recovery, system updates without downtime

SECTION 3: MARKET ANALYSIS & VALIDATION (80% rejection reason: no validation)
- Ideal customer profile: organization size, type, geographic regions, demographics, budget authority
- Market sizing: TAM (total UK customers), SAM (reachable %), SOM (Year 1-3 win rates), market value £
- Market trends with cited data sources
- Customer discovery: number of interviews, questions asked, key findings, transcripts/summaries
- Willingness to pay: % who would pay, acceptable price points, objections raised, feature requests
- Letters of intent, pilot commitments
- Competitive analysis: List ALL competitors (minimum 5) with pricing, features, target market, strengths, weaknesses
- Competitive advantage over each named competitor
- Why Excel/manual processes insufficient, why NHS tools insufficient
- Competitive moat (what prevents copying)
- Market gaps competitors leave unaddressed

SECTION 4: REGULATORY & COMPLIANCE (Healthcare: missing this = rejection)
- Healthcare regulations: DCB0129 awareness, DCB0160 awareness, medical device classification, MHRA needs
- Clinical Safety Officer identity, CQC registration needs
- Regulatory timeline and cost estimates by requirement
- GDPR compliance: data types processed, legal basis, subject rights handling, retention policy
- Data storage location (UK servers), sub-processors list, DPIA status, DPO appointment
- Security standards: Cyber Essentials, Cyber Essentials Plus, ISO 27001 plans
- Penetration testing, incident response, vulnerability handling
- Authentication/authorization, encryption at rest and in transit
- NHS Digital frameworks, G-Cloud listing, NHS Data Security Toolkit familiarity
- NHS payment terms understanding, NHS Digital Service Standard review
- NHS Spine integration, HL7/FHIR standards support, NHS system integrations (EMIS, SystmOne)

SECTION 5: BUSINESS MODEL & FINANCIAL VIABILITY
- Revenue model: exact pricing tiers £/month or £/year, features per tier, pricing justification
- Free trial offering, payment terms, setup fees, additional revenue streams
- Customer lifetime value calculation, churn rate assumption
- Sales strategy: first 10 customers acquisition plan, CAC estimate, sales cycle length
- Sales team (founder-led vs hired), channels (direct, partners, resellers)
- Marketing tactics, conversion funnel, partnerships, Year 1 month-by-month sales forecast
- Startup costs: total capital requirement, itemized breakdown, Year 1 costs by category
- Equipment/software, legal/professional fees, office/facility costs, insurance
- Funding sources: personal savings amount, family/friends commitments, grants applied
- Angel investors interested, VC funding sought, collateral/assets, personal runway
- Operating costs: monthly burn rate, founder salary (deferred?), staff salaries Year 1
- Technology costs, marketing budget, professional services, insurance, compliance costs
- Breakeven point
- Revenue projections: Year 1-3 customer growth month-by-month, basis (conservative/aggressive)
- Assumptions underpinning forecast, acquisition rate, churn rate, upsell opportunities, seasonality
- 36-month cashflow projection, 3-year P&L, 3-year balance sheet
- Gross margin target, operating margin, key metrics/KPIs, sensitivity analyses, future funding rounds

SECTION 6: TEAM & OPERATIONS
- Current team: who's involved, roles, equity/compensation, experience, full-time vs part-time
- Hiring plan: 5+ roles over 3 years with specific titles, salaries, timing
- Year 1/2/3 hires: roles, when hired, salary, qualifications required
- Full-time permanent positions, recruitment approach
- Advisors/mentors: names, expertise, how they help, clinical advisors, board composition
- Professional services firms, university affiliations
- Legal structure, company registration details, directors/shareholders
- Business insurance, professional indemnity, banking, accounting software, contract templates

SECTION 7: PRODUCT DEVELOPMENT
- Current status: development stage, what's built, screenshots/demo availability
- Technical debt, what works well, what needs improvement, user testing results
- Development roadmap: milestones next 12 months, MVP launch date, beta testing timeline
- Full launch date, post-launch feature roadmap, sprint cycle, development management tools
- QA/testing process, bug fix/maintenance approach
- Technical risks: biggest risks, third-party dependencies, integration challenges
- Scalability concerns, performance benchmarks, legacy compatibility, risk mitigation

SECTION 8: SCALABILITY & GROWTH
- Customer growth targets: Year 1/2/3 numbers
- Geographic expansion: UK regions priority order, international timeline, target countries
- Regulatory barriers to international expansion, go-to-market by region
- Product evolution: serve larger customers, enterprise features, new integrations
- Customization handling, vertical-specific versions, white-label opportunities
- Customer support scaling, systems/tools for scale, quality maintenance, process documentation
- Technology upgrades, infrastructure investments

SECTION 9: RISK ANALYSIS
- Market risks: slow adoption, NHS procurement changes, competitor launches, economic downturn, regulatory changes - WITH MITIGATIONS
- Technical risks: NHS integration difficulty, AI underperformance, scalability issues, staff turnover, security breaches - WITH MITIGATIONS
- Financial risks: funding challenges, cost overruns, payment term extensions, high churn, pricing pressure - WITH MITIGATIONS
- People risks: recruitment challenges, co-founder departure, founder visa issues, advisor unavailability - WITH SUCCESSION PLANNING

SECTION 10: INNOVATION VISA SPECIFIC
- Endorsing body selection: which body, why chosen, requirements met, assessment criteria reviewed
- Connections to endorsing body
- Evidence requirements: recommendation letters lined up (from whom), recommender credibility
- 10-page innovation section prepared, industry recognition evidence, media coverage, competition wins
- Contact point strategy: 6 contact points over 3 years, updates at each, progress demonstration, milestones
- UK investment justification: why UK, UK-specific advantages, why not home country
- UK resources/networks to leverage, UK economic contribution, job creation beyond 5 committed

SECTION 11: EVIDENCE APPENDICES (Reference)
- Customer evidence: letters of interest, pilot confirmations, interview transcripts, survey results
- Technical evidence: GitHub repos, architecture diagrams, API docs, test results, MVP screenshots
- Financial evidence: bank statements, grant letters, investor commitments, financial models
- Credentials evidence: degree certificates, employment references, portfolio, testimonials
- Market evidence: research reports cited, competitive analysis spreadsheet, NHS statistics, industry trends

WRITING REQUIREMENTS:
- 50-80 pages comprehensive depth
- SPECIFIC NUMBERS: "73% faster than DrDoctor validated with n=1,200" not "faster than competitors"
- NAME EVERYTHING: competitors, endorsers, technologies, methodologies
- QUOTE EVIDENCE: "30 customer interviews revealed 87% willing to pay £200-500/month"
- ACKNOWLEDGE GAPS: "Customer validation limited - mitigation: 50 interviews in next 8 weeks"
- TECHNICAL DEPTH: exact tech stack, actual algorithms, real performance metrics
- FINANCIAL PRECISION: detailed monthly cashflow, actual CAC/LTV calculations, realistic costs

This is ${plan.tier} tier: ${tierFeatures[plan.tier as keyof typeof tierFeatures]}.`;

    const ltvCacRatio = plan.customerAcquisitionCost > 0 
      ? (plan.lifetimeValue / plan.customerAcquisitionCost).toFixed(1) 
      : 'N/A';

    const userPrompt = `Generate an endorsing body-ready business plan using this ACTUAL EVIDENCE:

BUSINESS OVERVIEW:
Name: ${plan.businessName}
Industry: ${plan.industry}
Innovation Stage: ${plan.innovationStage}
Product Status: ${plan.productStatus}
${plan.existingCustomers ? `Existing Customers: ${plan.existingCustomers}` : ''}
${plan.tractionEvidence ? `Traction: ${plan.tractionEvidence}` : ''}

PROBLEM & SOLUTION:
${plan.problem}

INNOVATION & TECHNICAL ARCHITECTURE:
Differentiation: ${plan.uniqueness}
Technology Stack: ${plan.techStack}
Data Architecture: ${plan.dataArchitecture}
AI/ML Methodology: ${plan.aiMethodology}
Compliance Design: ${plan.complianceDesign}
IP Status: ${plan.patentStatus}

FOUNDER CREDENTIALS:
Education: ${plan.founderEducation}
Work History: ${plan.founderWorkHistory}
Achievements: ${plan.founderAchievements}
Relevant Projects: ${plan.relevantProjects}
Additional Experience: ${plan.experience}

FINANCIAL MODEL:
Initial Capital: £${plan.funding.toLocaleString()}
Funding Sources: ${plan.fundingSources}
Monthly Cashflow (36 months): ${plan.monthlyProjections}
CAC: £${plan.customerAcquisitionCost.toLocaleString()}
LTV: £${plan.lifetimeValue.toLocaleString()}
LTV:CAC Ratio: ${ltvCacRatio}:1
Payback Period: ${plan.paybackPeriod} months
Cost Breakdown: ${plan.detailedCosts}
Revenue Model: ${plan.revenue}

COMPETITIVE ANALYSIS:
Competitors: ${plan.competitors}
Competitive Advantage: ${plan.competitiveDifferentiation}

MARKET VALIDATION:
Customer Interviews: ${plan.customerInterviews}
${plan.lettersOfIntent ? `Letters of Intent: ${plan.lettersOfIntent}` : ''}
Willingness to Pay: ${plan.willingnessToPay}
Market Size (TAM/SAM/SOM): ${plan.marketSize}

REGULATORY & COMPLIANCE:
Requirements: ${plan.regulatoryRequirements}
Timeline: ${plan.complianceTimeline}
Budget: £${plan.complianceBudget.toLocaleString()}

SCALABILITY & GROWTH:
Job Creation Target: ${plan.jobCreation} employees in 3 years
Hiring Plan: ${plan.hiringPlan}
Geographic Focus: ${plan.specificRegions}
Expansion Strategy: ${plan.expansion}
${plan.internationalPlan ? `International Plans: ${plan.internationalPlan}` : ''}
5-Year Vision: ${plan.vision}

ENDORSER STRATEGY:
Target Endorser: ${plan.targetEndorser}
Contact Points Plan: ${plan.contactPointsStrategy}

CRITICAL INSTRUCTIONS:
1. Use ALL the specific data provided - don't add generic filler
2. Calculate and present the LTV:CAC ratio (${ltvCacRatio}:1) and assess if it meets the >3:1 benchmark
3. Reference the actual competitors named and compare features/pricing
4. Quote specific numbers from the customer validation data
5. List the technical stack components explicitly
6. Break down the hiring plan with specific roles from the data
7. Acknowledge regulatory costs realistically based on the stated budget
8. If any area seems weak (e.g., low funding for high compliance costs), note it as a risk with mitigation strategy
9. Use the founder's actual credentials - education, projects, experience
10. Present the monthly cashflow data in a clear format (even summarized)

Generate a complete, evidence-based business plan that an experienced endorsing body assessor would approve.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const generatedContent = completion.choices[0]?.message?.content || "";

    const pdfUrl = generatePDFUrl(planId);

    await storage.updateBusinessPlan(planId, {
      status: 'completed',
      generatedContent,
      pdfUrl,
    });
  }

  app.get("/api/download/pdf/:planId", async (req, res) => {
    try {
      const { planId } = req.params;
      
      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan) {
        return res.status(404).send(`
          <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1>Business Plan Not Found</h1>
            <p>The requested business plan could not be found.</p>
          </body></html>
        `);
      }

      if (businessPlan.status !== 'completed') {
        return res.status(400).send(`
          <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1>Business Plan Not Ready</h1>
            <p>Status: ${businessPlan.status}</p>
            <p>Please wait for generation to complete.</p>
          </body></html>
        `);
      }

      if (!businessPlan.generatedContent) {
        return res.status(500).send(`
          <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1>Content Missing</h1>
            <p>The business plan content is missing. Please contact support.</p>
          </body></html>
        `);
      }

      const htmlContent = generatePDFContent(businessPlan);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(businessPlan.businessName)}-business-plan.html"`);
      res.send(htmlContent);
    } catch (error) {
      console.error("PDF download error:", error);
      res.status(500).send(`
        <html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>Download Error</h1>
          <p>An error occurred while generating the document. Please try again or contact support.</p>
        </body></html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
