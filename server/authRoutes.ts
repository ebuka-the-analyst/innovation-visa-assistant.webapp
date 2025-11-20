import type { Express } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { signupSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { generateVerificationCode, generateVerificationEmail, sendEmail } from "./email";

export function setupAuthRoutes(app: Express) {
  // Sign up with email/password
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validated = signupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(validated.password, 10);
      const verificationCode = generateVerificationCode();
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      const user = await storage.createUser({
        email: validated.email,
        password: hashedPassword,
        displayName: validated.displayName,
        googleId: null,
        emailVerified: false,
        verificationCode,
        codeExpiresAt,
        lastCodeSentAt: new Date(),
        verificationAttempts: 0,
      });

      // Send verification email
      const emailHtml = generateVerificationEmail(verificationCode, validated.displayName);
      const emailResult = await sendEmail({
        to: validated.email,
        subject: "Verify your VisaPrep AI account",
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
      }

      res.json({ 
        success: true, 
        message: "Account created! Please check your email for verification code.",
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Verify email with code
  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ error: "Email and code required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      // Rate limiting - max 5 attempts
      if (user.verificationAttempts >= 5) {
        return res.status(429).json({ 
          error: "Too many verification attempts. Please request a new code." 
        });
      }

      // Check if code expired
      if (!user.codeExpiresAt || new Date() > user.codeExpiresAt) {
        return res.status(400).json({ 
          error: "Verification code expired. Please request a new one." 
        });
      }

      // Check if code matches
      if (user.verificationCode !== code) {
        await storage.incrementVerificationAttempts(user.id);
        return res.status(400).json({ 
          error: "Invalid verification code",
          attemptsLeft: 5 - (user.verificationAttempts + 1)
        });
      }

      // Verify the email
      await storage.verifyUserEmail(user.id);

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after verification" });
        }
        res.json({ 
          success: true, 
          message: "Email verified successfully!",
          user: { 
            id: user.id, 
            email: user.email, 
            displayName: user.displayName 
          } 
        });
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Resend verification code
  app.post("/api/auth/resend-code", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      // Rate limiting - max 1 email per 2 minutes
      if (user.lastCodeSentAt) {
        const timeSinceLastCode = Date.now() - user.lastCodeSentAt.getTime();
        const twoMinutes = 2 * 60 * 1000;
        
        if (timeSinceLastCode < twoMinutes) {
          const waitSeconds = Math.ceil((twoMinutes - timeSinceLastCode) / 1000);
          return res.status(429).json({ 
            error: `Please wait ${waitSeconds} seconds before requesting another code` 
          });
        }
      }

      // Generate new code
      const verificationCode = generateVerificationCode();
      const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      await storage.updateVerificationCode(user.id, verificationCode, codeExpiresAt);

      // Send email
      const emailHtml = generateVerificationEmail(verificationCode, user.displayName || "User");
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your new VisaPrep AI verification code",
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        return res.status(500).json({ error: "Failed to send verification email" });
      }

      res.json({ 
        success: true, 
        message: "New verification code sent to your email" 
      });
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ error: "Failed to resend code" });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            displayName: user.displayName 
          } 
        });
      });
    })(req, res, next);
  });

  // Google OAuth initiation
  app.get("/api/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"] 
  }));

  // Google OAuth callback
  app.get(
    "/api/auth/callback/google",
    passport.authenticate("google", { failureRedirect: "/login?error=google" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({ 
      id: user.id, 
      email: user.email, 
      displayName: user.displayName 
    });
  });
}
