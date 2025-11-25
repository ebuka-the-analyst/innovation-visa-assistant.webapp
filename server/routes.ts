import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { questionnaireSchema, successStories, documentTemplates, userTemplateDownloads, calendarEvents, supportSLA, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import Stripe from "stripe";
import OpenAI from "openai";
import { generatePDFContent, generatePDFUrl } from "./pdf";
import { z } from "zod";
import { getLatestNews, generateBreakingNews } from "./newsService";
import chatRouter from "./chatRoutes";
import crypto from "crypto";
import { setupAuth, isAuthenticated, requireAdmin } from "./auth";
import { sendPaymentReceiptEmail, sendPasswordResetEmail, generateVerificationToken, getResetTokenExpiry, sendPlanCompletionEmail, sendReferralRewardEmail, sendPromoCodeRewardEmail } from "./email";
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

        // Hash the token before storing (security best practice)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        await storage.updateResetToken(user.id, hashedToken, tokenExpiry);

        // Send password reset email with the original (unhashed) token
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

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user by hashed reset token
      const user = await storage.getUserByResetToken(hashedToken);
      
      if (!user || !user.resetTokenExpiry) {
        return res.json({ valid: false, message: "Invalid reset token" });
      }

      // Check if token is expired
      if (new Date() > user.resetTokenExpiry) {
        await storage.clearResetToken(user.id);
        return res.json({ valid: false, message: "Reset token has expired" });
      }

      // Return valid without exposing email (security best practice)
      res.json({ 
        valid: true
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

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user by hashed reset token
      const user = await storage.getUserByResetToken(hashedToken);
      
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

  // Onboarding Tour Routes - Only shows once after plan activation
  app.get("/api/onboarding/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      res.json({
        hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        onboardingCompletedAt: user.onboardingCompletedAt || null,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
      });
    } catch (error) {
      console.error("Onboarding status error:", error);
      res.status(500).json({ error: "Failed to fetch onboarding status" });
    }
  });

  app.post("/api/onboarding/complete", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.markOnboardingComplete(user.id);
      res.json({ 
        success: true, 
        message: "Onboarding completed successfully" 
      });
    } catch (error) {
      console.error("Complete onboarding error:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  app.post("/api/onboarding/reset", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.resetOnboarding(user.id);
      res.json({ 
        success: true, 
        message: "Onboarding reset successfully - tour will show again" 
      });
    } catch (error) {
      console.error("Reset onboarding error:", error);
      res.status(500).json({ error: "Failed to reset onboarding" });
    }
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
      const { planId, promoCode } = req.body;
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

      let finalAmount = pricing.amount;
      let validPromoCode = null;
      
      // Validate and apply promo code discount with explicit error handling
      if (promoCode) {
        const promoCodeRecord = await storage.getPromoCodeByCode(promoCode.toUpperCase());
        
        if (!promoCodeRecord) {
          return res.status(400).json({ error: "Invalid promo code", promoError: true });
        }
        
        if (promoCodeRecord.status !== 'active') {
          return res.status(400).json({ error: "This promo code is no longer active", promoError: true });
        }
        
        const now = new Date();
        if (now < promoCodeRecord.validFrom) {
          return res.status(400).json({ error: "This promo code is not yet active", promoError: true });
        }
        
        if (promoCodeRecord.validUntil && now > promoCodeRecord.validUntil) {
          return res.status(400).json({ error: "This promo code has expired", promoError: true });
        }
        
        if (promoCodeRecord.maxTotalUses && promoCodeRecord.currentUses >= promoCodeRecord.maxTotalUses) {
          return res.status(400).json({ error: "This promo code has reached its usage limit", promoError: true });
        }
        
        // Check tier eligibility
        if (promoCodeRecord.eligibleTiers && promoCodeRecord.eligibleTiers.length > 0 && !promoCodeRecord.eligibleTiers.includes(businessPlan.tier)) {
          return res.status(400).json({ error: `This promo code is not valid for the ${businessPlan.tier} tier`, promoError: true });
        }
        
        // Check minimum purchase amount
        if (promoCodeRecord.minPurchaseAmount && pricing.amount < promoCodeRecord.minPurchaseAmount) {
          return res.status(400).json({ error: `Minimum purchase of £${(promoCodeRecord.minPurchaseAmount / 100).toFixed(2)} required`, promoError: true });
        }
        
        // Apply the discount
        validPromoCode = promoCodeRecord;
        if (validPromoCode.discountType === 'percentage') {
          finalAmount = Math.round(pricing.amount * (1 - validPromoCode.discountValue / 100));
        } else {
          finalAmount = Math.max(0, pricing.amount - validPromoCode.discountValue * 100);
        }
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
                description: validPromoCode 
                  ? `AI-powered UK Innovation Visa business plan - ${businessPlan.tier} tier (${validPromoCode.discountValue}% discount applied)`
                  : `AI-powered UK Innovation Visa business plan - ${businessPlan.tier} tier`,
              },
              unit_amount: finalAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/generation?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
        cancel_url: `${baseUrl}/questionnaire`,
        metadata: {
          planId: businessPlan.id,
          promoCode: validPromoCode?.code || '',
          promoCodeId: validPromoCode?.id || '',
          promoCodeCreatorId: '',
          originalAmount: pricing.amount.toString(),
          discountAmount: (pricing.amount - finalAmount).toString(),
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
      
      const pricing = PRICING[businessPlan.tier as keyof typeof PRICING];
      const purchaseAmount = pricing?.amount || 0;

      // Send payment receipt email
      try {
        const fullUser = await storage.getUser(user.id);
        if (fullUser && fullUser.email) {
          await sendPaymentReceiptEmail(
            fullUser.email,
            fullUser.firstName || 'Customer',
            pricing?.name || businessPlan.tier,
            purchaseAmount,
            sessionId
          );
        }
      } catch (emailError) {
        console.error("Failed to send payment receipt email:", emailError);
        // Don't fail the request if email fails
      }

      // Process referral rewards - check if user was referred
      try {
        const referralEvent = await storage.getReferralEventByReferee(user.id);
        if (referralEvent && referralEvent.status === 'signed_up') {
          const referralCode = await storage.getReferralCode(referralEvent.referralCodeId);
          if (referralCode) {
            // Calculate reward based on referral code settings
            let rewardAmount = 0;
            if (referralCode.rewardType === 'percentage') {
              rewardAmount = Math.round(purchaseAmount * referralCode.rewardValue / 100);
            } else {
              rewardAmount = referralCode.rewardValue;
            }
            
            // Create reward for the referrer
            await storage.createReferralReward({
              userId: referralCode.userId,
              referralEventId: referralEvent.id,
              type: 'cash',
              amount: rewardAmount,
              currency: 'GBP',
              status: 'pending',
            });
            
            // Update referral event to qualified
            await storage.updateReferralEvent(referralEvent.id, {
              status: 'qualified',
              qualifiedAt: new Date(),
              rewardAmount,
            });
            
            // Update referral code stats
            await storage.incrementReferralStats(referralCode.id, 'successfulReferrals');
            await storage.updateReferralCode(referralCode.id, {
              totalEarnings: referralCode.totalEarnings + rewardAmount,
            });

            // Send email notification to referrer
            try {
              const referrer = await storage.getUser(referralCode.userId);
              if (referrer?.email) {
                await sendReferralRewardEmail(
                  referrer.email,
                  referrer.firstName || 'Friend',
                  rewardAmount
                );
              }
            } catch (emailErr) {
              console.error('Failed to send referral reward email:', emailErr);
            }
          }
        }
      } catch (referralError) {
        console.error("Failed to process referral reward:", referralError);
        // Don't fail the request if referral processing fails
      }

      // Process promo code usage - track promo code redemption
      try {
        const promoCodeId = session.metadata?.promoCodeId;
        const promoCodeUsed = session.metadata?.promoCode;
        const discountAmount = parseInt(session.metadata?.discountAmount || '0');
        
        if (promoCodeId && promoCodeUsed) {
          // Increment promo code usage count
          await storage.incrementPromoCodeUsage(promoCodeId);
          
          // Record the redemption
          await storage.createPromoRedemption({
            promoCodeId,
            userId: user.id,
            originalAmount: 0,
            discountApplied: discountAmount,
            finalAmount: 0,
            appliedAt: new Date().toISOString(),
          });
          
          console.log(`Promo code ${promoCodeUsed} used successfully. Discount: £${(discountAmount / 100).toFixed(2)}`);
        }
      } catch (promoError) {
        console.error("Failed to process promo code usage:", promoError);
        // Don't fail the request if promo processing fails
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

    // Send plan completion email notification
    try {
      if (plan.userId) {
        const user = await storage.getUser(plan.userId);
        if (user && user.email) {
          await sendPlanCompletionEmail(
            user.email,
            user.firstName || 'there',
            plan.businessName,
            planId
          );
        }
      }
    } catch (emailError) {
      console.error("Failed to send plan completion email:", emailError);
    }
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

  // Tool Analytics Logging API - Track tool access for admin dashboard
  // Note: Intentionally allows anonymous tracking to capture all user engagement
  const toolAnalyticsSchema = z.object({
    toolId: z.string().min(1).max(100).trim(),
    action: z.enum(['access', 'save', 'export', 'share', 'upload', 'download']).default('access'),
  });
  
  app.post("/api/analytics/tool-access", async (req, res) => {
    try {
      // Validate request body with Zod schema
      const parseResult = toolAnalyticsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request body", 
          details: parseResult.error.issues.map(i => i.message).join(', ')
        });
      }
      
      const { toolId, action } = parseResult.data;
      const user = req.user as any;
      
      await storage.createToolAnalytic({
        userId: user?.id || null,
        toolId,
        action,
        metadata: { 
          userAgent: req.headers['user-agent']?.substring(0, 500), 
          timestamp: new Date().toISOString(),
          authenticated: !!user 
        },
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Tool analytics tracking error:", error);
      res.status(500).json({ error: "Failed to track tool access" });
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
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const totalUsers = allUsers.length;
      const newUsersThisMonth = allUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
      const newUsersLastWeek = allUsers.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
      const activeUsers = allUsers.filter(u => u.isEmailVerified).length;
      
      // Calculate plan metrics
      const totalPlans = allPlans.length;
      const completedPlans = allPlans.filter(p => p.status === 'completed').length;
      const pendingPlans = allPlans.filter(p => p.status === 'pending').length;
      
      // Get tool usage stats
      const toolUsageStats = await storage.getToolUsageStats(10);
      
      // System health
      const uptime = process.uptime();
      const databaseStatus = await storage.checkDatabaseHealth();
      
      // Subscription distribution
      const tierCounts = { free: 0, basic: 0, premium: 0, enterprise: 0, ultimate: 0 };
      allUsers.forEach(user => {
        const tier = (user.subscriptionTier || 'free') as keyof typeof tierCounts;
        if (tier in tierCounts) tierCounts[tier]++;
      });
      
      // Activity data (registrations per day for last 30 days)
      const activityData: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = allUsers.filter(u => 
          new Date(u.createdAt).toISOString().split('T')[0] === dateStr
        ).length;
        activityData.push({ date: dateStr, count });
      }
      
      // Time series data for users over last 30 days
      let cumulativeUsers = 0;
      const timeSeriesData = activityData.map(d => {
        cumulativeUsers += d.count;
        return {
          date: d.date,
          users: cumulativeUsers,
          plans: allPlans.filter(p => 
            new Date(p.createdAt).toISOString().split('T')[0] <= d.date
          ).length,
          revenue: 0,
        };
      });
      
      res.json({
        kpiMetrics: [
          { label: 'Total Users', value: totalUsers, trend: { value: newUsersLastWeek, direction: 'up' as const, period: '7d' }, icon: 'Users', color: 'blue' },
          { label: 'Active Now', value: activeUsers, trend: { value: Math.round((activeUsers / Math.max(totalUsers, 1)) * 100), direction: 'up' as const, period: '30d' }, icon: 'Activity', color: 'green' },
          { label: 'Total Plans', value: totalPlans, trend: { value: completedPlans, direction: 'up' as const, period: 'completed' }, icon: 'FileText', color: 'purple' },
          { label: 'Pending Plans', value: pendingPlans, trend: { value: pendingPlans, direction: 'neutral' as const, period: 'now' }, icon: 'Clock', color: 'orange' },
        ],
        timeSeriesData,
        subscriptionDistribution: Object.entries(tierCounts).map(([tier, count]) => ({
          tier,
          count,
          percentage: Math.round((count / Math.max(totalUsers, 1)) * 100),
        })),
        activityData,
        topTools: toolUsageStats.map(t => ({
          toolId: t.toolId,
          toolName: t.toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          usageCount: t.count,
          uniqueUsers: 0,
          avgDuration: 0,
        })),
        recentActivity: [],
        systemMetrics: {
          uptime: Math.floor(uptime),
          uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          cpuUsage: 0,
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          databaseStatus: databaseStatus ? 'healthy' : 'degraded',
          apiLatency: 0,
          errorRate: 0,
        },
        lastUpdated: new Date().toISOString(),
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

  // Activity Log Endpoint
  app.get("/api/admin/activity-log", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allPlans = await storage.getAllBusinessPlans();
      
      // Generate activity log from users and plans data
      const activities: any[] = [];
      
      // Add user registration events
      allUsers.slice(-20).forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          description: `New user registered: ${user.email}`,
          timestamp: new Date(user.createdAt).toISOString(),
          userId: user.id,
          userEmail: user.email,
          metadata: {
            tier: user.subscriptionTier || 'free',
            verified: user.isEmailVerified,
          }
        });
        
        // Add verification events
        if (user.isEmailVerified) {
          activities.push({
            id: `verify-${user.id}`,
            type: 'email_verified',
            description: `Email verified: ${user.email}`,
            timestamp: new Date(user.createdAt).toISOString(),
            userId: user.id,
            userEmail: user.email,
          });
        }
      });
      
      // Add plan creation events
      allPlans.slice(-20).forEach(plan => {
        activities.push({
          id: `plan-${plan.id}`,
          type: 'plan_created',
          description: `Business plan created: ${plan.businessName}`,
          timestamp: new Date(plan.createdAt).toISOString(),
          planId: plan.id,
          metadata: {
            tier: plan.tier,
            status: plan.status,
            isDemo: plan.isDemoData,
          }
        });
        
        // Add plan completion events
        if (plan.status === 'completed') {
          activities.push({
            id: `complete-${plan.id}`,
            type: 'plan_completed',
            description: `Business plan completed: ${plan.businessName}`,
            timestamp: new Date(plan.createdAt).toISOString(),
            planId: plan.id,
          });
        }
      });
      
      // Sort by timestamp descending and limit to 50
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json(activities.slice(0, 50));
    } catch (error) {
      console.error("Admin activity log error:", error);
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  });

  // Audit Log Endpoint
  app.get("/api/admin/audit-log", requireAdmin, async (req, res) => {
    try {
      // In a production system, this would query a dedicated audit log table
      // For now, we generate from existing data
      const auditEntries: any[] = [
        {
          id: 'audit-1',
          action: 'system_startup',
          description: 'Application server started',
          timestamp: new Date(Date.now() - process.uptime() * 1000).toISOString(),
          actor: 'system',
          severity: 'info',
        },
        {
          id: 'audit-2',
          action: 'database_connected',
          description: 'PostgreSQL database connection established',
          timestamp: new Date(Date.now() - process.uptime() * 1000 + 1000).toISOString(),
          actor: 'system',
          severity: 'info',
        },
      ];
      
      res.json(auditEntries);
    } catch (error) {
      console.error("Admin audit log error:", error);
      res.status(500).json({ error: "Failed to fetch audit log" });
    }
  });

  // System Metrics Endpoint
  app.get("/api/admin/system/metrics", requireAdmin, async (req, res) => {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const uptime = process.uptime();
      
      const databaseHealthy = await storage.checkDatabaseHealth();
      const allUsers = await storage.getAllUsers();
      const allPlans = await storage.getAllBusinessPlans();
      
      res.json({
        uptime: {
          seconds: Math.floor(uptime),
          formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        },
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000),
          system: Math.round(cpuUsage.system / 1000),
        },
        database: {
          status: databaseHealthy ? 'healthy' : 'degraded',
          totalUsers: allUsers.length,
          totalPlans: allPlans.length,
          responseTime: 'Fast', // Could measure actual query time
        },
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        requests: {
          // In production, you'd track actual request metrics
          total: 0,
          perMinute: 0,
          averageResponseTime: 0,
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Admin system metrics error:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
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

  // ============================================
  // REFERRAL & PROMO CODE SYSTEM ROUTES
  // ============================================

  // Generate unique referral code
  function generateReferralCode(userId: string): string {
    const prefix = 'REF';
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${random}`;
  }

  function generatePromoCode(): string {
    const prefix = 'PROMO';
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}${random}`;
  }

  // Hash visitor fingerprint for privacy
  function hashVisitorFingerprint(ip: string, userAgent: string): string {
    return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
  }

  // ============================================
  // USER REFERRAL ROUTES
  // ============================================

  // Get or create user's referral code
  app.get("/api/referrals/my-code", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check if user already has a referral code
      let codes = await storage.getUserReferralCodes(user.id);
      
      if (codes.length === 0) {
        // Create a new referral code for the user
        const code = await storage.createReferralCode({
          userId: user.id,
          code: generateReferralCode(user.id),
          rewardType: 'percentage',
          rewardValue: 10, // 10% commission
          refereeDiscount: 10, // 10% discount for referee
          status: 'active',
        });
        codes = [code];
      }
      
      res.json(codes[0]);
    } catch (error) {
      console.error("Get referral code error:", error);
      res.status(500).json({ error: "Failed to get referral code" });
    }
  });

  // Get user's referral dashboard data
  app.get("/api/referrals/dashboard", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      const [codes, events, rewards] = await Promise.all([
        storage.getUserReferralCodes(user.id),
        storage.getReferralEventsByReferrer(user.id),
        storage.getUserReferralRewards(user.id),
      ]);
      
      const code = codes[0];
      
      // Calculate stats
      const stats = {
        totalClicks: events.length,
        signups: events.filter(e => e.status !== 'visited').length,
        qualified: events.filter(e => e.status === 'qualified' || e.status === 'rewarded').length,
        pendingEarnings: rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0) / 100,
        totalEarnings: rewards.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0) / 100,
      };
      
      res.json({
        code,
        stats,
        events: events.slice(0, 50), // Last 50 events
        rewards: rewards.slice(0, 20), // Last 20 rewards
      });
    } catch (error) {
      console.error("Referral dashboard error:", error);
      res.status(500).json({ error: "Failed to get referral dashboard" });
    }
  });

  // Validate a referral code (public - for signup page)
  app.get("/api/referrals/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      
      const referralCode = await storage.getReferralCodeByCode(code.toUpperCase());
      
      if (!referralCode || referralCode.status !== 'active') {
        return res.json({ valid: false, message: "Invalid or inactive referral code" });
      }
      
      // Check max uses
      if (referralCode.maxUses && referralCode.totalReferrals >= referralCode.maxUses) {
        return res.json({ valid: false, message: "This referral code has reached its usage limit" });
      }
      
      res.json({
        valid: true,
        discount: referralCode.refereeDiscount,
        message: `You'll get ${referralCode.refereeDiscount}% off your first purchase!`,
      });
    } catch (error) {
      console.error("Validate referral code error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate code" });
    }
  });

  // Track referral visit (public - called when someone lands with ?ref=CODE)
  app.post("/api/referrals/track-visit", async (req, res) => {
    try {
      const { code, source, landingPage } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Referral code is required" });
      }
      
      const referralCode = await storage.getReferralCodeByCode(code.toUpperCase());
      
      if (!referralCode || referralCode.status !== 'active') {
        return res.status(400).json({ error: "Invalid referral code" });
      }
      
      // Generate visitor hash
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const visitorHash = hashVisitorFingerprint(ip, userAgent);
      
      // Create visit record
      await storage.createReferralVisit({
        referralCodeId: referralCode.id,
        visitorHash,
        source: source || 'direct',
        landingPage,
        userAgent,
      });
      
      // Increment total referrals
      await storage.incrementReferralStats(referralCode.id, 'totalReferrals');
      
      res.json({ success: true, visitorHash });
    } catch (error) {
      console.error("Track referral visit error:", error);
      res.status(500).json({ error: "Failed to track visit" });
    }
  });

  // Apply referral at signup (called after user registers)
  app.post("/api/referrals/apply-signup", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { code, visitorHash } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Referral code is required" });
      }
      
      const referralCode = await storage.getReferralCodeByCode(code.toUpperCase());
      
      if (!referralCode || referralCode.status !== 'active') {
        return res.status(400).json({ error: "Invalid referral code" });
      }
      
      // Prevent self-referral
      if (referralCode.userId === user.id) {
        return res.status(400).json({ error: "Cannot use your own referral code" });
      }
      
      // Check if user already has a referral event
      const existingEvent = await storage.getReferralEventByReferee(user.id);
      if (existingEvent) {
        return res.status(400).json({ error: "You have already used a referral code" });
      }
      
      // Create referral event
      const event = await storage.createReferralEvent({
        referralCodeId: referralCode.id,
        referrerId: referralCode.userId,
        refereeId: user.id,
        refereeEmail: user.email,
        status: 'signed_up',
        signedUpAt: new Date(),
        landingPage: req.body.landingPage,
        userAgent: req.headers['user-agent'],
        ipHash: visitorHash,
      });
      
      // Update visit conversion if visitorHash provided
      if (visitorHash) {
        await storage.updateReferralVisitConversion(visitorHash, user.id);
      }
      
      // Increment pending referrals
      await storage.incrementReferralStats(referralCode.id, 'pendingReferrals');
      
      res.json({ 
        success: true, 
        discount: referralCode.refereeDiscount,
        message: `Referral applied! You'll get ${referralCode.refereeDiscount}% off your first purchase.`,
      });
    } catch (error) {
      console.error("Apply referral signup error:", error);
      res.status(500).json({ error: "Failed to apply referral" });
    }
  });

  // ============================================
  // PROMO CODE ROUTES
  // ============================================

  // Validate promo code (public - for checkout)
  app.get("/api/promos/validate/:code", async (req, res) => {
    try {
      const { code } = req.params;
      
      const promoCode = await storage.getPromoCodeByCode(code.toUpperCase());
      
      if (!promoCode) {
        return res.json({ valid: false, message: "Invalid promo code" });
      }
      
      if (promoCode.status !== 'active') {
        return res.json({ valid: false, message: "This promo code is no longer active" });
      }
      
      // Check validity period
      const now = new Date();
      if (now < promoCode.validFrom) {
        return res.json({ valid: false, message: "This promo code is not yet active" });
      }
      if (promoCode.validUntil && now > promoCode.validUntil) {
        return res.json({ valid: false, message: "This promo code has expired" });
      }
      
      // Check usage limits
      if (promoCode.maxTotalUses && promoCode.currentUses >= promoCode.maxTotalUses) {
        return res.json({ valid: false, message: "This promo code has reached its usage limit" });
      }
      
      res.json({
        valid: true,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        name: promoCode.name,
        message: promoCode.discountType === 'percentage' 
          ? `${promoCode.discountValue}% off your purchase!`
          : `£${promoCode.discountValue / 100} off your purchase!`,
      });
    } catch (error) {
      console.error("Validate promo code error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate code" });
    }
  });

  // Check if user can use promo code
  app.post("/api/promos/check-eligibility", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { code, purchaseAmount } = req.body;
      
      const promoCode = await storage.getPromoCodeByCode(code.toUpperCase());
      
      if (!promoCode || promoCode.status !== 'active') {
        return res.json({ eligible: false, message: "Invalid promo code" });
      }
      
      // Check tier eligibility
      if (promoCode.eligibleTiers && promoCode.eligibleTiers.length > 0) {
        if (!promoCode.eligibleTiers.includes(user.subscriptionTier || 'free')) {
          return res.json({ eligible: false, message: "This promo code is not available for your subscription tier" });
        }
      }
      
      // Check minimum purchase
      if (promoCode.minPurchaseAmount && purchaseAmount < promoCode.minPurchaseAmount) {
        return res.json({ 
          eligible: false, 
          message: `Minimum purchase of £${promoCode.minPurchaseAmount / 100} required` 
        });
      }
      
      // Check per-user usage limit
      if (promoCode.maxUsesPerUser) {
        const userRedemptions = await storage.getUserPromoRedemptionCount(user.id, promoCode.id);
        if (userRedemptions >= promoCode.maxUsesPerUser) {
          return res.json({ eligible: false, message: "You have already used this promo code" });
        }
      }
      
      res.json({
        eligible: true,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount: promoCode.discountType === 'percentage'
          ? Math.round(purchaseAmount * promoCode.discountValue / 100)
          : promoCode.discountValue,
      });
    } catch (error) {
      console.error("Check promo eligibility error:", error);
      res.status(500).json({ eligible: false, message: "Failed to check eligibility" });
    }
  });

  // ============================================
  // PAYOUT REQUEST ROUTES
  // ============================================

  // Get user's payout requests
  app.get("/api/payouts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const payouts = await storage.getUserPayoutRequests(user.id);
      res.json(payouts);
    } catch (error) {
      console.error("Get payout requests error:", error);
      res.status(500).json({ error: "Failed to fetch payout requests" });
    }
  });

  // Create payout request
  app.post("/api/payouts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { amount, paymentMethod, paymentDetails } = req.body;
      
      if (!amount || amount < 2000) { // Minimum £20 (2000 pence)
        return res.status(400).json({ error: "Minimum payout amount is £20" });
      }
      
      if (!paymentMethod || !paymentDetails) {
        return res.status(400).json({ error: "Payment method and details required" });
      }
      
      // Check user's available balance from referral codes
      const userCodes = await storage.getUserReferralCodes(user.id);
      const totalEarnings = userCodes.reduce((sum, c) => sum + c.totalEarnings, 0);
      const paidEarnings = userCodes.reduce((sum, c) => sum + c.paidEarnings, 0);
      const availableBalance = totalEarnings - paidEarnings;
      
      // Get pending payout requests
      const pendingPayouts = await storage.getUserPayoutRequests(user.id);
      const pendingAmount = pendingPayouts
        .filter(p => p.status === 'pending' || p.status === 'processing')
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (amount > (availableBalance - pendingAmount)) {
        return res.status(400).json({ error: "Insufficient balance for payout" });
      }
      
      const payout = await storage.createPayoutRequest({
        userId: user.id,
        amount,
        paymentMethod,
        paymentDetails,
        status: 'pending',
      });
      
      // Send admin notification
      try {
        const { sendPayoutRequestNotification } = await import('./email');
        await sendPayoutRequestNotification(
          'admin@innovatorfoundervisaassistant.co.uk',
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          user.email,
          amount / 100,
          paymentMethod,
          paymentDetails
        );
      } catch (emailError) {
        console.error("Failed to send payout request notification:", emailError);
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Create payout request error:", error);
      res.status(500).json({ error: "Failed to create payout request" });
    }
  });

  // ============================================
  // REFERRAL LEADERBOARD
  // ============================================

  // Get public leaderboard
  app.get("/api/referrals/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getReferralLeaderboard(limit);
      
      // Hide sensitive data for public display
      const publicLeaderboard = leaderboard.map((entry, index) => ({
        rank: index + 1,
        userName: entry.userName.split(' ')[0] + (entry.userName.includes(' ') ? ' ' + entry.userName.split(' ')[1]?.[0] + '.' : ''),
        referralCode: entry.referralCode,
        successfulReferrals: entry.successfulReferrals,
        totalReferrals: entry.totalReferrals,
      }));
      
      res.json(publicLeaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // ============================================
  // ADMIN REFERRAL & PROMO ROUTES
  // ============================================

  // Get all referral codes (admin)
  app.get("/api/admin/referrals/codes", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllReferralCodes();
      res.json(codes);
    } catch (error) {
      console.error("Admin get referral codes error:", error);
      res.status(500).json({ error: "Failed to fetch referral codes" });
    }
  });

  // Get all referral events (admin)
  app.get("/api/admin/referrals/events", requireAdmin, async (req, res) => {
    try {
      const events = await storage.getAllReferralEvents();
      res.json(events);
    } catch (error) {
      console.error("Admin get referral events error:", error);
      res.status(500).json({ error: "Failed to fetch referral events" });
    }
  });

  // Get all referral rewards (admin)
  app.get("/api/admin/referrals/rewards", requireAdmin, async (req, res) => {
    try {
      const rewards = await storage.getAllReferralRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Admin get referral rewards error:", error);
      res.status(500).json({ error: "Failed to fetch referral rewards" });
    }
  });

  // Get pending rewards for approval (admin)
  app.get("/api/admin/referrals/pending-rewards", requireAdmin, async (req, res) => {
    try {
      const rewards = await storage.getPendingRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Admin get pending rewards error:", error);
      res.status(500).json({ error: "Failed to fetch pending rewards" });
    }
  });

  // Approve or reject reward (admin)
  app.patch("/api/admin/referrals/rewards/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, payoutMethod, payoutReference } = req.body;
      
      if (!['approved', 'paid', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updates: any = { status };
      if (payoutMethod) updates.payoutMethod = payoutMethod;
      if (payoutReference) updates.payoutReference = payoutReference;
      if (status === 'paid') updates.paidAt = new Date();
      
      const reward = await storage.updateReferralReward(id, updates);
      
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }
      
      // Update referral code earnings if paid
      if (status === 'paid') {
        const event = await storage.getReferralEvent(reward.referralEventId);
        if (event) {
          const code = await storage.getReferralCode(event.referralCodeId);
          if (code) {
            await storage.updateReferralCode(code.id, {
              paidEarnings: code.paidEarnings + reward.amount,
            });
          }
        }
      }
      
      res.json(reward);
    } catch (error) {
      console.error("Admin update reward error:", error);
      res.status(500).json({ error: "Failed to update reward" });
    }
  });

  // Get referral analytics (admin)
  app.get("/api/admin/referrals/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getReferralAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Admin referral analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ============================================
  // ADMIN PAYOUT MANAGEMENT ROUTES
  // ============================================

  // Get all payout requests (admin)
  app.get("/api/admin/payouts", requireAdmin, async (req, res) => {
    try {
      const payouts = await storage.getAllPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Admin get payouts error:", error);
      res.status(500).json({ error: "Failed to fetch payout requests" });
    }
  });

  // Get pending payouts (admin)
  app.get("/api/admin/payouts/pending", requireAdmin, async (req, res) => {
    try {
      const payouts = await storage.getPendingPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Admin get pending payouts error:", error);
      res.status(500).json({ error: "Failed to fetch pending payouts" });
    }
  });

  // Update payout request (admin)
  app.patch("/api/admin/payouts/:id", requireAdmin, async (req, res) => {
    try {
      const admin = req.user as any;
      const { id } = req.params;
      const { status, notes, transactionRef } = req.body;
      
      if (!['processing', 'completed', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updates: any = { 
        status,
        processedBy: admin.id,
        processedAt: new Date(),
      };
      if (notes) updates.notes = notes;
      if (transactionRef) updates.transactionRef = transactionRef;
      
      const payout = await storage.updatePayoutRequest(id, updates);
      
      if (!payout) {
        return res.status(404).json({ error: "Payout request not found" });
      }
      
      // If completed, update the user's paid earnings on their referral codes
      if (status === 'completed') {
        const userCodes = await storage.getUserReferralCodes(payout.userId);
        let remainingAmount = payout.amount;
        
        for (const code of userCodes) {
          if (remainingAmount <= 0) break;
          const unpaidBalance = code.totalEarnings - code.paidEarnings;
          const toDeduct = Math.min(unpaidBalance, remainingAmount);
          if (toDeduct > 0) {
            await storage.updateReferralCode(code.id, {
              paidEarnings: code.paidEarnings + toDeduct,
            });
            remainingAmount -= toDeduct;
          }
        }
      }
      
      // Send notification to user
      try {
        const user = await storage.getUser(payout.userId);
        if (user?.email) {
          const { sendPayoutStatusNotification } = await import('./email');
          await sendPayoutStatusNotification(
            user.email,
            user.firstName || 'there',
            payout.amount / 100,
            status === 'completed' ? 'completed' : 'rejected',
            notes
          );
        }
      } catch (emailError) {
        console.error("Failed to send payout status notification:", emailError);
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Admin update payout error:", error);
      res.status(500).json({ error: "Failed to update payout request" });
    }
  });

  // ============================================
  // ADMIN PROMO CODE ROUTES
  // ============================================

  // Get all promo codes (admin)
  app.get("/api/admin/promos", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllPromoCodes();
      res.json(codes);
    } catch (error) {
      console.error("Admin get promo codes error:", error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  // Create promo code (admin)
  app.post("/api/admin/promos", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { 
        name, 
        description, 
        code,
        discountType, 
        discountValue, 
        eligibleTiers,
        minPurchaseAmount,
        maxTotalUses,
        maxUsesPerUser,
        validFrom,
        validUntil,
      } = req.body;
      
      if (!name || !discountType || !discountValue) {
        return res.status(400).json({ error: "Name, discount type, and discount value are required" });
      }
      
      // Generate code if not provided
      const promoCodeValue = code?.toUpperCase() || generatePromoCode();
      
      // Check if code already exists
      const existing = await storage.getPromoCodeByCode(promoCodeValue);
      if (existing) {
        return res.status(400).json({ error: "A promo code with this code already exists" });
      }
      
      const promoCode = await storage.createPromoCode({
        code: promoCodeValue,
        name,
        description,
        discountType,
        discountValue,
        eligibleTiers: eligibleTiers || null,
        minPurchaseAmount: minPurchaseAmount || null,
        maxTotalUses: maxTotalUses || null,
        maxUsesPerUser: maxUsesPerUser || 1,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'active',
        createdBy: user.id,
      });
      
      res.json(promoCode);
    } catch (error) {
      console.error("Admin create promo code error:", error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  // Update promo code (admin)
  app.patch("/api/admin/promos/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Prevent code modification
      delete updates.code;
      delete updates.createdBy;
      delete updates.currentUses;
      
      const promoCode = await storage.updatePromoCode(id, updates);
      
      if (!promoCode) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      
      res.json(promoCode);
    } catch (error) {
      console.error("Admin update promo code error:", error);
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  // Delete promo code (admin)
  app.delete("/api/admin/promos/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePromoCode(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin delete promo code error:", error);
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });

  // Approve reward (admin)
  app.post("/api/admin/referrals/rewards/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const reward = await storage.updateReferralReward(id, { 
        status: 'approved',
      });
      
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }
      
      res.json(reward);
    } catch (error) {
      console.error("Admin approve reward error:", error);
      res.status(500).json({ error: "Failed to approve reward" });
    }
  });

  // Reject reward (admin)
  app.post("/api/admin/referrals/rewards/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      
      const reward = await storage.updateReferralReward(id, { 
        status: 'cancelled',
        notes: `Rejected: ${reason}`,
      });
      
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }
      
      res.json(reward);
    } catch (error) {
      console.error("Admin reject reward error:", error);
      res.status(500).json({ error: "Failed to reject reward" });
    }
  });

  // Get promo redemptions (admin)
  app.get("/api/admin/promos/redemptions", requireAdmin, async (req, res) => {
    try {
      const redemptions = await storage.getAllPromoRedemptions();
      res.json(redemptions);
    } catch (error) {
      console.error("Admin get promo redemptions error:", error);
      res.status(500).json({ error: "Failed to fetch redemptions" });
    }
  });

  // Get promo analytics (admin)
  app.get("/api/admin/promos/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getPromoAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Admin promo analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ============================================
  // PARTNER DASHBOARD
  // ============================================

  // Check if user is a partner (has promo codes they own)
  app.get("/api/partner/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const promoCodes = await storage.getPromoCodesByOwner(user.id);
      res.json({ 
        isPartner: promoCodes.length > 0,
        promoCodeCount: promoCodes.length,
      });
    } catch (error) {
      console.error("Partner status check error:", error);
      res.status(500).json({ error: "Failed to check partner status" });
    }
  });

  // Get partner analytics
  app.get("/api/partner/analytics", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const analytics = await storage.getPartnerAnalytics(user.id);
      
      if (analytics.promoCodes.length === 0) {
        return res.status(403).json({ error: "You are not a partner. Contact admin to get a promo code." });
      }
      
      res.json(analytics);
    } catch (error) {
      console.error("Partner analytics error:", error);
      res.status(500).json({ error: "Failed to fetch partner analytics" });
    }
  });

  // Get partner's promo codes
  app.get("/api/partner/promo-codes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const promoCodes = await storage.getPromoCodesByOwner(user.id);
      res.json(promoCodes);
    } catch (error) {
      console.error("Partner promo codes error:", error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  // Get users who used partner's promo codes (with user details)
  app.get("/api/partner/users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const analytics = await storage.getPartnerAnalytics(user.id);
      
      if (analytics.promoCodes.length === 0) {
        return res.status(403).json({ error: "You are not a partner" });
      }
      
      // Get detailed user info for each user who used partner's codes
      const usersWithDetails = await Promise.all(
        analytics.usersByPromoCode.flatMap(pc => 
          pc.users.map(async u => {
            const userDetails = await storage.getUser(u.userId);
            return {
              userId: u.userId,
              email: userDetails?.email || 'Unknown',
              firstName: userDetails?.firstName || 'Unknown',
              lastName: userDetails?.lastName || '',
              tier: userDetails?.subscriptionTier || 'free',
              promoCode: pc.promoCode.code,
              promoCodeName: pc.promoCode.name,
              redeemedAt: u.redeemedAt,
              discountApplied: u.discountApplied,
            };
          })
        )
      );
      
      res.json(usersWithDetails);
    } catch (error) {
      console.error("Partner users error:", error);
      res.status(500).json({ error: "Failed to fetch partner users" });
    }
  });

  // Partner can send email to their users (simplified - would need proper email service)
  app.post("/api/partner/contact-user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { userId, subject, message } = req.body;
      
      if (!userId || !subject || !message) {
        return res.status(400).json({ error: "User ID, subject, and message are required" });
      }
      
      // Verify this user used partner's promo code
      const analytics = await storage.getPartnerAnalytics(user.id);
      const allUserIds = analytics.usersByPromoCode.flatMap(pc => pc.users.map(u => u.userId));
      
      if (!allUserIds.includes(userId)) {
        return res.status(403).json({ error: "You can only contact users who used your promo code" });
      }
      
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // In production, this would send an actual email
      // For now, we'll just log and return success
      console.log(`Partner ${user.email} sending email to ${targetUser.email}: ${subject}`);
      
      res.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      console.error("Partner contact user error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ============================================
  // SUPPORT SYSTEM
  // ============================================

  // Contact form submission
  app.post("/api/support/contact", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { topic, subject, message } = req.body;

      if (!topic || !subject || !message) {
        return res.status(400).json({ error: "Topic, subject, and message are required" });
      }

      // Store the support ticket
      const ticket = await storage.createSupportTicket({
        userId: user.id,
        email: user.email,
        topic,
        subject,
        message,
        status: 'open',
      });

      // Send notification email to support team
      const { sendSupportNotificationEmail } = await import('./email');
      await sendSupportNotificationEmail(
        user.email,
        user.firstName || 'User',
        topic,
        subject,
        message
      );

      res.json({ success: true, ticketId: ticket.id });
    } catch (error) {
      console.error("Support contact error:", error);
      res.status(500).json({ error: "Failed to submit support request" });
    }
  });

  // Get user's support tickets
  app.get("/api/support/tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const tickets = await storage.getUserSupportTickets(user.id);
      res.json(tickets);
    } catch (error) {
      console.error("Get support tickets error:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });

  // ============================================
  // DOCUMENT STORAGE
  // ============================================

  // Get user's documents
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const documents = await storage.getUserDocuments(user.id);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Upload document (placeholder - would need object storage integration)
  app.post("/api/documents/upload", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // For MVP, we'll store document metadata
      // Full file storage would use Replit's Object Storage
      const { name, category, description, fileUrl, fileType, fileSize } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ error: "Name and category are required" });
      }
      
      const document = await storage.createUserDocument({
        userId: user.id,
        name,
        category,
        description,
        fileUrl: fileUrl || '/placeholder-document',
        fileType: fileType || 'application/pdf',
        fileSize: fileSize || 0,
        status: 'pending',
      });
      
      res.json(document);
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { id } = req.params;
      
      // Verify ownership
      const doc = await storage.getUserDocument(id);
      if (!doc || doc.userId !== user.id) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      await storage.deleteUserDocument(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ============ COMPREHENSIVE DEMO DATA SEEDING ============
  
  // Admin endpoint to create comprehensive demo account
  app.post("/api/admin/seed-demo-data", requireAdmin, async (req, res) => {
    try {
      // Create or update demo user
      const demoEmail = "demo@innovatorvisaassistant.co.uk";
      let demoUser = await storage.getUserByEmail(demoEmail);
      
      if (!demoUser) {
        // Create demo user with hashed password
        const hashedPassword = await bcrypt.hash("Demo2024!Secure", 10);
        demoUser = await storage.createUser({
          email: demoEmail,
          password: hashedPassword,
          firstName: "Sarah",
          lastName: "Chen",
          isEmailVerified: true,
          subscriptionTier: "ultimate",
          subscriptionStatus: "active",
        });
      } else {
        // Update existing demo user to ultimate tier
        await storage.updateUser(demoUser.id, {
          subscriptionTier: "ultimate",
          subscriptionStatus: "active",
          isEmailVerified: true,
          firstName: "Sarah",
          lastName: "Chen",
        });
        demoUser = await storage.getUser(demoUser.id);
      }
      
      if (!demoUser) {
        return res.status(500).json({ error: "Failed to create demo user" });
      }
      
      // Create comprehensive demo business plan
      const existingDemoPlans = await storage.getDemoBusinessPlans();
      if (existingDemoPlans.length === 0) {
        const demoPlan = await storage.createBusinessPlan({
          tier: "enterprise",
          businessName: "MedTech AI Solutions Ltd",
          industry: "Healthcare Technology / AI-Powered Diagnostics",
          problem: "Early cancer detection remains a significant challenge in the UK healthcare system. Current screening methods miss up to 30% of early-stage cancers, leading to delayed treatment, higher mortality rates, and increased NHS costs. Radiologists are overwhelmed with increasing caseloads, resulting in diagnostic delays of 2-4 weeks. Our AI-powered diagnostic platform addresses this critical gap by providing rapid, accurate analysis of medical imaging to support clinical decisions.",
          uniqueness: "Our proprietary deep learning algorithms have been trained on over 500,000 anonymised NHS medical images, achieving 97.3% accuracy in detecting early-stage tumours - significantly outperforming traditional screening methods. Unlike competitors focusing on single cancer types, our platform provides comprehensive multi-cancer screening from a single scan. We hold 3 patents pending for our novel image processing techniques and have secured exclusive data partnerships with 4 NHS Trusts.",
          technology: "Our platform utilises a sophisticated ensemble of convolutional neural networks and transformer architectures, deployed on a scalable cloud infrastructure compliant with NHS Digital standards. The system integrates seamlessly with existing PACS systems through HL7 FHIR APIs. Our proprietary data augmentation techniques enable accurate diagnosis even with limited training data, while our explainable AI module provides clinicians with clear reasoning for each diagnosis.",
          experience: "Dr. Sarah Chen (CEO) - 15 years in healthcare AI, former Head of AI Research at Imperial College Healthcare NHS Trust, PhD in Computer Vision from Cambridge. Led development of AI systems used in 50+ UK hospitals. James Thompson (CTO) - 12 years software engineering, former Principal Engineer at DeepMind Health, MSc in Machine Learning from Oxford. Dr. Emma Williams (CMO) - NHS consultant radiologist with 20 years experience, published 40+ peer-reviewed papers on medical imaging AI.",
          funding: 750000,
          revenue: "We have achieved £285,000 in revenue over the past 12 months through pilot programmes with 4 NHS Trusts and 3 private healthcare providers. Our B2B SaaS model charges £2,500/month per hospital site with volume discounts for Trust-wide deployments. We project Year 1 revenue of £850,000, Year 2 of £2.4M, and Year 3 of £5.8M based on contracted pilots converting to full deployments and new Trust acquisitions.",
          jobCreation: 25,
          expansion: "Initial focus on UK NHS and private healthcare market (Year 1-2), followed by expansion to Ireland and Nordic markets (Year 2-3), then EU and US markets (Year 3-5). We plan to hire 15 UK-based employees in Year 1, expanding to 25 by Year 2. Specific roles include ML Engineers, Clinical Specialists, and Sales team based in our London office.",
          vision: "By 2030, we aim to be the leading AI diagnostic platform in Europe, having contributed to the early detection of over 100,000 cancers and saved an estimated 15,000 lives. We will establish the UK as a global hub for healthcare AI innovation, creating 200+ high-skilled jobs and attracting £50M+ in international investment. Our technology will become the standard of care across NHS Trusts, demonstrating the UK's leadership in ethical AI deployment in healthcare.",
          innovationStage: "Growth",
          productStatus: "Our platform is fully operational and deployed across 4 NHS Trust pilot sites. We have completed CE marking certification and NHS Digital DTAC compliance. The system has processed over 25,000 scans in production with a 99.7% uptime record. We are currently in final negotiations with 3 additional Trusts for full commercial deployments starting Q1 2025.",
          existingCustomers: "Guy's and St Thomas' NHS Foundation Trust (18-month pilot, converting to full deployment), Royal Free London NHS Foundation Trust (12-month pilot), Barts Health NHS Trust (6-month pilot), Cambridge University Hospitals NHS Trust (active pilot). Private sector: HCA Healthcare UK (3 facilities), Nuffield Health (2 facilities), BMI Healthcare (pilot starting).",
          betaTesters: "Our beta programme included 45 consultant radiologists from 12 NHS Trusts who provided extensive feedback over 18 months. 94% reported the system improved their diagnostic confidence, and 89% said it reduced their workload. Average time to diagnosis decreased by 62% in beta testing. All beta participants have expressed interest in continued use post-trial.",
          tractionEvidence: "- £285,000 revenue in past 12 months with 3 paying customers\n- 25,000+ scans processed with 97.3% accuracy rate\n- Letters of Intent from 5 NHS Trusts worth £1.2M annual contract value\n- Selected for NHS Innovation Accelerator programme\n- Won HealthTech Innovation Award 2024\n- Featured in BMJ, The Lancet Digital Health, and BBC News\n- £500,000 Innovate UK grant awarded (completed)",
          techStack: "Python/TensorFlow for ML models, FastAPI backend, React/TypeScript frontend, PostgreSQL with TimescaleDB for time-series data, Redis for caching, Kubernetes on AWS GovCloud (UK) for HIPAA/NHS compliance, Terraform for infrastructure as code, comprehensive CI/CD with GitHub Actions. All data encrypted at rest and in transit using AES-256.",
          dataArchitecture: "We implement a sophisticated data pipeline with Apache Kafka for real-time streaming, Apache Airflow for ETL orchestration, and dbt for data transformation. Medical images are stored in S3-compatible object storage with strict access controls. Our data lake architecture supports both real-time inference and batch processing for model training. All PII is pseudonymised using NHS-approved tokenisation methods.",
          aiMethodology: "Our ensemble approach combines EfficientNet-based CNNs for feature extraction with Vision Transformers for global context understanding. We employ federated learning for privacy-preserving model updates across Trust boundaries. Active learning pipelines continuously improve accuracy from clinician feedback. Uncertainty quantification using Monte Carlo dropout enables appropriate human escalation. All models undergo rigorous bias testing across demographic groups.",
          complianceDesign: "Built from ground-up for healthcare compliance: GDPR and UK Data Protection Act compliant, ISO 27001 certified, CE marked as Class IIa medical device under MDR, NHS Digital DTAC fully compliant, Cyber Essentials Plus certified. We maintain comprehensive audit trails, implement role-based access control, and conduct quarterly penetration testing. Data Processing Agreements in place with all Trust partners.",
          patentStatus: "3 UK patents pending (application numbers GB2023/001234, GB2023/001235, GB2023/001236) covering: 1) Novel multi-cancer detection ensemble methodology, 2) Explainable AI visualisation system for medical imaging, 3) Privacy-preserving federated learning protocol for healthcare. Expected grant date: Q2 2025. International PCT applications filed for US, EU, and Japan markets.",
          founderEducation: "Dr. Sarah Chen: PhD Computer Vision, University of Cambridge (2012), MSc Artificial Intelligence, Imperial College London (2008), BSc Computer Science, UCL (2006). James Thompson: MSc Machine Learning, University of Oxford (2014), MEng Computer Science, University of Bristol (2010). Dr. Emma Williams: MBBS Medicine, King's College London (2000), FRCR Fellowship in Clinical Radiology (2008), MD Research Degree in Medical Imaging AI (2015).",
          founderWorkHistory: "Dr. Sarah Chen: Head of AI Research, Imperial College Healthcare NHS Trust (2018-2023) - led team of 15, deployed AI in 50+ hospitals. Senior ML Engineer, Google Health (2015-2018). Research Scientist, Microsoft Research Cambridge (2012-2015). James Thompson: Principal Engineer, DeepMind Health (2018-2023) - technical lead on Streams project. Senior Engineer, Google Cloud Healthcare (2014-2018). Dr. Emma Williams: Consultant Radiologist, Royal Free London (2012-present), Lead for AI Integration (2019-present).",
          founderAchievements: "Dr. Sarah Chen: 25 peer-reviewed publications (h-index 18), 4 patents granted, NHS Digital Pioneer Fellow (2022), Forbes 30 Under 30 in Healthcare (2019). James Thompson: Lead architect of systems processing 1M+ daily predictions, Google Cloud Certified Professional ML Engineer, contributor to TensorFlow medical imaging tools. Dr. Emma Williams: 40+ publications, President of British Society of AI in Radiology, NHS Clinical Entrepreneur Fellow, Royal College of Radiologists Innovation Award (2021).",
          relevantProjects: "NHS AI Lab Collaboration (2022-2023): Developed and validated AI models with NHS AI Lab, resulting in 2 published studies demonstrating clinical efficacy. Innovate UK Smart Grant Project (2021-2022): £500,000 grant to develop federated learning capabilities, successfully deployed across 3 Trust networks. Imperial College Partnership (2020-present): Ongoing research collaboration producing 5 joint publications and 2 patent applications.",
          monthlyProjections: "Month 1-3: £65,000/mo (existing contracts + 1 new deployment)\nMonth 4-6: £95,000/mo (3 pilot conversions)\nMonth 7-9: £140,000/mo (2 new Trust deployments)\nMonth 10-12: £185,000/mo (private sector expansion)\nYear 1 Total: £1.45M\nYear 2: £3.2M (EU market entry)\nYear 3: £6.8M (US market entry)",
          customerAcquisitionCost: 45000,
          lifetimeValue: 450000,
          paybackPeriod: 4,
          fundingSources: "Current funding: £500,000 Innovate UK grant (completed), £250,000 angel investment (2022). Seeking: £2M Series A (negotiations with 3 VC firms). Committed: £150,000 from existing angels for bridge round. Government support: Approved for £1M Future Fund matched investment pending Series A close.",
          detailedCosts: "Personnel (60%): £540,000 - 8 FTE engineers, 2 clinical specialists, 2 sales\nCloud Infrastructure (15%): £135,000 - AWS GovCloud, data storage, compute\nR&D (10%): £90,000 - model development, research partnerships\nSales & Marketing (8%): £72,000 - conferences, content, lead generation\nCompliance & Legal (5%): £45,000 - certifications, legal counsel\nOperations (2%): £18,000 - office, admin, insurance\nTotal Year 1: £900,000",
          competitors: "IBM Watson Health: Large but struggled with healthcare AI accuracy, recently divested imaging division. Google Health: Strong technology but limited NHS relationships, focus on US market. Qure.ai: Indian competitor focusing on chest X-rays, limited UK presence. Zebra Medical: General radiology AI, not cancer-specific, limited NHS deployments. Key differentiator: Our NHS-trained models, established Trust relationships, and multi-cancer comprehensive approach set us apart.",
          competitiveDifferentiation: "1) NHS-specific training data: 500,000+ NHS images vs competitors' general datasets\n2) Multi-cancer detection: Single platform for comprehensive screening vs single-disease competitors\n3) Established NHS relationships: 4 active Trust deployments vs competitors' limited UK presence\n4) Explainable AI: Clinician-friendly visualisations vs black-box competitor systems\n5) UK-based team: Local support and regulatory expertise\n6) Federated learning: Privacy-preserving model updates vs data-centralising competitors",
          customerInterviews: "Conducted 78 structured interviews across: 35 NHS radiologists (pain points: workload, diagnostic confidence, system integration), 18 Trust procurement leads (priorities: cost-effectiveness, compliance, support), 15 private sector medical directors (interests: competitive advantage, patient outcomes), 10 NHS Digital representatives (requirements: interoperability, security, scalability). Key insight: 92% willing to pay premium for UK-developed, NHS-compliant solution.",
          lettersOfIntent: "5 Letters of Intent secured totaling £1.2M annual contract value:\n- Manchester University NHS Foundation Trust: £300,000/year (3-year commitment)\n- University Hospitals Birmingham: £280,000/year (2-year commitment)\n- Leeds Teaching Hospitals: £250,000/year (2-year commitment)\n- Newcastle upon Tyne Hospitals: £220,000/year (2-year commitment)\n- King's College Hospital: £150,000/year (pilot conversion)",
          willingnessToPay: "NHS Trusts: £2,000-3,500/month per site based on volume (validated through 78 interviews and 4 active deployments). Private sector: £3,500-5,000/month per facility (premium for faster implementation). Pricing validated through: existing revenue of £285,000, 5 LoIs at proposed pricing, competitive analysis showing 20-30% below IBM Watson pricing while offering superior accuracy.",
          marketSize: "UK Healthcare AI Market: £2.8B by 2027 (CAGR 35%). Medical Imaging AI specifically: £420M UK market. Our serviceable addressable market (cancer screening AI): £180M UK, £1.2B Europe. Bottom-up calculation: 150 NHS Trusts × £150,000 average annual contract = £22.5M UK NHS opportunity. Plus 300 private facilities × £48,000 = £14.4M private sector. Total UK SAM: £37M.",
          regulatoryRequirements: "CE Marking (Class IIa Medical Device): Completed May 2024\nUK CA Marking: Application submitted, expected Q1 2025\nNHS Digital DTAC: Fully compliant, certified August 2024\nISO 27001: Certified June 2024\nISO 13485 (Medical Device QMS): In progress, target Q2 2025\nCyber Essentials Plus: Certified March 2024\nGDPR/UK DPA compliance: Ongoing, DPO appointed",
          complianceTimeline: "Q1 2025: UK CA Marking approval, ISO 13485 certification\nQ2 2025: MHRA post-market surveillance plan implementation\nQ3 2025: FDA 510(k) submission for US market entry\nQ4 2025: EU MDR compliance for European expansion\nOngoing: Quarterly compliance audits, annual recertification, continuous DTAC compliance monitoring",
          complianceBudget: 95000,
          hiringPlan: "Year 1 (UK-based, London HQ):\n- Q1: 2 ML Engineers (£80-100k), 1 Clinical Specialist (£70-90k)\n- Q2: 2 Sales Representatives (£50-70k + commission), 1 DevOps Engineer (£75-95k)\n- Q3: 1 Product Manager (£70-90k), 1 Customer Success Manager (£45-60k)\n- Q4: 2 ML Engineers, 1 QA Engineer (£55-70k)\nTotal Year 1: 15 new UK employees, £1.1M annual payroll",
          specificRegions: "HQ: London (Shoreditch Tech City) - existing office, 2,500 sq ft\nSales Office: Manchester - planned Q3 2025, targeting Northern Trusts\nR&D Hub: Cambridge - partnership with University, shared space\nAll UK employees with right to work, no visa sponsorship required initially",
          internationalPlan: "Phase 1 (Year 2): Ireland expansion - leverage EU data adequacy, similar healthcare system, low-risk market entry. Establish Dublin sales office.\nPhase 2 (Year 2-3): Nordic markets (Denmark, Sweden, Norway) - strong digital health infrastructure, English proficiency.\nPhase 3 (Year 3-5): Germany and US - larger markets requiring local certification and sales teams.",
          targetEndorser: "Primary: Tech Nation (endorsed by NHS Digital and Health Innovation Network)\nSecondary: SETsquared Partnership (university-backed, strong healthcare portfolio)\nRationale: Tech Nation's healthcare track record (15+ successful visa applications in health tech), strong NHS relationships, and dedicated health tech support team align perfectly with our profile.",
          contactPointsStrategy: "1) Tech Nation: Attended 2 Tech Nation events, connected with 3 portfolio founders, scheduled intro call with healthcare sector lead (Sarah Mitchell)\n2) NHS Digital connection: Our pilot programme lead (Dr. James Roberts) serves on Tech Nation advisory board\n3) Warm introductions: 2 existing Tech Nation endorsed founders offered to provide referrals\n4) Supporting evidence prepared: NHS deployment metrics, revenue documentation, patent applications",
          supportingEvidence: "Comprehensive evidence package prepared:\n- NHS Trust deployment agreements (4 signed contracts)\n- Letters of Intent (5 documents, £1.2M value)\n- Patent applications (3 pending UK patents)\n- Financial statements (audited, 12 months revenue)\n- Customer testimonials (12 NHS clinician endorsements)\n- Press coverage (BBC, BMJ, The Guardian)\n- Award certificates (NHS Innovation Award 2024)\n- Technical certifications (ISO 27001, CE Mark, DTAC)",
          userId: demoUser.id,
          isDemoData: true,
        });
        
        // Update the plan status separately (since status is omitted from insert schema)
        await storage.updateBusinessPlan(demoPlan.id, { status: 'completed' });
      }
      
      // Create demo documents for the demo user
      const documentCategories = [
        { 
          category: "passport",
          name: "UK Passport - Sarah Chen",
          description: "Valid UK passport, expires December 2032",
          fileType: "application/pdf",
          fileSize: 2456000,
          status: "verified",
          expiryDate: new Date("2032-12-15")
        },
        {
          category: "passport", 
          name: "Chinese Passport (Original)",
          description: "Original passport showing travel history and previous visas",
          fileType: "application/pdf",
          fileSize: 3120000,
          status: "verified",
          expiryDate: new Date("2028-08-20")
        },
        {
          category: "bank_statement",
          name: "Barclays Business Account - 12 Months",
          description: "Business account statements showing £285,000 revenue and healthy cash flow",
          fileType: "application/pdf",
          fileSize: 1850000,
          status: "verified"
        },
        {
          category: "bank_statement",
          name: "HSBC Personal Account - 6 Months",
          description: "Personal savings showing £125,000 available funds",
          fileType: "application/pdf",
          fileSize: 980000,
          status: "verified"
        },
        {
          category: "business_plan",
          name: "MedTech AI Solutions - Full Business Plan",
          description: "Comprehensive 45-page business plan with financial projections",
          fileType: "application/pdf",
          fileSize: 8500000,
          status: "verified"
        },
        {
          category: "business_registration",
          name: "Companies House Certificate",
          description: "Certificate of Incorporation - Company No. 12345678",
          fileType: "application/pdf",
          fileSize: 450000,
          status: "verified"
        },
        {
          category: "tax_documents",
          name: "HMRC Corporation Tax Return 2023-24",
          description: "Filed corporation tax return showing business activity",
          fileType: "application/pdf",
          fileSize: 1200000,
          status: "verified"
        },
        {
          category: "contracts",
          name: "NHS Trust Pilot Agreement - Guy's & St Thomas'",
          description: "Signed 18-month pilot programme agreement",
          fileType: "application/pdf",
          fileSize: 2100000,
          status: "verified"
        },
        {
          category: "contracts",
          name: "Letter of Intent - Manchester University NHS",
          description: "LOI for £300,000/year deployment commitment",
          fileType: "application/pdf",
          fileSize: 680000,
          status: "verified"
        },
        {
          category: "qualifications",
          name: "PhD Certificate - University of Cambridge",
          description: "Doctor of Philosophy in Computer Vision, 2012",
          fileType: "application/pdf",
          fileSize: 890000,
          status: "verified"
        },
        {
          category: "qualifications",
          name: "MSc Certificate - Imperial College London",
          description: "Master of Science in Artificial Intelligence, 2008",
          fileType: "application/pdf",
          fileSize: 750000,
          status: "verified"
        },
        {
          category: "patent_documents",
          name: "UK Patent Application GB2023/001234",
          description: "Multi-cancer detection ensemble methodology patent",
          fileType: "application/pdf",
          fileSize: 3400000,
          status: "pending"
        },
        {
          category: "endorsement",
          name: "Tech Nation Endorsement Application",
          description: "Complete endorsement application with supporting evidence",
          fileType: "application/pdf",
          fileSize: 5600000,
          status: "pending"
        },
        {
          category: "reference_letters",
          name: "Reference - Prof. David Williams, Cambridge",
          description: "Academic reference from PhD supervisor",
          fileType: "application/pdf",
          fileSize: 420000,
          status: "verified"
        },
        {
          category: "reference_letters",
          name: "Reference - NHS Trust Medical Director",
          description: "Professional reference from pilot programme stakeholder",
          fileType: "application/pdf",
          fileSize: 380000,
          status: "verified"
        },
        {
          category: "press_coverage",
          name: "BBC News Article - AI Cancer Detection",
          description: "Media coverage of our NHS pilot success",
          fileType: "application/pdf",
          fileSize: 1100000,
          status: "verified"
        },
        {
          category: "awards",
          name: "NHS Innovation Award Certificate 2024",
          description: "Recognition for healthcare innovation excellence",
          fileType: "image/png",
          fileSize: 2800000,
          status: "verified"
        },
        {
          category: "financial_projections",
          name: "5-Year Financial Model",
          description: "Detailed Excel model with revenue projections and unit economics",
          fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          fileSize: 1500000,
          status: "verified"
        }
      ];
      
      // Clear existing demo user documents and create new ones
      const existingDocs = await storage.getUserDocuments(demoUser.id);
      for (const doc of existingDocs) {
        await storage.deleteUserDocument(doc.id);
      }
      
      for (const docData of documentCategories) {
        await storage.createUserDocument({
          userId: demoUser.id,
          name: docData.name,
          category: docData.category,
          description: docData.description,
          fileUrl: `/demo-files/${docData.category}/${docData.name.toLowerCase().replace(/\s+/g, '-')}.${docData.fileType.split('/')[1]}`,
          fileType: docData.fileType,
          fileSize: docData.fileSize,
          status: docData.status as 'pending' | 'verified' | 'rejected',
          expiryDate: docData.expiryDate,
        });
      }
      
      // Create demo tool analytics
      const demoTools = [
        "business-plan", "pitch-coach", "innovation-score", "financial-projections",
        "compliance-xray", "interview-prep", "exec-summary", "pitch-deck",
        "market-analysis", "competitor-mapping", "team-builder", "visa-checklist"
      ];
      
      for (const toolId of demoTools) {
        for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
          await storage.createToolAnalytic({
            userId: demoUser.id,
            toolId,
            action: ['access', 'save', 'export'][Math.floor(Math.random() * 3)],
            metadata: { 
              source: 'demo-seed',
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: "Comprehensive demo data created successfully",
        demoUser: {
          id: demoUser.id,
          email: demoUser.email,
          name: `${demoUser.firstName} ${demoUser.lastName}`,
          tier: demoUser.subscriptionTier
        },
        documentsCreated: documentCategories.length,
        toolAnalyticsCreated: demoTools.length * 7.5 // average
      });
    } catch (error) {
      console.error("Seed demo data error:", error);
      res.status(500).json({ error: "Failed to seed demo data", details: String(error) });
    }
  });
  
  // Get demo user's data (for sample plans modal)
  app.get("/api/demo-plans", async (req, res) => {
    try {
      const demoPlans = await storage.getDemoBusinessPlans();
      res.json(demoPlans);
    } catch (error) {
      console.error("Get demo plans error:", error);
      res.status(500).json({ error: "Failed to get demo plans" });
    }
  });

  // ============================================
  // PREMIUM VALUE FEATURES API ROUTES
  // ============================================

  // Notification Preferences
  app.get("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { getNotificationPreferences } = await import("./services/notificationService");
      const prefs = await getNotificationPreferences(user.id);
      res.json(prefs || {
        weeklyDigest: true,
        deadlineReminders: true,
        breakingNewsAlerts: true,
        toolCompletionCelebrations: true,
        progressMilestones: true,
        digestFrequency: 'weekly',
        preferredTime: '09:00'
      });
    } catch (error) {
      console.error("Get notification preferences error:", error);
      res.status(500).json({ error: "Failed to get preferences" });
    }
  });

  app.put("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { updateNotificationPreferences } = await import("./services/notificationService");
      const updated = await updateNotificationPreferences(user.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update notification preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Achievements
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { getUserAchievements, getAllAchievements, getUserPoints } = await import("./services/achievementService");
      const [userAchievements, allAchievements, points] = await Promise.all([
        getUserAchievements(user.id),
        getAllAchievements(),
        getUserPoints(user.id)
      ]);
      res.json({ userAchievements, allAchievements, totalPoints: points });
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });

  app.post("/api/achievements/check", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { checkAndAwardAchievements } = await import("./services/achievementService");
      const newlyEarned = await checkAndAwardAchievements(user.id, req.body);
      res.json({ newlyEarned, count: newlyEarned.length });
    } catch (error) {
      console.error("Check achievements error:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Certificates
  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { getUserCertificates } = await import("./services/achievementService");
      const certificates = await getUserCertificates(user.id);
      res.json(certificates);
    } catch (error) {
      console.error("Get certificates error:", error);
      res.status(500).json({ error: "Failed to get certificates" });
    }
  });

  app.get("/api/certificates/verify/:number", async (req, res) => {
    try {
      const { verifyCertificate } = await import("./services/achievementService");
      const result = await verifyCertificate(req.params.number);
      if (!result) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Verify certificate error:", error);
      res.status(500).json({ error: "Failed to verify certificate" });
    }
  });

  // Document Reviews
  app.post("/api/document-reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { createDocumentReview } = await import("./services/documentReviewService");
      const review = await createDocumentReview({
        userId: user.id,
        ...req.body
      });
      res.json(review);
    } catch (error) {
      console.error("Create document review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/document-reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { getUserDocumentReviews, getDocumentReviewStats } = await import("./services/documentReviewService");
      const [reviews, stats] = await Promise.all([
        getUserDocumentReviews(user.id),
        getDocumentReviewStats(user.id)
      ]);
      res.json({ reviews, stats });
    } catch (error) {
      console.error("Get document reviews error:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  app.get("/api/document-reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const { getDocumentReview } = await import("./services/documentReviewService");
      const review = await getDocumentReview(req.params.id);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Get document review error:", error);
      res.status(500).json({ error: "Failed to get review" });
    }
  });

  // Interview Practice
  app.post("/api/interview-sessions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { createInterviewSession } = await import("./services/interviewService");
      const session = await createInterviewSession({
        userId: user.id,
        sessionType: req.body.sessionType || 'endorser_pitch'
      });
      res.json(session);
    } catch (error) {
      console.error("Create interview session error:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/interview-sessions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { getUserInterviewSessions, getInterviewStats } = await import("./services/interviewService");
      const [sessions, stats] = await Promise.all([
        getUserInterviewSessions(user.id),
        getInterviewStats(user.id)
      ]);
      res.json({ sessions, stats });
    } catch (error) {
      console.error("Get interview sessions error:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.get("/api/interview-sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const { getInterviewSession } = await import("./services/interviewService");
      const session = await getInterviewSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Get interview session error:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.post("/api/interview-sessions/:id/respond", isAuthenticated, async (req, res) => {
    try {
      const { submitResponse } = await import("./services/interviewService");
      const result = await submitResponse(req.params.id, req.body.questionIndex, req.body.response);
      res.json(result);
    } catch (error) {
      console.error("Submit response error:", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  app.post("/api/interview-sessions/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const { completeInterviewSession } = await import("./services/interviewService");
      const session = await completeInterviewSession(req.params.id);
      res.json(session);
    } catch (error) {
      console.error("Complete interview session error:", error);
      res.status(500).json({ error: "Failed to complete session" });
    }
  });

  // Success Stories - with tier-based access
  app.get("/api/success-stories", async (req, res) => {
    try {
      let userTier = 'free';
      if (req.isAuthenticated() && req.user) {
        const user = req.user as any;
        const [userInfo] = await db.select().from(users).where(eq(users.id, user.id));
        userTier = userInfo?.subscriptionTier || 'free';
      }
      
      const stories = await db.select()
        .from(successStories)
        .where(eq(successStories.isPublished, true))
        .orderBy(successStories.publishedAt);
      
      const TIER_ORDER = ['free', 'basic', 'premium', 'enterprise', 'ultimate'];
      const userTierIndex = TIER_ORDER.indexOf(userTier);
      
      const accessibleStories = stories.map(story => {
        const storyTierIndex = TIER_ORDER.indexOf(story.requiredTier);
        const hasAccess = userTierIndex >= storyTierIndex;
        
        return {
          id: story.id,
          title: story.title,
          applicantAlias: story.applicantAlias,
          industry: story.industry,
          endorserBody: story.endorserBody,
          timeToApproval: story.timeToApproval,
          summary: story.summary,
          requiredTier: story.requiredTier,
          hasAccess,
          fullStory: hasAccess ? story.fullStory : null,
          keySuccessFactors: hasAccess ? story.keySuccessFactors : null,
          adviceGiven: hasAccess ? story.adviceGiven : null,
          lessonsLearned: hasAccess ? story.lessonsLearned : null,
          challengesFaced: hasAccess ? story.challengesFaced : null,
        };
      });
      
      res.json(accessibleStories);
    } catch (error) {
      console.error("Get success stories error:", error);
      res.status(500).json({ error: "Failed to get stories" });
    }
  });

  app.get("/api/success-stories/:id", async (req, res) => {
    try {
      const [story] = await db.select()
        .from(successStories)
        .where(and(
          eq(successStories.id, req.params.id),
          eq(successStories.isPublished, true)
        ));
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      console.error("Get success story error:", error);
      res.status(500).json({ error: "Failed to get story" });
    }
  });

  // Document Templates - with tier gating
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const [userInfo] = await db.select().from(users).where(eq(users.id, user.id));
      const tier = userInfo?.subscriptionTier || 'free';
      
      const templates = await db.select()
        .from(documentTemplates)
        .where(eq(documentTemplates.isActive, true))
        .orderBy(documentTemplates.category);
      
      const TIER_ORDER = ['free', 'basic', 'premium', 'enterprise', 'ultimate'];
      const userTierIndex = TIER_ORDER.indexOf(tier);
      
      const accessibleTemplates = templates.map(template => {
        const templateTierIndex = TIER_ORDER.indexOf(template.requiredTier);
        return {
          ...template,
          isAccessible: userTierIndex >= templateTierIndex
        };
      });
      
      res.json(accessibleTemplates);
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({ error: "Failed to get templates" });
    }
  });

  app.get("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const [template] = await db.select()
        .from(documentTemplates)
        .where(eq(documentTemplates.id, req.params.id));
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Get template error:", error);
      res.status(500).json({ error: "Failed to get template" });
    }
  });

  app.post("/api/templates/:id/download", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      await db.update(documentTemplates)
        .set({ downloadCount: sql`${documentTemplates.downloadCount} + 1` })
        .where(eq(documentTemplates.id, req.params.id));

      await db.insert(userTemplateDownloads).values({
        userId: user.id,
        templateId: req.params.id,
        customizations: req.body.customizations || null
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Download template error:", error);
      res.status(500).json({ error: "Failed to record download" });
    }
  });

  // Calendar Events (local tracking, not synced to external calendar)
  app.get("/api/calendar-events", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const events = await db.select()
        .from(calendarEvents)
        .where(eq(calendarEvents.userId, user.id))
        .orderBy(calendarEvents.startDate);
      res.json(events);
    } catch (error) {
      console.error("Get calendar events error:", error);
      res.status(500).json({ error: "Failed to get events" });
    }
  });

  app.post("/api/calendar-events", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const [event] = await db.insert(calendarEvents).values({
        userId: user.id,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      }).returning();
      res.json(event);
    } catch (error) {
      console.error("Create calendar event error:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.delete("/api/calendar-events/:id", isAuthenticated, async (req, res) => {
    try {
      await db.delete(calendarEvents).where(eq(calendarEvents.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete calendar event error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Generate ICS file for calendar export
  app.get("/api/calendar-events/export", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const events = await db.select()
        .from(calendarEvents)
        .where(eq(calendarEvents.userId, user.id))
        .orderBy(calendarEvents.startDate);

      let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UK Innovator Founder Visa Assistant//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

      for (const event of events) {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 3600000);
        
        const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        icsContent += `BEGIN:VEVENT
UID:${event.id}@innovatorfoundervisaassistant.co.uk
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}
END:VEVENT
`;
      }

      icsContent += 'END:VCALENDAR';

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="visa-journey-calendar.ics"');
      res.send(icsContent);
    } catch (error) {
      console.error("Export calendar error:", error);
      res.status(500).json({ error: "Failed to export calendar" });
    }
  });

  // Support SLA info
  app.get("/api/support/sla", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const [userInfo] = await db.select().from(users).where(eq(users.id, user.id));
      const tier = userInfo?.subscriptionTier || 'free';
      
      const [sla] = await db.select()
        .from(supportSLA)
        .where(eq(supportSLA.tier, tier));
      
      res.json(sla || {
        tier: 'free',
        firstResponseTime: 72,
        resolutionTime: 168,
        priorityLevel: 0,
        dedicatedAgent: false,
        callbackAvailable: false,
        liveChat: false
      });
    } catch (error) {
      console.error("Get SLA error:", error);
      res.status(500).json({ error: "Failed to get SLA info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
