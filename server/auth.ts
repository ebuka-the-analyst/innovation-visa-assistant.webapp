import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { verifyTurnstileToken } from "./turnstile";
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from "./email";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
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
              message: "This account uses Google sign-in. Please use 'Continue with Google' to sign in.",
              authMethod: "google"
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

          // Return user ID for session serialization (passport will call serializeUser)
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      // Return session user without password
      const sessionUser: User = {
        id: user.id,
        email: user.email!,
        displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email!,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      };
      done(null, sessionUser);
    } catch (error) {
      done(error);
    }
  });

  // Email/Password Registration with validation
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, turnstileToken } = req.body;

      // Verify Cloudflare Turnstile token for bot protection
      if (turnstileToken) {
        const isValidToken = await verifyTurnstileToken(turnstileToken);
        if (!isValidToken) {
          return res.status(400).json({ message: "Bot verification failed. Please try again." });
        }
      }

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

      // Send verification email
      try {
        await sendVerificationEmail(normalizedEmail, firstName || "there", verificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
      }

      // Log user in automatically after registration (pass object with id for serializeUser)
      req.login({ id: newUser.id }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          // Return user without password
          const { password: _, ...safeUser } = newUser;
          res.json({ 
            success: true, 
            user: safeUser,
            message: "Account created! Please check your email to verify your account."
          });
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  // Email/Password Login
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { turnstileToken } = req.body;

      // Verify Cloudflare Turnstile token for bot protection
      if (turnstileToken) {
        const isValidToken = await verifyTurnstileToken(turnstileToken);
        if (!isValidToken) {
          return res.status(400).json({ message: "Bot verification failed. Please try again." });
        }
      }

      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "Authentication error" });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        req.login({ id: user.id }, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
            }
            // Return user without password
            const { password: _, ...safeUser } = user;
            res.json({ success: true, user: safeUser });
          });
        });
      })(req, res, next);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Google OAuth routes
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

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    res.json(req.user);
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
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
