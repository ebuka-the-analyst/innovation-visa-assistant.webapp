import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import type { Express } from "express";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (email/password)
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (!user.password) {
            return done(null, false, { message: "Please use Google login for this account" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Auto-detect callback URL based on environment
  let callbackURL = process.env.GOOGLE_CALLBACK_URL;
  if (!callbackURL) {
    if (process.env.REPLIT_DOMAINS) {
      const domain = process.env.REPLIT_DOMAINS.split(",")[0];
      callbackURL = `https://${domain}/api/auth/callback/google`;
    } else {
      callbackURL = "http://localhost:5000/api/auth/callback/google";
    }
  }

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }

            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              user = await storage.getUserByEmail(email);
              
              if (user) {
                await storage.linkGoogleAccount(user.id, profile.id);
                // Verify email if not already verified (Google emails are trusted)
                if (!user.emailVerified) {
                  await storage.verifyUserEmail(user.id);
                }
              } else {
                // New Google user - create with verified email
                user = await storage.createUser({
                  email,
                  googleId: profile.id,
                  displayName: profile.displayName || email.split('@')[0],
                  password: null,
                  emailVerified: true, // Google emails are pre-verified
                  verificationCode: null,
                  codeExpiresAt: null,
                  lastCodeSentAt: null,
                  verificationAttempts: 0,
                });
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  app.use(passport.initialize());
  app.use(passport.session());
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}
