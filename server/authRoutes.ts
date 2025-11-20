import type { Express } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { signupSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

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
      
      const user = await storage.createUser({
        email: validated.email,
        password: hashedPassword,
        displayName: validated.displayName,
        googleId: null,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after signup" });
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
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
    "/api/auth/google/callback",
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
