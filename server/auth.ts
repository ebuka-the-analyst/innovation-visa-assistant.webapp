import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { verifyTurnstileToken } from "./turnstile";
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail, sendPasswordResetEmail, getResetTokenExpiry, sendWelcomeEmail } from "./email";
import { db } from "./db";
import { securityEvents } from "@shared/schema";

// Helper function to log security events
async function logSecurityEvent(
  eventType: string,
  description: string,
  severity: string = 'low',
  userEmail?: string | null,
  ipAddress?: string | null,
  userAgent?: string | null,
  metadata?: any
) {
  try {
    await db.insert(securityEvents).values({
      eventType,
      severity,
      userEmail,
      ipAddress,
      userAgent,
      description,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Use SESSION_SECRET from environment, or generate a warning with fallback
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.warn("[Auth] WARNING: SESSION_SECRET not set. Using fallback secret. Set SESSION_SECRET in production!");
  }
  
  return session({
    secret: sessionSecret || 'ukivfa-fallback-session-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

interface User {
  id: string;
  email: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  subscriptionTier?: string;
  subscriptionStatus?: string;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Local Strategy (email/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Normalize email to lowercase for case-insensitive lookup
          const normalizedEmail = email.toLowerCase().trim();
          const user = await storage.getUserByEmail(normalizedEmail);
          
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Check if user only has Google OAuth (no password set)
          if (user.googleId && !user.password) {
            return done(null, false, { 
              message: "This account uses Google sign-in. Please use 'Continue with Google' to sign in."
            });
          }

          // Check if user has password
          if (!user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // BLOCK login if email is not verified
          if (!user.isEmailVerified) {
            return done(null, false, { 
              message: "VERIFICATION_REQUIRED:" + user.email
            });
          }
          
          // Return user ID for session serialization (passport will call serializeUser)
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Configure Google OAuth Strategy (only if credentials are available)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/callback/google",
          scope: ["profile", "email"],
        },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          const normalizedEmail = email.toLowerCase().trim();

          // Check if user already exists
          const existingUser = await storage.getUserByEmail(normalizedEmail);

          if (existingUser) {
            // User exists - link Google account if not already linked
            if (!existingUser.googleId) {
              // Link Google account to existing email/password account
              const updatedUser = await storage.updateUserGoogleId(existingUser.id, profile.id, {
                firstName: profile.name?.givenName || existingUser.firstName,
                lastName: profile.name?.familyName || existingUser.lastName,
                profileImageUrl: profile.photos?.[0]?.value || existingUser.profileImageUrl,
              });
              return done(null, updatedUser);
            } else {
              // Already has Google linked - just update profile info
              const updatedUser = await storage.updateUserGoogleId(existingUser.id, profile.id, {
                firstName: profile.name?.givenName || existingUser.firstName,
                lastName: profile.name?.familyName || existingUser.lastName,
                profileImageUrl: profile.photos?.[0]?.value || existingUser.profileImageUrl,
              });
              return done(null, updatedUser);
            }
          }

          // New user - create with Google OAuth (auto-verify Google accounts)
          const user = await storage.upsertUser({
            email: normalizedEmail,
            googleId: profile.id,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
            isEmailVerified: true, // Google accounts are pre-verified
          });

          // Return user for session serialization (passport will store only ID)
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
    console.log("[Auth] Google OAuth configured successfully");
  } else {
    console.log("[Auth] Google OAuth NOT configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  // Serialize only userId for security (don't store full user object in session)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize by fetching from database
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Return session user without password - includes subscription data for tier access
      const sessionUser: User = {
        id: user.id,
        email: user.email!,
        displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email!,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin || false,
        isEmailVerified: user.isEmailVerified || false,
        subscriptionTier: user.subscriptionTier || "free",
        subscriptionStatus: user.subscriptionStatus || "inactive",
      };
      done(null, sessionUser);
    } catch (error) {
      done(error);
    }
  });

  // Email/Password Registration with validation
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, referralCode } = req.body;

      // Turnstile removed for better user experience
      // (Bot protection can be added later if needed)

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password strength (minimum 6 characters)
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user exists (case-insensitive email check)
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        // User exists - check which auth method they used
        if (existingUser.googleId && !existingUser.password) {
          // User signed up with Google only
          return res.status(400).json({ 
            message: "An account with this email already exists. You signed up using Google. Please use 'Continue with Google' to sign in.",
            authMethod: "google"
          });
        } else if (existingUser.password) {
          // User has password (might also have Google)
          return res.status(400).json({ 
            message: "Email already registered. Please sign in instead.",
            authMethod: "password"
          });
        }
      }

      // Hash password with bcrypt (cost factor 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate email verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = getTokenExpiry();

      // Create user with verification token
      const newUser = await storage.createUser({
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName?.trim() || "",
        lastName: lastName?.trim() || "",
        verificationToken,
        tokenExpiry,
        isEmailVerified: false,
      });

      // If referral code is provided, create a referral event record
      if (referralCode) {
        try {
          const referralCodeRecord = await storage.getReferralCodeByCode(referralCode.toUpperCase());
          if (referralCodeRecord && referralCodeRecord.status === 'active') {
            // Create referral event record
            await storage.createReferralEvent({
              referralCodeId: referralCodeRecord.id,
              referrerId: referralCodeRecord.userId,
              refereeId: newUser.id,
              refereeEmail: normalizedEmail,
              status: 'signed_up',
              signedUpAt: new Date(),
            });

            // Increment pending referrals count on the referral code
            await storage.incrementReferralStats(referralCodeRecord.id, 'pendingReferrals', 1);

            // Send notification to referrer about new signup
            const referrer = await storage.getUser(referralCodeRecord.userId);
            if (referrer?.email) {
              try {
                const { sendReferralSignupNotification } = await import('./email');
                await sendReferralSignupNotification(
                  referrer.email,
                  referrer.firstName || 'there',
                  firstName || normalizedEmail.split('@')[0],
                  referralCodeRecord.code
                );
              } catch (emailError) {
                console.error("Failed to send referral signup notification:", emailError);
              }
            }
          }
        } catch (refError) {
          console.error("Error processing referral code:", refError);
          // Don't fail registration if referral processing fails
        }
      }

      // Send verification email
      let emailSent = false;
      try {
        const result = await sendVerificationEmail(normalizedEmail, firstName || "there", verificationToken);
        emailSent = result.success;
        if (!result.success) {
          console.error("Failed to send verification email:", result.error);
        }
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      // DO NOT log user in - they must verify email first
      // Return success without creating a session
      const { password: _, ...safeUser } = newUser;
      res.json({ 
        success: true, 
        user: safeUser,
        message: emailSent 
          ? "Account created! Please check your email to verify your account before logging in."
          : "Account created! However, we couldn't send the verification email. Please contact support@innovatorfoundervisaassistant.co.uk for assistance.",
        requiresVerification: true
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  // Email/Password Login
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { email } = req.body;
      const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      
      // Turnstile is optional for login (bot protection is more critical for signup)
      // Authenticate user directly
      passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
          console.error("Passport authentication error:", err);
          return res.status(500).json({ message: "Authentication error: " + (err.message || "Unknown error") });
        }
        if (!user) {
          // Log failed login attempt as security event
          await logSecurityEvent(
            'failed_login',
            `Failed login attempt for email: ${email || 'unknown'}`,
            'medium',
            email || null,
            ipAddress,
            userAgent,
            { reason: info?.message || 'Invalid credentials' }
          );
          
          // Check if this is a verification required case
          const message = info?.message || "Invalid credentials";
          if (message.startsWith("VERIFICATION_REQUIRED:")) {
            const verifyEmail = message.split(":")[1];
            return res.status(403).json({ 
              message: "Please verify your email before logging in. Check your inbox for the verification link.",
              requiresVerification: true,
              email: verifyEmail 
            });
          }
          return res.status(401).json({ message });
        }
        req.login({ id: user.id }, (loginErr) => {
          if (loginErr) {
            console.error("Session login error:", loginErr);
            return res.status(500).json({ message: "Login failed: " + (loginErr.message || "Session error") });
          }
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("Session save error:", saveErr);
              // Still return success since login worked, session might persist on next request
            }
            // Return user without password
            const { password: _, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
          });
        });
      })(req, res, next);
    } catch (error: any) {
      console.error("Login route error:", error);
      res.status(500).json({ message: "Login failed: " + (error.message || "Unknown error") });
    }
  });

  // Google OAuth routes (only if Google OAuth is configured)
  if (googleClientId && googleClientSecret) {
    app.get("/api/auth/google", passport.authenticate("google", { prompt: "select_account" }));

    app.get(
      "/api/auth/callback/google",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        // Explicitly save session before redirecting
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          res.redirect("/dashboard");
        });
      }
    );
  } else {
    // Return error if Google OAuth is not configured
    app.get("/api/auth/google", (req, res) => {
      res.status(503).json({ message: "Google login is not configured on this server" });
    });
    app.get("/api/auth/callback/google", (req, res) => {
      res.status(503).json({ message: "Google login is not configured on this server" });
    });
  }

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const sessionUser = req.user as User;
    // Fetch fresh user data to ensure isAdmin is up-to-date
    const freshUser = await storage.getUser(sessionUser.id);
    if (freshUser) {
      const tierToReturn = freshUser.subscriptionTier || "free";
      console.log(`[AUTH] Returning user ${freshUser.email} with subscriptionTier: ${tierToReturn} (raw: ${freshUser.subscriptionTier})`);
      res.json({
        id: freshUser.id,
        email: freshUser.email,
        displayName: `${freshUser.firstName || ""} ${freshUser.lastName || ""}`.trim() || freshUser.email,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        profileImageUrl: freshUser.profileImageUrl,
        isAdmin: freshUser.isAdmin || false,
        isEmailVerified: freshUser.isEmailVerified || false,
        subscriptionTier: tierToReturn,
        subscriptionStatus: freshUser.subscriptionStatus || "inactive",
      });
    } else {
      res.json(sessionUser);
    }
  });

  // Logout routes (both GET and POST)
  const handleLogout = (req: any, res: any) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        // For POST requests (from API calls), return JSON
        if (req.method === 'POST') {
          res.json({ success: true, redirectUrl: "/" });
        } else {
          // For GET requests, redirect directly
          res.redirect("/");
        }
      });
    });
  };

  app.get("/api/logout", handleLogout);
  app.post("/api/auth/logout", handleLogout);

  // Email Verification Route
  app.get("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ message: "Verification token required" });
      }

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      // Check if token is expired
      if (user.tokenExpiry && new Date() > new Date(user.tokenExpiry)) {
        return res.status(400).json({ message: "Verification link expired. Please request a new one." });
      }

      // Verify the user
      await storage.verifyUserEmail(user.id);

      // Send welcome email after successful verification
      try {
        await sendWelcomeEmail(user.email!, user.firstName || "there");
      } catch (emailError) {
        // Don't fail verification if welcome email fails
        console.error("Failed to send welcome email:", emailError);
      }

      res.json({ 
        success: true, 
        message: "Email verified successfully! You can now access all features."
      });
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Resend Verification Email
  app.post("/api/auth/resend-verification", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Get full user data from storage
      const fullUser = await storage.getUser(user.id);

      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (fullUser.isEmailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = getTokenExpiry();

      // Update user with new token
      await storage.updateVerificationToken(fullUser.id, verificationToken, tokenExpiry);

      // Send verification email
      await sendVerificationEmail(
        fullUser.email!,
        fullUser.firstName || "there",
        verificationToken
      );

      res.json({ 
        success: true, 
        message: "Verification email sent! Please check your inbox."
      });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Resend Verification Email (public - for login page)
  app.post("/api/auth/resend-verification-public", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await storage.getUserByEmail(normalizedEmail);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          success: true, 
          message: "If that email exists and is unverified, a verification email has been sent."
        });
      }

      if (user.isEmailVerified) {
        return res.json({ 
          success: true, 
          message: "Email is already verified. You can log in now."
        });
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = getTokenExpiry();

      // Update user with new token
      await storage.updateVerificationToken(user.id, verificationToken, tokenExpiry);

      // Send verification email
      await sendVerificationEmail(
        user.email!,
        user.firstName || "there",
        verificationToken
      );

      res.json({ 
        success: true, 
        message: "Verification email sent! Please check your inbox."
      });
    } catch (error: any) {
      console.error("Resend verification (public) error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Request Password Reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await storage.getUserByEmail(normalizedEmail);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          success: true, 
          message: "If that email exists, a password reset link has been sent."
        });
      }

      // Check if user only has Google OAuth (no password to reset)
      if (user.googleId && !user.password) {
        return res.json({ 
          success: true, 
          message: "This account uses Google sign-in. Please use 'Continue with Google' to sign in."
        });
      }

      // Generate reset token
      const resetToken = generateVerificationToken();
      const resetTokenExpiry = getResetTokenExpiry();

      // Save reset token to database
      await storage.updateResetToken(user.id, resetToken, resetTokenExpiry);

      // Send reset email
      await sendPasswordResetEmail(
        user.email!,
        user.firstName || "there",
        resetToken
      );

      res.json({ 
        success: true, 
        message: "If that email exists, a password reset link has been sent."
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Verify Reset Token
  app.get("/api/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ valid: false, message: "Reset token required" });
      }

      const user = await storage.getUserByResetToken(token);

      if (!user) {
        return res.status(400).json({ valid: false, message: "Invalid or expired reset link" });
      }

      // Check if token is expired
      if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ valid: false, message: "Reset link expired. Please request a new one." });
      }

      res.json({ valid: true, email: user.email });
    } catch (error: any) {
      console.error("Token verification error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify reset token" });
    }
  });

  // Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const user = await storage.getUserByResetToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      // Check if token is expired
      if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Reset link expired. Please request a new one." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await storage.updatePassword(user.id, hashedPassword);
      await storage.clearResetToken(user.id);

      res.json({ 
        success: true, 
        message: "Password reset successful! You can now log in with your new password."
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Get full user data
  const userId = (req.user as any).id;
  const fullUser = await storage.getUser(userId);
  
  if (!fullUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if user is banned
  if (fullUser.isBanned) {
    return res.status(403).json({ 
      message: "Your account has been suspended. Please contact support for assistance."
    });
  }
  
  // Check if user is suspended (temporary)
  if (fullUser.suspendedUntil && new Date() < new Date(fullUser.suspendedUntil)) {
    const suspendedUntilDate = new Date(fullUser.suspendedUntil).toLocaleDateString('en-GB');
    return res.status(403).json({ 
      message: `Your account is temporarily suspended until ${suspendedUntilDate}. Reason: ${fullUser.suspendedReason || 'Not specified'}`
    });
  }
  
  // Enforce email verification for authenticated routes
  if (!fullUser.isEmailVerified) {
    return res.status(403).json({ 
      message: "Please verify your email to access this feature.",
      requiresVerification: true 
    });
  }
  
  return next();
};

// Admin-only middleware - requires authentication and admin flag
export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  // Get full user data to check admin status
  const userId = (req.user as any).id;
  const fullUser = await storage.getUser(userId);
  
  if (!fullUser) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  // Check if user is admin
  if (!fullUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  return next();
};
