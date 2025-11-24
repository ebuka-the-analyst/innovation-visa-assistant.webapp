import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { questionnaireSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { generatePDFContent, generatePDFUrl } from "./pdf";
import { z } from "zod";
import { getLatestNews, generateBreakingNews } from "./newsService";
import chatRouter from "./chatRoutes";
import crypto from "crypto";
import { setupAuth, isAuthenticated, requireAdmin } from "./auth";
import { sendPaymentReceiptEmail, sendPasswordResetEmail, generateVerificationToken, getResetTokenExpiry } from "./email";
import bcrypt from "bcrypt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const PRICING = {
  basic: { amount: 1900, name: "Basic Plan" },
  premium: { amount: 3900, name: "Premium Plan" },
  enterprise: { amount: 7900, name: "Enterprise Plan" },
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google OAuth authentication (must be before routes)
  await setupAuth(app);

  // Auth endpoint - user object already includes all fields from Google OAuth
  // No need to fetch from database again since it's already in req.user

  // Password Reset Flow
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      // Always return success to prevent email enumeration attacks
      const user = await storage.getUserByEmail(email.toLowerCase());
      
      if (user) {
        // Generate reset token (1 hour expiry)
        const resetToken = generateVerificationToken();
        const tokenExpiry = getResetTokenExpiry();

        await storage.updateResetToken(user.id, resetToken, tokenExpiry);

        // Send password reset email
        await sendPasswordResetEmail(
          user.email!,
          user.firstName || "User",
          resetToken
        );
      }

      // Always return success message (security best practice)
      res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive password reset instructions." 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.get("/api/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpiry) {
        return res.json({ valid: false, message: "Invalid reset token" });
      }

      // Check if token is expired
      if (new Date() > user.resetTokenExpiry) {
        await storage.clearResetToken(user.id);
        return res.json({ valid: false, message: "Reset token has expired" });
      }

      res.json({ 
        valid: true, 
        email: user.email 
      });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify token" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Reset token is required" });
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpiry) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (new Date() > user.resetTokenExpiry) {
        await storage.clearResetToken(user.id);
        return res.status(400).json({ error: "Reset token has expired. Please request a new one." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await storage.updatePassword(user.id, hashedPassword);
      await storage.clearResetToken(user.id);

      res.json({ 
        success: true, 
        message: "Password reset successful. You can now log in with your new password." 
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/dashboard/plans", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      
      // Fetch both user's own plans AND demo plans
      const [userPlans, demoPlans] = await Promise.all([
        storage.getUserBusinessPlans(userId),
        storage.getDemoBusinessPlans(),
      ]);
      
      // Combine user plans with demo plans (user plans first)
      const allPlans = [...userPlans, ...demoPlans];
      
      res.json(allPlans);
    } catch (error) {
      console.error("Dashboard plans error:", error);
      res.status(500).json({ error: "Failed to fetch business plans" });
    }
  });
  
  app.post("/api/questionnaire/submit", isAuthenticated, async (req, res) => {
    try {
      console.log("Questionnaire submission received:", JSON.stringify(req.body, null, 2));
      const data = questionnaireSchema.parse(req.body);
      const user = req.user as any;
      const userId = user.id;
      
      const businessPlan = await storage.createBusinessPlan({
        ...data,
        userId,
      });
      
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

  app.post("/api/payment/create-checkout", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.body;
      const user = req.user as any;
      
      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan || businessPlan.userId !== user.id) {
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
                name: `Innovator Founder Visa Assistant - ${pricing.name}`,
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

  app.post("/api/payment/verify", isAuthenticated, async (req, res) => {
    try {
      const { sessionId, planId } = req.body;
      const user = req.user as any;

      if (!sessionId || !planId) {
        return res.status(400).json({ error: "Session ID and Plan ID required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan || businessPlan.userId !== user.id) {
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

      // Send payment receipt email
      try {
        const fullUser = await storage.getUser(user.id);
        if (fullUser && fullUser.email) {
          const pricing = PRICING[businessPlan.tier as keyof typeof PRICING];
          await sendPaymentReceiptEmail(
            fullUser.email,
            fullUser.firstName || 'Customer',
            pricing?.name || businessPlan.tier,
            pricing?.amount || 0,
            sessionId
          );
        }
      } catch (emailError) {
        console.error("Failed to send payment receipt email:", emailError);
        // Don't fail the request if email fails
      }

      res.json({ success: true, verified: true });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/generate/start", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.body;
      const user = req.user as any;

      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }

      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan || businessPlan.userId !== user.id) {
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

      await storage.updateBusinessPlan(planId, { 
        status: 'generating',
        currentGenerationStage: 'Starting generation - preparing AI agents...'
      });

      generateBusinessPlan(planId).catch(error => {
        console.error("Background generation error:", error);
        storage.updateBusinessPlan(planId, { 
          status: 'failed',
          currentGenerationStage: 'Generation failed'
        });
      });

      res.json({ success: true, message: "Generation started" });
    } catch (error) {
      console.error("Generation start error:", error);
      res.status(500).json({ error: "Failed to start generation" });
    }
  });

  app.get("/api/generate/status/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      
      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan || businessPlan.userId !== user.id) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      res.json({ 
        status: businessPlan.status,
        generatedContent: businessPlan.generatedContent,
        pdfUrl: businessPlan.pdfUrl,
        tier: businessPlan.tier,
        currentGenerationStage: businessPlan.currentGenerationStage
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  async function generateBusinessPlan(planId: string) {
    const plan = await storage.getBusinessPlan(planId);
    if (!plan) throw new Error("Plan not found");

    // Import section-based prompts
    const { getSectionsForTier, getSectionSystemPrompt } = await import('./aiPrompts');
    
    const sections = getSectionsForTier(plan.tier || 'basic');
    const ltvCacRatio = plan.customerAcquisitionCost > 0 
      ? (plan.lifetimeValue / plan.customerAcquisitionCost).toFixed(1) 
      : 'N/A';

    // Build shared data context once
    const sharedDataContext = `
BUSINESS OVERVIEW:
- Name: ${plan.businessName}
- Industry: ${plan.industry}
- Innovation Stage: ${plan.innovationStage}
- Product Status: ${plan.productStatus}
${plan.existingCustomers ? `- Existing Customers: ${plan.existingCustomers}` : ''}
${plan.tractionEvidence ? `- Traction: ${plan.tractionEvidence}` : ''}

PROBLEM & SOLUTION:
${plan.problem}

INNOVATION & TECHNICAL ARCHITECTURE:
- Differentiation: ${plan.uniqueness}
- Technology Stack: ${plan.techStack}
- Data Architecture: ${plan.dataArchitecture}
- AI/ML Methodology: ${plan.aiMethodology}
- Compliance Design: ${plan.complianceDesign}
- IP Status: ${plan.patentStatus}

FOUNDER CREDENTIALS:
- Education: ${plan.founderEducation}
- Work History: ${plan.founderWorkHistory}
- Achievements: ${plan.founderAchievements}
- Relevant Projects: ${plan.relevantProjects}
- Additional Experience: ${plan.experience}

FINANCIAL MODEL:
- Initial Capital: £${plan.funding.toLocaleString()}
- Funding Sources: ${plan.fundingSources}
- Monthly Cashflow: ${plan.monthlyProjections}
- CAC: £${plan.customerAcquisitionCost.toLocaleString()}
- LTV: £${plan.lifetimeValue.toLocaleString()}
- LTV:CAC Ratio: ${ltvCacRatio}:1 ${parseFloat(ltvCacRatio) >= 3 ? '(MEETS >3:1 benchmark ✓)' : '(BELOW 3:1 - address this)'}
- Payback Period: ${plan.paybackPeriod} months
- Cost Breakdown: ${plan.detailedCosts}
- Revenue Model: ${plan.revenue}

COMPETITIVE ANALYSIS:
- Competitors: ${plan.competitors}
- Competitive Advantage: ${plan.competitiveDifferentiation}

MARKET VALIDATION:
- Customer Interviews: ${plan.customerInterviews}
${plan.lettersOfIntent ? `- Letters of Intent: ${plan.lettersOfIntent}` : ''}
- Willingness to Pay: ${plan.willingnessToPay}
- Market Size (TAM/SAM/SOM): ${plan.marketSize}

REGULATORY & COMPLIANCE:
- Requirements: ${plan.regulatoryRequirements}
- Timeline: ${plan.complianceTimeline}
- Budget: £${plan.complianceBudget.toLocaleString()}

SCALABILITY & GROWTH:
- Job Creation Target: ${plan.jobCreation} employees in 3 years
- Hiring Plan: ${plan.hiringPlan}
- Geographic Focus: ${plan.specificRegions}
- Expansion Strategy: ${plan.expansion}
${plan.internationalPlan ? `- International Plans: ${plan.internationalPlan}` : ''}
- 5-Year Vision: ${plan.vision}

ENDORSER STRATEGY:
- Target Endorser: ${plan.targetEndorser}
- Contact Points Plan: ${plan.contactPointsStrategy}`;

    // Generate sections sequentially with multi-pass approach
    const generatedSections: string[] = [];
    
    console.log(`Starting multi-pass generation for ${sections.length} sections (${plan.tier} tier)`);
    
    // Helper to get stage description based on progress
    const getStageDescription = (sectionIndex: number, total: number): string => {
      const progress = sectionIndex / total;
      if (progress === 0) return 'Starting generation - analyzing your business model...';
      if (progress < 0.3) return `Analyzing - Section ${sectionIndex}/${total}: ${sections[sectionIndex - 1]?.title || ''}`;
      if (progress < 0.7) return `Building business plan - Section ${sectionIndex}/${total}: ${sections[sectionIndex - 1]?.title || ''}`;
      if (progress < 0.9) return `Proofreading - Section ${sectionIndex}/${total}: ${sections[sectionIndex - 1]?.title || ''}`;
      return 'Finalizing your business plan - almost ready...';
    };
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Update stage in real-time
      await storage.updateBusinessPlan(planId, {
        currentGenerationStage: getStageDescription(i, sections.length)
      });
      
      console.log(`Generating section ${i + 1}/${sections.length}: ${section.title}`);
      
      const sectionSystemPrompt = getSectionSystemPrompt(
        plan.tier || 'basic',
        section,
        i + 1,
        sections.length
      );
      
      const sectionUserPrompt = `${sharedDataContext}

Write the complete narrative for: ${section.title}

Remember: Write FULL prose content for this section. No outlines or placeholders. Use ALL relevant data above.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: sectionSystemPrompt },
            { role: "user", content: sectionUserPrompt },
          ],
          temperature: 0.6,
          max_tokens: section.maxTokens,
        });

        const sectionContent = completion.choices[0]?.message?.content || "";
        generatedSections.push(`\n\n## ${section.title}\n\n${sectionContent}`);
        
        console.log(`✓ Section ${i + 1} complete (${sectionContent.length} chars)`);
      } catch (error) {
        console.error(`Error generating section ${i + 1}:`, error);
        generatedSections.push(`\n\n## ${section.title}\n\n[Generation failed for this section]`);
      }
    }
    
    // Update to finalizing stage before PDF generation
    await storage.updateBusinessPlan(planId, {
      currentGenerationStage: 'Finalizing - generating your PDF document...'
    });

    // Stitch all sections together
    const generatedContent = `# BUSINESS PLAN: ${plan.businessName}
**Industry:** ${plan.industry}
**Tier:** ${plan.tier?.toUpperCase()}
**Generated:** ${new Date().toLocaleDateString('en-GB')}

---

${generatedSections.join('\n\n---\n\n')}`;

    const pdfUrl = generatePDFUrl(planId);

    await storage.updateBusinessPlan(planId, {
      status: 'completed',
      generatedContent,
      pdfUrl,
      currentGenerationStage: 'Complete - your business plan is ready!'
    });
  }

  app.get("/api/download/pdf/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      
      const businessPlan = await storage.getBusinessPlan(planId);
      if (!businessPlan || businessPlan.userId !== user.id) {
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

  // ============ ADVANCED FEATURES API ENDPOINTS ============

  app.get("/api/endorser/simulate/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      const plan = await storage.getBusinessPlan(planId);
      if (!plan || plan.userId !== user.id) return res.status(404).json({ error: "Plan not found" });

      const { getAllEndorsers, scoreBusinessPlanForEndorser } = await import("./calculators/endorserSimulator");
      
      const endorsers = getAllEndorsers();
      const scores = endorsers.map((e: any) => scoreBusinessPlanForEndorser(plan, e.id));
      
      res.json({ endorsers, scores });
    } catch (error) {
      console.error("Endorser simulator error:", error);
      res.status(500).json({ error: "Failed to analyze endorsers" });
    }
  });

  app.get("/api/routes/analyze/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      const plan = await storage.getBusinessPlan(planId);
      if (!plan || plan.userId !== user.id) return res.status(404).json({ error: "Plan not found" });

      const { compareRoutes } = await import("./calculators/routePlanner");
      
      const analysis = compareRoutes(plan);
      res.json(analysis);
    } catch (error) {
      console.error("Route planner error:", error);
      res.status(500).json({ error: "Failed to analyze routes" });
    }
  });

  app.get("/api/team/model/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      const plan = await storage.getBusinessPlan(planId);
      if (!plan || plan.userId !== user.id) return res.status(404).json({ error: "Plan not found" });

      const { generateTeamPlan, assessTeamSkills } = await import("./calculators/teamModeller");
      
      const teamPlan = generateTeamPlan(plan);
      const skillAssessment = assessTeamSkills(plan);
      
      res.json({ teamPlan, skillAssessment });
    } catch (error) {
      console.error("Team modeller error:", error);
      res.status(500).json({ error: "Failed to generate team plan" });
    }
  });

  app.get("/api/traction/forecast/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      const plan = await storage.getBusinessPlan(planId);
      if (!plan || plan.userId !== user.id) return res.status(404).json({ error: "Plan not found" });

      const { forecastTraction } = await import("./calculators/tractionForecaster");
      
      const forecast = forecastTraction(plan);
      res.json(forecast);
    } catch (error) {
      console.error("Traction forecaster error:", error);
      res.status(500).json({ error: "Failed to forecast traction" });
    }
  });

  app.get("/api/rules/check/:planId", isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.params;
      const user = req.user as any;
      const plan = await storage.getBusinessPlan(planId);
      if (!plan || plan.userId !== user.id) return res.status(404).json({ error: "Plan not found" });

      const { getRuleEngineStatus } = await import("./calculators/ruleChangeEngine");
      
      const businessProfile = {
        industry: plan.industry,
        stage: plan.innovationStage,
        funding: plan.funding,
        jobCreation: plan.jobCreation,
      };
      
      const status = getRuleEngineStatus(businessProfile);
      res.json(status);
    } catch (error) {
      console.error("Rule engine error:", error);
      res.status(500).json({ error: "Failed to check rules" });
    }
  });

  // Chat API endpoint - Multi-LLM powered visa assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ error: "Message is required" });
      }

      const { chatWithMultipleLLMs } = await import("./chatService");
      
      const result = await chatWithMultipleLLMs(
        message,
        conversationHistory || []
      );

      res.json({ 
        response: result.response,
        provider: result.provider 
      });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        response: "I apologize for the technical difficulty. Please try again shortly. For immediate assistance, please contact support or visit the official Home Office website."
      });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await getLatestNews();
      res.json(news);
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news/check", async (req, res) => {
    try {
      const breakingNews = await generateBreakingNews();
      const news = await getLatestNews();
      res.json({ 
        breaking: breakingNews, 
        all: news 
      });
    } catch (error) {
      console.error("Breaking news check error:", error);
      res.status(500).json({ error: "Failed to check for breaking news" });
    }
  });

  // Settings API
  app.get("/api/settings/config", async (req, res) => {
    try {
      const domain = process.env.REPLIT_DOMAINS 
        ? process.env.REPLIT_DOMAINS.split(",")[0].trim() 
        : "localhost:5000";
      
      const callbackUrl = process.env.GOOGLE_CALLBACK_URL ||
        (process.env.REPLIT_DOMAINS 
          ? `https://${domain}/api/auth/callback/google`
          : "http://localhost:5000/api/auth/callback/google");

      res.json({
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ? "✓ Configured" : "Not configured",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓ Configured" : "Not configured",
          callbackUrl,
          jsOrigin: `https://${domain}`,
        },
        system: {
          domain,
          environment: process.env.NODE_ENV || "production",
        },
      });
    } catch (error) {
      console.error("Settings config error:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  // Session Handoff API for QR Mobile Upload
  app.post("/api/session-handoff", async (req, res) => {
    try {
      const { toolId, payload } = req.body;
      
      if (!toolId || !payload) {
        return res.status(400).json({ error: "toolId and payload are required" });
      }

      // Generate unique token
      const token = crypto.randomUUID();
      
      // Set expiration (15 minutes from now)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      // Save to database
      await storage.createSessionHandoff({
        token,
        toolId,
        payload,
        expiresAt,
        consumed: false,
      });
      
      // Return token for QR code
      const domain = process.env.REPLIT_DOMAINS 
        ? process.env.REPLIT_DOMAINS.split(",")[0].trim() 
        : "localhost:5000";
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `http://${domain}`;
      
      const handoffUrl = `${baseUrl}/handoff?token=${token}`;
      
      res.json({ token, handoffUrl, expiresAt });
    } catch (error) {
      console.error("Session handoff creation error:", error);
      res.status(500).json({ error: "Failed to create session handoff" });
    }
  });

  app.get("/api/session-handoff/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const handoff = await storage.getSessionHandoff(token);
      
      if (!handoff) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      // Mark as consumed
      await storage.consumeSessionHandoff(token);
      
      res.json({ 
        toolId: handoff.toolId, 
        payload: handoff.payload 
      });
    } catch (error) {
      console.error("Session handoff retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  });

  // Referral Tracking API for Share Buttons
  app.post("/api/referrals", async (req, res) => {
    try {
      const { toolId, channel, sessionToken } = req.body;
      const user = req.user as any;
      
      if (!toolId || !channel) {
        return res.status(400).json({ error: "toolId and channel are required" });
      }
      
      await storage.createReferral({
        userId: user?.id || null,
        toolId,
        channel,
        sessionToken: sessionToken || null,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Referral tracking error:", error);
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  // ============ ADMIN API ENDPOINTS ============
  
  // Analytics Endpoints
  app.get("/api/admin/analytics/overview", requireAdmin, async (req, res) => {
    try {
      // Get all users and plans
      const allUsers = await storage.getAllUsers();
      const allPlans = await storage.getAllBusinessPlans();
      
      // Calculate user metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const totalUsers = allUsers.length;
      const newUsers = allUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
      const activeUsers = allUsers.filter(u => u.isEmailVerified).length;
      
      // Calculate plan metrics
      const totalPlans = allPlans.length;
      const completedPlans = allPlans.filter(p => p.status === 'completed').length;
      const demoPlans = allPlans.filter(p => p.isDemoData).length;
      
      // Get tool usage stats
      const toolUsageStats = await storage.getToolUsageStats(10);
      
      // System health
      const uptime = process.uptime();
      const databaseStatus = await storage.checkDatabaseHealth();
      
      res.json({
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
        },
        plans: {
          total: totalPlans,
          completed: completedPlans,
          demo: demoPlans,
        },
        topTools: toolUsageStats,
        system: {
          uptime: Math.floor(uptime),
          uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          database: databaseStatus ? 'healthy' : 'degraded',
        },
      });
    } catch (error) {
      console.error("Admin analytics overview error:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  app.get("/api/admin/analytics/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Users by subscription tier
      const tierCounts = {
        free: 0,
        basic: 0,
        premium: 0,
        enterprise: 0,
        ultimate: 0,
      };
      
      allUsers.forEach(user => {
        const tier = user.subscriptionTier || 'free';
        if (tier in tierCounts) {
          tierCounts[tier as keyof typeof tierCounts]++;
        }
      });
      
      // New registrations per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const registrationsByDay: { [key: string]: number } = {};
      allUsers
        .filter(u => new Date(u.createdAt) >= thirtyDaysAgo)
        .forEach(user => {
          const dateKey = new Date(user.createdAt).toISOString().split('T')[0];
          registrationsByDay[dateKey] = (registrationsByDay[dateKey] || 0) + 1;
        });
      
      // Login activity (verified users as proxy for active users)
      const verifiedUsers = allUsers.filter(u => u.isEmailVerified).length;
      const unverifiedUsers = allUsers.filter(u => !u.isEmailVerified).length;
      
      res.json({
        byTier: tierCounts,
        registrationsByDay,
        loginActivity: {
          verified: verifiedUsers,
          unverified: unverifiedUsers,
          verificationRate: allUsers.length > 0 ? Math.round((verifiedUsers / allUsers.length) * 100) : 0,
        },
      });
    } catch (error) {
      console.error("Admin analytics users error:", error);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/admin/analytics/plans", requireAdmin, async (req, res) => {
    try {
      const allPlans = await storage.getAllBusinessPlans();
      
      // Plans by tier
      const tierCounts = {
        basic: 0,
        premium: 0,
        enterprise: 0,
      };
      
      allPlans.forEach(plan => {
        const tier = plan.tier;
        if (tier in tierCounts) {
          tierCounts[tier as keyof typeof tierCounts]++;
        }
      });
      
      // Plans by status
      const statusCounts: { [key: string]: number } = {};
      allPlans.forEach(plan => {
        const status = plan.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Completion rate
      const completedCount = allPlans.filter(p => p.status === 'completed').length;
      const completionRate = allPlans.length > 0 ? Math.round((completedCount / allPlans.length) * 100) : 0;
      
      // Plans created per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const plansByDay: { [key: string]: number } = {};
      allPlans
        .filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
        .forEach(plan => {
          const dateKey = new Date(plan.createdAt).toISOString().split('T')[0];
          plansByDay[dateKey] = (plansByDay[dateKey] || 0) + 1;
        });
      
      res.json({
        byTier: tierCounts,
        byStatus: statusCounts,
        completionRate,
        createdByDay: plansByDay,
      });
    } catch (error) {
      console.error("Admin analytics plans error:", error);
      res.status(500).json({ error: "Failed to fetch plan analytics" });
    }
  });

  app.get("/api/admin/analytics/tools", requireAdmin, async (req, res) => {
    try {
      const toolUsageStats = await storage.getToolUsageStats();
      
      // Group by action type
      const byActionType: { [key: string]: number } = {};
      toolUsageStats.forEach(stat => {
        byActionType[stat.action] = (byActionType[stat.action] || 0) + stat.count;
      });
      
      // Most popular tools overall
      const topTools = toolUsageStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Usage by time period (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const usageByDay: { [key: string]: number } = {};
      toolUsageStats
        .filter(stat => stat.timestamp && new Date(stat.timestamp) >= sevenDaysAgo)
        .forEach(stat => {
          if (stat.timestamp) {
            const dateKey = new Date(stat.timestamp).toISOString().split('T')[0];
            usageByDay[dateKey] = (usageByDay[dateKey] || 0) + stat.count;
          }
        });
      
      res.json({
        byActionType,
        topTools,
        usageByDay,
      });
    } catch (error) {
      console.error("Admin analytics tools error:", error);
      res.status(500).json({ error: "Failed to fetch tool analytics" });
    }
  });

  // User Management Endpoints
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { page = '1', limit = '20', search = '', tier = '' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      let allUsers = await storage.getAllUsers();
      
      // Filter by search (email, name)
      if (search) {
        const searchLower = (search as string).toLowerCase();
        allUsers = allUsers.filter(u => 
          u.email?.toLowerCase().includes(searchLower) ||
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by tier
      if (tier) {
        allUsers = allUsers.filter(u => u.subscriptionTier === tier);
      }
      
      const total = allUsers.length;
      const users = allUsers.slice(offset, offset + limitNum);
      
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json({
        users: safeUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Admin users list error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user's business plans
      const plans = await storage.getUserBusinessPlans(userId);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      
      res.json({
        user: safeUser,
        plans,
      });
    } catch (error) {
      console.error("Admin user details error:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  app.patch("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // Validate user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Only allow specific fields to be updated
      const allowedFields = [
        'subscriptionTier',
        'isAdmin',
        'subscriptionStatus',
        'firstName',
        'lastName',
      ];
      
      const filteredUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      // Add updatedAt
      filteredUpdates.updatedAt = new Date();
      
      const updatedUser = await storage.updateUser(userId, filteredUpdates);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      
      res.json({ success: true, user: safeUser });
    } catch (error) {
      console.error("Admin user update error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = req.user as any;
      
      // Prevent self-deletion
      if (userId === adminUser.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      // Validate user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Soft delete by deactivating
      await storage.updateUser(userId, {
        subscriptionStatus: 'cancelled',
        updatedAt: new Date(),
      });
      
      res.json({ success: true, message: "User deactivated successfully" });
    } catch (error) {
      console.error("Admin user delete error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Business Plan Management Endpoints
  app.get("/api/admin/plans", requireAdmin, async (req, res) => {
    try {
      const { page = '1', limit = '20', status = '', tier = '' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      let allPlans = await storage.getAllBusinessPlans();
      
      // Filter by status
      if (status) {
        allPlans = allPlans.filter(p => p.status === status);
      }
      
      // Filter by tier
      if (tier) {
        allPlans = allPlans.filter(p => p.tier === tier);
      }
      
      const total = allPlans.length;
      const plans = allPlans.slice(offset, offset + limitNum);
      
      res.json({
        plans,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Admin plans list error:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.get("/api/admin/plans/:planId", requireAdmin, async (req, res) => {
    try {
      const { planId } = req.params;
      
      const plan = await storage.getBusinessPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Business plan not found" });
      }
      
      // Get plan owner details
      let owner = null;
      if (plan.userId) {
        const user = await storage.getUser(plan.userId);
        if (user) {
          const { password, ...safeUser } = user;
          owner = safeUser;
        }
      }
      
      res.json({
        plan,
        owner,
      });
    } catch (error) {
      console.error("Admin plan details error:", error);
      res.status(500).json({ error: "Failed to fetch plan details" });
    }
  });

  app.patch("/api/admin/plans/:planId", requireAdmin, async (req, res) => {
    try {
      const { planId } = req.params;
      const updates = req.body;
      
      // Validate plan exists
      const plan = await storage.getBusinessPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Business plan not found" });
      }
      
      // Only allow specific fields to be updated
      const allowedFields = [
        'status',
        'isDemoData',
        'tier',
        'currentGenerationStage',
      ];
      
      const filteredUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      const updatedPlan = await storage.updateBusinessPlan(planId, filteredUpdates);
      
      if (!updatedPlan) {
        return res.status(500).json({ error: "Failed to update plan" });
      }
      
      res.json({ success: true, plan: updatedPlan });
    } catch (error) {
      console.error("Admin plan update error:", error);
      res.status(500).json({ error: "Failed to update plan" });
    }
  });

  app.delete("/api/admin/plans/:planId", requireAdmin, async (req, res) => {
    try {
      const { planId } = req.params;
      
      // Validate plan exists
      const plan = await storage.getBusinessPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Business plan not found" });
      }
      
      // Delete the plan
      await storage.deleteBusinessPlan(planId);
      
      res.json({ success: true, message: "Business plan deleted successfully" });
    } catch (error) {
      console.error("Admin plan delete error:", error);
      res.status(500).json({ error: "Failed to delete plan" });
    }
  });

  // System Control Endpoints
  app.post("/api/admin/system/cache-clear", requireAdmin, async (req, res) => {
    try {
      // In a real implementation, this would clear React Query caches on the client side
      // For now, we just send a success message that the frontend can use to invalidate caches
      res.json({ 
        success: true, 
        message: "Cache clear signal sent. Client-side caches will be invalidated.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Admin cache clear error:", error);
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.get("/api/admin/system/config", requireAdmin, async (req, res) => {
    try {
      const config = {
        environment: process.env.NODE_ENV || 'production',
        database: {
          connected: await storage.checkDatabaseHealth(),
          url: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
        },
        stripe: {
          secretKey: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured',
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Not configured',
        },
        session: {
          secret: process.env.SESSION_SECRET ? 'Configured' : 'Not configured',
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      };
      
      res.json(config);
    } catch (error) {
      console.error("Admin system config error:", error);
      res.status(500).json({ error: "Failed to fetch system config" });
    }
  });

  app.post("/api/admin/system/export", requireAdmin, async (req, res) => {
    try {
      const { type } = req.body;
      
      if (!type || !['users', 'plans'].includes(type)) {
        return res.status(400).json({ error: "Invalid export type. Must be 'users' or 'plans'" });
      }
      
      let csvData = '';
      
      if (type === 'users') {
        const users = await storage.getAllUsers();
        
        // CSV header
        csvData = 'ID,Email,First Name,Last Name,Subscription Tier,Subscription Status,Email Verified,Admin,Created At\n';
        
        // CSV rows
        users.forEach(user => {
          csvData += `"${user.id}","${user.email || ''}","${user.firstName || ''}","${user.lastName || ''}","${user.subscriptionTier || 'free'}","${user.subscriptionStatus || 'inactive'}","${user.isEmailVerified}","${user.isAdmin}","${new Date(user.createdAt).toISOString()}"\n`;
        });
      } else if (type === 'plans') {
        const plans = await storage.getAllBusinessPlans();
        
        // CSV header
        csvData = 'ID,Business Name,Industry,Tier,Status,User ID,Is Demo,Created At\n';
        
        // CSV rows
        plans.forEach(plan => {
          csvData += `"${plan.id}","${plan.businessName}","${plan.industry}","${plan.tier}","${plan.status || 'pending'}","${plan.userId || ''}","${plan.isDemoData}","${new Date(plan.createdAt).toISOString()}"\n`;
        });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Admin export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
