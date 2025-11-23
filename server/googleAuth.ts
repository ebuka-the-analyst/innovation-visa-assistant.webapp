import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

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

interface GoogleUser {
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

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          // Upsert user in database
          const user = await storage.upsertUser({
            id: profile.id,
            email: email,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
          });

          const googleUser: GoogleUser = {
            id: user.id || profile.id,
            email: user.email || email,
            displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
          };

          return done(null, googleUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Google OAuth routes
  app.get("/api/login", passport.authenticate("google", { prompt: "select_account" }));

  app.get(
    "/api/auth/google/callback",
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
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
