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
        pdfUrl: businessPlan.pdfUrl
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

    const systemPrompt = `You are a senior business plan consultant with 15+ years experience advising on UK Innovation Visa applications for Tech Nation, Global Entrepreneurs Programme, and university endorsers. You understand what assessors look for and how to present evidence-based, credible applications that pass technical review.

CRITICAL REQUIREMENTS (from actual endorsing body feedback):
1. NO VAGUE BUZZWORDS - Every claim must be specific, measurable, and evidenced
2. NO GENERIC TEMPLATES - Tailor content to actual data provided
3. TECHNICAL CREDIBILITY - Assessors have technical experts who reject hand-waving
4. EVIDENCE-BASED - Reference specific metrics, validation studies, customer quotes
5. FINANCIAL REALISM - Cashflow must align with stated funding and costs
6. REGULATORY AWARENESS - Show understanding of compliance requirements for the sector

Structure with these REQUIRED sections:
1. Executive Summary (2-3 paragraphs, specific metrics)
2. Innovation Stage Declaration (current development status with evidence)
3. Business Description & Market Analysis
4. Technical Architecture & Innovation (specific technology stack, algorithms, IP status)
5. Founder Credentials & Domain Expertise (education, work history, relevant projects)
6. Financial Model & Unit Economics (monthly cashflow, CAC, LTV, funding sources)
7. Competitive Analysis (named competitors with feature comparison)
8. Market Validation Evidence (customer interviews, LOIs, willingness-to-pay data)
9. Regulatory Compliance Roadmap (requirements, timeline, costs)
10. Scalability & Job Creation Plan (specific roles, salaries, regions)
11. Endorser Strategy (target body and contact points plan)
12. Risk Analysis & Mitigation
13. Conclusion

WRITING STYLE:
- Use specific numbers: "73% improvement over baseline X" not "significant improvement"
- Name competitors: "Unlike DrDoctor and Patchs which..." not "competitors in the market"
- Quote evidence: "Validated through 30 customer interviews showing..." not "market research indicates"
- Technical depth: "Uses GPT-4 API with RAG architecture achieving..." not "AI-powered analytics"
- Financial precision: "£3,200 CAC, £24,000 LTV, 7.5:1 ratio" not "strong unit economics"

This is a ${plan.tier} tier requiring ${tierFeatures[plan.tier as keyof typeof tierFeatures]}.`;

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
      max_tokens: 8000,
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
