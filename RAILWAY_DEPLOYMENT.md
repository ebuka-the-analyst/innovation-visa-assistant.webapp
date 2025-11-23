# Railway Deployment Guide

This guide explains how to deploy the UK Innovator Founder Visa Assistant to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. A Neon PostgreSQL database (or any PostgreSQL database)
3. Google Cloud Console project with OAuth 2.0 credentials
4. Stripe account for payments
5. OpenAI API key
6. Resend API key (for emails)

## Step 1: Prepare Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-railway-domain.up.railway.app/api/auth/google/callback`
7. Save the Client ID and Client Secret

## Step 2: Set Up Neon PostgreSQL Database

1. Create a Neon database at https://neon.tech
2. Copy the connection string (starts with `postgresql://`)
3. Run the database migration:
   ```bash
   npm run db:push
   ```

## Step 3: Configure Environment Variables in Railway

In your Railway project dashboard, add the following environment variables:

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/database

# Session
SESSION_SECRET=your-random-secure-string-here
NODE_ENV=production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-railway-domain.up.railway.app/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# OpenAI
OPENAI_API_KEY=sk-...

# Resend (Email)
RESEND_API_KEY=re_...

# PostgreSQL Connection Details (usually extracted from DATABASE_URL)
PGHOST=extracted-from-database-url
PGPORT=5432
PGUSER=extracted-from-database-url
PGPASSWORD=extracted-from-database-url
PGDATABASE=extracted-from-database-url
```

### Generate SESSION_SECRET

Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Configure Railway Build Settings

1. **Build Command:**
   ```bash
   npm install && npm run build
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Port:**
   Railway will automatically set the `PORT` environment variable. Your app is already configured to use it (defaults to 5000).

## Step 5: Deploy to Railway

### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically deploy on every push to main branch

### Option B: Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   railway init
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Step 6: Update Google OAuth Callback URL

Once deployed, Railway will provide you with a URL (e.g., `https://your-app.up.railway.app`).

1. Go back to Google Cloud Console
2. Update the authorized redirect URI to:
   ```
   https://your-app.up.railway.app/api/auth/google/callback
   ```
3. Update the `GOOGLE_CALLBACK_URL` environment variable in Railway

## Step 7: Update Stripe Webhook URLs

If you're using Stripe webhooks, update your webhook endpoints:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.up.railway.app/api/webhook/stripe`
3. Update `STRIPE_WEBHOOK_SECRET` in Railway if needed

## Step 8: Test Your Deployment

1. Visit your Railway URL
2. Click "Sign In" to test Google OAuth
3. Try creating a business plan
4. Test the payment flow with Stripe test mode

## Troubleshooting

### Application Failed to Respond

**Solution:** Check that all required environment variables are set correctly in Railway.

### OAuth Redirect Error

**Solution:** Ensure the `GOOGLE_CALLBACK_URL` matches exactly what's configured in Google Cloud Console.

### Database Connection Error

**Solution:**
- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Railway's IP addresses
- Check if you've run `npm run db:push` to create tables

### Session Issues

**Solution:**
- Verify `SESSION_SECRET` is set
- Check that `sessions` table exists in your database
- Ensure `NODE_ENV=production` is set

## Key Differences from Replit Deployment

1. **Authentication:** Uses Google OAuth instead of Replit Auth
2. **Environment Variables:** Must manually configure all env vars in Railway
3. **Database:** Uses external PostgreSQL (Neon) instead of Replit's built-in database
4. **Build Process:** Railway builds the app using `npm run build`
5. **Callback URLs:** Must explicitly set Google OAuth callback URL

## Architecture Changes for Railway

The following changes were made to support Railway deployment:

1. **Replaced Replit Auth with Google OAuth:**
   - Created `server/googleAuth.ts` using `passport-google-oauth20`
   - Removed dependency on `openid-client` and Replit-specific OIDC
   - Updated all routes to use `req.user.id` instead of `req.user.claims.sub`

2. **Session Management:**
   - Uses PostgreSQL session store (compatible with any Postgres database)
   - Configured for production environment (secure cookies, trust proxy)

3. **User Object Structure:**
   - Standard Google OAuth user: `{ id, email, displayName, firstName, lastName, profileImageUrl }`
   - No longer uses Replit-specific claims structure

## Cost Estimation

- **Railway:** ~$5-20/month (depends on usage)
- **Neon PostgreSQL:** Free tier available, paid plans from $20/month
- **Other services:** Stripe, OpenAI, Resend costs remain the same

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify all environment variables are set
3. Ensure database schema is up to date
4. Check Google OAuth console for authorization errors
