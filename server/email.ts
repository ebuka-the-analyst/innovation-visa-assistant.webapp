import crypto from "crypto";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char);
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured. Email not sent.");
    console.log("Would have sent email to:", to);
    console.log("Subject:", subject);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UK Innovator Visa Assistant <noreply@innovatorfoundervisaassistant.co.uk>",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    console.log("Email sent successfully to:", to);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// New token-based verification utilities
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hour expiry
  return expiry;
}

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.BASE_URL || 'https://innovatorfoundervisaassistant.co.uk'
  : 'http://localhost:5000';

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your password for your UK Innovator Founder Visa Assistant account.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
          Click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #11b6e9; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffa536; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>This link expires in 1 hour</strong>
          </p>
        </div>
        
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #721c24;">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          Questions? Contact <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - UK Innovator Founder Visa Assistant',
    html
  });
}

export function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hour expiry for password resets
  return expiry;
}

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to UK Innovator Founder Visa Assistant</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for signing up! You're one step closer to your UK Innovator Founder Visa journey.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
          Please verify your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #11b6e9; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffa536; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>This link expires in 24 hours</strong>
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          Your trusted partner in visa success
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Verify your email - UK Innovator Founder Visa Assistant',
    html
  });
}

// Payment receipt email - PhD-level detailed receipt
export async function sendPaymentReceiptEmail(
  email: string,
  firstName: string,
  planName: string,
  amount: number,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const formattedAmount = (amount / 100).toFixed(2);
  const receiptNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const paymentDate = new Date();
  const formattedDate = paymentDate.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = paymentDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  // Get tier-specific features
  const tierFeatures: Record<string, { tools: number; features: string[] }> = {
    'Free': { tools: 13, features: ['Basic visa guidance tools', 'Essential compliance checklists', 'Community support'] },
    'Basic': { tools: 20, features: ['All Free tools', '7 additional business tools', 'Basic business plan template', 'Email support'] },
    'Premium': { tools: 83, features: ['All Basic tools', '63 premium AI-powered tools', 'Advanced business plan generator', 'Financial projections', 'Priority email support'] },
    'Enterprise': { tools: 109, features: ['All Premium tools', '26 enterprise-grade tools', 'Advanced IP & patent strategy', 'Full compliance suite', 'Dedicated support channel'] },
    'Ultimate': { tools: 109, features: ['All 109 tools unlocked', 'VIP priority support', 'Personal strategy sessions', 'Success guarantee', 'Lifetime updates'] }
  };
  
  const tierInfo = tierFeatures[planName] || tierFeatures['Premium'];
  const featuresHtml = tierInfo.features.map(f => `<li style="margin-bottom: 8px;">${f}</li>`).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      
      <!-- Header with Receipt Badge -->
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-bottom: 15px;">
          <span style="color: white; font-size: 14px; font-weight: 600;">PAYMENT RECEIPT</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Thank You for Your Purchase!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your subscription is now active</p>
      </div>
      
      <div style="background: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Greeting -->
        <p style="font-size: 18px; margin-bottom: 25px; color: #333;">Dear ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 25px; color: #555;">
          Thank you for subscribing to the UK Innovator Founder Visa Assistant. Your payment has been successfully processed and your account has been upgraded. You now have full access to all ${tierInfo.tools} tools included in your ${escapeHtml(planName)} tier.
        </p>
        
        <!-- Receipt Box -->
        <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; margin: 25px 0;">
          
          <!-- Receipt Header -->
          <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 20px; color: white;">
            <table style="width: 100%;">
              <tr>
                <td>
                  <span style="font-size: 12px; text-transform: uppercase; opacity: 0.8;">Receipt Number</span><br>
                  <span style="font-size: 16px; font-weight: bold; font-family: monospace;">${receiptNumber}</span>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 12px; text-transform: uppercase; opacity: 0.8;">Payment Status</span><br>
                  <span style="background: #27ae60; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">PAID</span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Receipt Details -->
          <div style="padding: 25px;">
            <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Subscription Plan:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">${escapeHtml(planName)} Tier Access</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Tools Included:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">${tierInfo.tools} Professional Tools</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Access Duration:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Lifetime Access</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Payment Date:</td>
                <td style="padding: 12px 0; text-align: right; color: #333; border-bottom: 1px solid #eee;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Payment Time:</td>
                <td style="padding: 12px 0; text-align: right; color: #333; border-bottom: 1px solid #eee;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Payment Method:</td>
                <td style="padding: 12px 0; text-align: right; color: #333; border-bottom: 1px solid #eee;">Credit/Debit Card (via Stripe)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;">Transaction ID:</td>
                <td style="padding: 12px 0; text-align: right; font-family: monospace; font-size: 11px; color: #666; border-bottom: 1px solid #eee; word-break: break-all;">${escapeHtml(sessionId)}</td>
              </tr>
            </table>
            
            <!-- Total Amount -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #ffa536;">
              <table style="width: 100%;">
                <tr>
                  <td style="font-size: 18px; font-weight: 700; color: #333;">Total Amount Paid:</td>
                  <td style="font-size: 24px; font-weight: 700; color: #ffa536; text-align: right;">£${formattedAmount} GBP</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        
        <!-- What's Included -->
        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); border: 1px solid #c8e6c9; border-radius: 10px; padding: 25px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">What's Included in Your ${escapeHtml(planName)} Tier:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 15px;">
            ${featuresHtml}
          </ul>
        </div>
        
        <!-- Access Your Tools CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/tools-hub" style="display: inline-block; background: linear-gradient(135deg, #ffa536 0%, #ff8c00 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255,165,54,0.4);">
            Access Your Tools Now
          </a>
        </div>
        
        <!-- Quick Start Tips -->
        <div style="background: #fff3e0; border-left: 4px solid #ffa536; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h4 style="margin: 0 0 12px 0; color: #e65100; font-size: 16px;">Quick Start Tips:</h4>
          <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
            <li style="margin-bottom: 8px;">Visit the <a href="${BASE_URL}/tools-hub" style="color: #11b6e9;">Tools Hub</a> to explore all available tools</li>
            <li style="margin-bottom: 8px;">Start with the <a href="${BASE_URL}/tools/innovation-score" style="color: #11b6e9;">Innovation Score Calculator</a> to assess your readiness</li>
            <li style="margin-bottom: 8px;">Generate your <a href="${BASE_URL}/tools/business-plan" style="color: #11b6e9;">Business Plan</a> for endorser applications</li>
            <li style="margin-bottom: 8px;">Practice your pitch with the <a href="${BASE_URL}/tools/pitch-coach" style="color: #11b6e9;">AI Pitch Coach</a></li>
          </ol>
        </div>
        
        <!-- Support Info -->
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #333;">
            <strong>Need Help?</strong> Our support team is here for you.
          </p>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Email: <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a><br>
            Billing: <a href="mailto:billing@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">billing@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
        
        <!-- Legal Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center;">
          <p style="font-size: 12px; color: #999; margin-bottom: 10px;">
            This receipt serves as confirmation of your payment. Please save this email for your records.
          </p>
          <p style="font-size: 12px; color: #999; margin-bottom: 10px;">
            UK Innovator Founder Visa Assistant<br>
            Digital Services Provider | United Kingdom
          </p>
          <p style="font-size: 11px; color: #bbb;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant. All rights reserved.<br>
            <a href="${BASE_URL}/privacy" style="color: #999;">Privacy Policy</a> | 
            <a href="${BASE_URL}/terms" style="color: #999;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send from billing@ for payment-related emails
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured. Email not sent.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UK Innovator Visa Assistant <billing@innovatorfoundervisaassistant.co.uk>",
        to: [email],
        subject: 'Payment Receipt - UK Innovator Founder Visa Assistant',
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    console.log("Payment receipt email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Welcome email sent after email verification
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${BASE_URL}/dashboard`;
  const toolsUrl = `${BASE_URL}/tools-hub`;
  const pricingUrl = `${BASE_URL}/pricing`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Your Visa Journey</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Congratulations! Your email is now verified and you have full access to the UK Innovator Founder Visa Assistant platform.
        </p>
        
        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Here's what you can do now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li>Access 109 PhD-level visa preparation tools</li>
            <li>Generate your comprehensive business plan</li>
            <li>Practice endorser interviews with AI coaching</li>
            <li>Track your visa readiness score</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;
                    margin: 5px;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${toolsUrl}" style="color: #11b6e9; margin: 0 15px;">Browse Tools</a>
          <a href="${pricingUrl}" style="color: #11b6e9; margin: 0 15px;">View Plans</a>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffa536; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>Pro Tip:</strong> Start with the Business Plan Generator to create your visa-compliant business plan. It is free to try!
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          Your trusted partner in visa success<br>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to UK Innovator Founder Visa Assistant!',
    html
  });
}

// Admin verification success email - sent when admin manually verifies a user
export async function sendAdminVerificationSuccessEmail(
  email: string,
  firstName: string
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${BASE_URL}/dashboard`;
  const toolsUrl = `${BASE_URL}/tools-hub`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">Account Verified!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news! Your account has been verified by our team. You now have full access to all the features of the UK Innovator Founder Visa Assistant.
        </p>
        
        <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <div style="font-size: 24px; color: #2e7d32; margin-bottom: 10px;">Your Account Status</div>
          <div style="display: inline-block; background: #4caf50; color: white; padding: 8px 24px; border-radius: 20px; font-weight: bold; font-size: 16px;">
            VERIFIED
          </div>
        </div>
        
        <div style="background: #fff; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32;">What you can do now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li>Access all 109 visa preparation tools</li>
            <li>Generate your AI-powered business plan</li>
            <li>Practice endorser interviews with AI coaching</li>
            <li>Download professional visa documents</li>
            <li>Track your visa readiness score</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;
                    margin: 5px;">
            Go to Your Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${toolsUrl}" style="color: #11b6e9; text-decoration: none; font-size: 16px;">
            Explore All Tools →
          </a>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffa536; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>Next Step:</strong> Visit the Business Plan Generator to create your visa-compliant business plan and boost your endorsement chances!
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          Your trusted partner in visa success<br>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Account Has Been Verified - UK Innovator Founder Visa Assistant',
    html
  });
}

// Plan completion notification
export async function sendPlanCompletionEmail(
  email: string,
  firstName: string,
  planName: string,
  planId: string
): Promise<{ success: boolean; error?: string }> {
  const viewPlanUrl = `${BASE_URL}/dashboard?plan=${planId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Business Plan is Ready</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news! Your business plan "<strong>${escapeHtml(planName)}</strong>" has been generated and is ready for review.
        </p>
        
        <div style="background: #fff; border: 2px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #2e7d32;">What's included:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li>Executive Summary optimized for endorsers</li>
            <li>Innovation & Scalability analysis</li>
            <li>Financial projections and funding strategy</li>
            <li>Market research and competitor analysis</li>
            <li>Team capabilities assessment</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${viewPlanUrl}" 
             style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;">
            View Your Plan
          </a>
        </div>
        
        <div style="background: #e3f2fd; border-left: 4px solid #11b6e9; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #1565c0;">
            <strong>Next Steps:</strong> Review your plan, make any refinements, then use our Pitch Practice Coach to prepare for your endorser interview.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Business Plan is Ready - UK Innovator Founder Visa Assistant',
    html
  });
}

// Upgrade reminder email
export async function sendUpgradeReminderEmail(
  email: string,
  firstName: string,
  currentTier: string,
  daysActive: number
): Promise<{ success: boolean; error?: string }> {
  const pricingUrl = `${BASE_URL}/pricing`;

  const tierBenefits: Record<string, { name: string; tools: number; price: number }> = {
    free: { name: 'Free', tools: 13, price: 0 },
    basic: { name: 'Basic', tools: 20, price: 29 },
    premium: { name: 'Premium', tools: 83, price: 49 },
    enterprise: { name: 'Enterprise', tools: 109, price: 89 },
  };

  const currentPlan = tierBenefits[currentTier] || tierBenefits.free;
  const recommendedPlan = currentTier === 'free' ? tierBenefits.premium : tierBenefits.enterprise;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Unlock More Tools</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          You've been using the UK Innovator Founder Visa Assistant for ${daysActive} days now. 
          We noticed you're on the <strong>${currentPlan.name}</strong> plan with access to ${currentPlan.tools} tools.
        </p>
        
        <div style="background: #fff; border: 2px solid #ffa536; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Upgrade to ${recommendedPlan.name} and get:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li><strong>${recommendedPlan.tools} PhD-level tools</strong> (${recommendedPlan.tools - currentPlan.tools} more!)</li>
            <li>AI-powered pitch practice coaching</li>
            <li>Advanced financial modeling tools</li>
            <li>Innovation score calculator</li>
            <li>Priority support</li>
          </ul>
          <p style="margin: 15px 0 0 0; font-size: 24px; font-weight: bold; color: #ffa536;">
            Only £${recommendedPlan.price}/month
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${pricingUrl}" 
             style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;">
            Upgrade Now
          </a>
        </div>
        
        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #2e7d32;">
            <strong>30-Day Money Back Guarantee:</strong> Not satisfied? Get a full refund, no questions asked.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Unlock More Tools - Upgrade Your Plan Today!',
    html
  });
}

// Weekly progress email
export async function sendWeeklyProgressEmail(
  email: string,
  firstName: string,
  stats: {
    toolsUsed: number;
    plansCreated: number;
    readinessScore: number;
    nextSteps: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  const dashboardUrl = `${BASE_URL}/dashboard`;

  const scoreColor = stats.readinessScore >= 70 ? '#4caf50' : 
                    stats.readinessScore >= 40 ? '#ffa536' : '#f44336';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Weekly Progress Report</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Here's a summary of your visa preparation progress this week:
        </p>
        
        <div style="display: flex; justify-content: space-around; margin: 30px 0; text-align: center;">
          <div style="flex: 1; padding: 15px;">
            <div style="font-size: 36px; font-weight: bold; color: #11b6e9;">${stats.toolsUsed}</div>
            <div style="font-size: 14px; color: #666;">Tools Used</div>
          </div>
          <div style="flex: 1; padding: 15px;">
            <div style="font-size: 36px; font-weight: bold; color: #ffa536;">${stats.plansCreated}</div>
            <div style="font-size: 14px; color: #666;">Plans Created</div>
          </div>
          <div style="flex: 1; padding: 15px;">
            <div style="font-size: 36px; font-weight: bold; color: ${scoreColor};">${stats.readinessScore}%</div>
            <div style="font-size: 14px; color: #666;">Readiness Score</div>
          </div>
        </div>
        
        ${stats.nextSteps.length > 0 ? `
        <div style="background: #fff; border: 2px solid #11b6e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1565c0;">Recommended Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            ${stats.nextSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                    color: white; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-size: 18px; 
                    font-weight: bold;
                    display: inline-block;">
            Continue Your Journey
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
          <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Weekly Visa Prep Progress Report',
    html
  });
}

// ============================================
// DEADLINE REMINDER NOTIFICATIONS
// ============================================

export async function sendDeadlineReminderEmail(
  email: string,
  firstName: string,
  deadline: {
    name: string;
    dueDate: Date;
    daysRemaining: number;
    description?: string;
    actionUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const actionUrl = deadline.actionUrl || `${BASE_URL}/progress`;
  const urgencyColor = deadline.daysRemaining <= 3 ? '#f44336' : 
                       deadline.daysRemaining <= 7 ? '#ff9800' : '#ffa536';
  const urgencyLevel = deadline.daysRemaining <= 3 ? 'Urgent' : 
                       deadline.daysRemaining <= 7 ? 'Important' : 'Upcoming';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #11b6e9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Deadline Reminder</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${urgencyLevel}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(firstName)},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
            This is a reminder about an upcoming deadline for your visa application:
          </p>
          
          <div style="background: #f8f9fa; border-left: 4px solid ${urgencyColor}; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${escapeHtml(deadline.name)}</h3>
            <p style="margin: 0; font-size: 14px; color: #666;">
              ${deadline.description ? escapeHtml(deadline.description) : 'Complete this task to stay on track with your visa application.'}
            </p>
          </div>

          <div style="background: linear-gradient(135deg, ${urgencyColor}10 0%, ${urgencyColor}20 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0 0 5px 0;">Time Remaining:</p>
            <p style="font-size: 32px; font-weight: bold; color: ${urgencyColor}; margin: 0;">
              ${deadline.daysRemaining} day${deadline.daysRemaining === 1 ? '' : 's'}
            </p>
            <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">
              Due: ${deadline.dueDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" 
               style="background: linear-gradient(135deg, ${urgencyColor} 0%, #11b6e9 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold;
                      display: inline-block;">
              Take Action Now
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${urgencyLevel}: ${deadline.name} - ${deadline.daysRemaining} day${deadline.daysRemaining === 1 ? '' : 's'} remaining`,
    html
  });
}

// ============================================
// SUPPORT NOTIFICATION EMAILS
// ============================================

export async function sendSupportNotificationEmail(
  userEmail: string,
  userName: string,
  topic: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const supportEmail = 'support@innovatorfoundervisaassistant.co.uk';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Support Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;">From:</td>
                <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(userName)} (${escapeHtml(userEmail)})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Topic:</td>
                <td style="padding: 8px 0;">${escapeHtml(topic)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Subject:</td>
                <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(subject)}</td>
              </tr>
            </table>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #333;">Message:</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
            ${escapeHtml(message)}
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated notification from UK Innovator Founder Visa Assistant support system.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to support team
  const supportResult = await sendEmail({
    to: supportEmail,
    subject: `[Support] ${topic}: ${subject}`,
    html
  });

  // Also send confirmation to user
  const userConfirmationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Support Request Received</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(userName)},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
            Thank you for contacting us. We've received your support request and will respond within 24 hours.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Topic:</strong> ${escapeHtml(topic)}</p>
            <p style="margin: 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            In the meantime, you may find helpful information in our <a href="${BASE_URL}/faq" style="color: #11b6e9;">FAQ</a> or 
            <a href="${BASE_URL}/guide" style="color: #11b6e9;">Ultimate Guide</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Support Request Received - UK Innovator Founder Visa Assistant',
    html: userConfirmationHtml
  });

  return supportResult;
}

// ============================================
// REFERRAL EMAIL NOTIFICATIONS
// ============================================

export async function sendReferralSignupNotification(
  referrerEmail: string,
  referrerName: string,
  refereeName: string,
  referralCode: string
) {
  const dashboardUrl = `${BASE_URL}/referral-dashboard`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Referral Signup!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(referrerName)},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
            Great news! <strong>${escapeHtml(refereeName)}</strong> just signed up using your referral code 
            <strong style="color: #11b6e9;">${escapeHtml(referralCode)}</strong>.
          </p>
          
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; color: #2e7d32; margin: 0;">
              Referral Progress: Signed Up
            </p>
            <p style="font-size: 14px; color: #388e3c; margin-top: 10px;">
              When they make a purchase, you'll earn your reward automatically!
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Your rewards are automatically tracked and will be added to your account when your referrals complete their purchase.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold;
                      display: inline-block;">
              View Your Referral Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: referrerEmail,
    subject: `New Referral Signup: ${refereeName} joined using your code!`,
    html
  });
}

export async function sendReferralPurchaseNotification(
  referrerEmail: string,
  referrerName: string,
  refereeName: string,
  rewardAmount: number,
  rewardType: string
) {
  const dashboardUrl = `${BASE_URL}/referral-dashboard`;
  
  const rewardText = rewardType === 'percentage' 
    ? `${rewardAmount}% commission` 
    : `£${rewardAmount}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You Earned a Reward!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(referrerName)},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
            Congratulations! <strong>${escapeHtml(refereeName)}</strong> just made a purchase using your referral code.
          </p>
          
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #1565c0; margin: 0 0 10px 0;">Your Reward:</p>
            <p style="font-size: 36px; font-weight: bold; color: #0d47a1; margin: 0;">
              ${rewardText}
            </p>
            <p style="font-size: 14px; color: #1976d2; margin-top: 10px;">
              Added to your earnings balance
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            You can request a payout from your referral dashboard once your balance reaches £20.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold;
                      display: inline-block;">
              View Your Earnings
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: referrerEmail,
    subject: `Referral Reward Earned: ${rewardText} added to your balance!`,
    html
  });
}

export async function sendRewardApprovalNotification(
  email: string,
  name: string,
  amount: number,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const dashboardUrl = `${BASE_URL}/referral-dashboard`;
  
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#2e7d32' : '#c62828';
  const statusBg = isApproved ? '#e8f5e9' : '#ffebee';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: ${isApproved ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)'}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            ${isApproved ? 'Reward Approved!' : 'Reward Update'}
          </h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(name)},</p>
          
          <div style="background: ${statusBg}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: ${statusColor}; margin: 0 0 10px 0;">
              ${isApproved ? 'Your reward has been approved!' : 'Unfortunately, your reward could not be approved.'}
            </p>
            <p style="font-size: 28px; font-weight: bold; color: ${statusColor}; margin: 0;">
              £${amount.toFixed(2)}
            </p>
          </div>
          
          ${notes ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #333; margin: 0;">
              <strong>Note:</strong> ${escapeHtml(notes)}
            </p>
          </div>
          ` : ''}
          
          ${isApproved ? `
          <p style="font-size: 14px; color: #666;">
            The approved amount has been added to your earnings balance. You can request a payout from your dashboard.
          </p>
          ` : `
          <p style="font-size: 14px; color: #666;">
            If you have questions about this decision, please contact our support team.
          </p>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold;
                      display: inline-block;">
              View Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: isApproved ? `Your £${amount.toFixed(2)} reward has been approved!` : `Reward Update: £${amount.toFixed(2)}`,
    html
  });
}

export async function sendPayoutRequestNotification(
  adminEmail: string,
  userName: string,
  userEmail: string,
  amount: number,
  paymentMethod: string,
  paymentDetails: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Payout Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Admin Alert</p>
          
          <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
            A user has requested a payout from their referral earnings.
          </p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">User Name:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${escapeHtml(userName)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">User Email:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${escapeHtml(userEmail)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount Requested:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #2e7d32; font-size: 20px;">£${amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${escapeHtml(paymentMethod)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Details:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">${escapeHtml(paymentDetails)}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Please process this payout request at your earliest convenience.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Payout Request: £${amount.toFixed(2)} from ${userName}`,
    html
  });
}

export async function sendPayoutStatusNotification(
  email: string,
  name: string,
  amount: number,
  status: 'completed' | 'rejected',
  notes?: string
) {
  const isCompleted = status === 'completed';
  const statusColor = isCompleted ? '#2e7d32' : '#c62828';
  const statusBg = isCompleted ? '#e8f5e9' : '#ffebee';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: ${isCompleted ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' : 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)'}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            ${isCompleted ? 'Payout Completed!' : 'Payout Update'}
          </h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${escapeHtml(name)},</p>
          
          <div style="background: ${statusBg}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: ${statusColor}; margin: 0 0 10px 0;">
              ${isCompleted ? 'Your payout has been processed!' : 'Unfortunately, your payout request could not be completed.'}
            </p>
            <p style="font-size: 28px; font-weight: bold; color: ${statusColor}; margin: 0;">
              £${amount.toFixed(2)}
            </p>
          </div>
          
          ${notes ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #333; margin: 0;">
              <strong>Note:</strong> ${escapeHtml(notes)}
            </p>
          </div>
          ` : ''}
          
          ${isCompleted ? `
          <p style="font-size: 14px; color: #666;">
            The payment should arrive in your account within 3-5 business days depending on your payment method.
          </p>
          ` : `
          <p style="font-size: 14px; color: #666;">
            If you have questions about this decision, please contact our support team at support@innovatorfoundervisaassistant.co.uk.
          </p>
          `}
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} UK Innovator Founder Visa Assistant<br>
            <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #11b6e9;">support@innovatorfoundervisaassistant.co.uk</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: isCompleted ? `Payout Completed: £${amount.toFixed(2)}` : `Payout Update: £${amount.toFixed(2)}`,
    html
  });
}

export async function sendReferralRewardEmail(
  email: string,
  firstName: string,
  rewardAmount: number
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Congratulations!</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 20px;">
            Hi ${escapeHtml(firstName)},
          </p>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Great news! Someone you referred has just completed a purchase, and you've earned a reward.
          </p>
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0;">Your Reward</p>
            <p style="color: #ffffff; font-size: 42px; font-weight: 700; margin: 0;">
              £${(rewardAmount / 100).toFixed(2)}
            </p>
          </div>
          <p style="font-size: 14px; color: #718096; line-height: 1.6;">
            This reward has been added to your account balance. You can request a payout once your balance reaches £20 or more.
          </p>
          <a href="${BASE_URL}/referral-dashboard" style="display: inline-block; background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-top: 20px;">
            View Your Dashboard
          </a>
        </div>
        <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
          © 2024 UK Innovator Founder Visa Assistant. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `You've Earned £${(rewardAmount / 100).toFixed(2)} from Your Referral!`,
    html
  });
}

export async function sendPromoCodeRewardEmail(
  email: string,
  firstName: string,
  promoCode: string,
  rewardAmount: number
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Promo Code Commission Earned!</h1>
        </div>
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 20px;">
            Hi ${escapeHtml(firstName)},
          </p>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Someone used your promo code <strong style="color: #8b5cf6;">${escapeHtml(promoCode)}</strong> to make a purchase, and you've earned a commission!
          </p>
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0;">Your Commission</p>
            <p style="color: #ffffff; font-size: 42px; font-weight: 700; margin: 0;">
              £${(rewardAmount / 100).toFixed(2)}
            </p>
          </div>
          <p style="font-size: 14px; color: #718096; line-height: 1.6;">
            This commission has been added to your account balance. Keep sharing your promo code to earn more!
          </p>
          <a href="${BASE_URL}/referral-dashboard" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-top: 20px;">
            View Your Dashboard
          </a>
        </div>
        <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">
          © 2024 UK Innovator Founder Visa Assistant. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `You've Earned £${(rewardAmount / 100).toFixed(2)} from Promo Code ${promoCode}!`,
    html
  });
}

export function generateVerificationEmail(code: string, displayName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ffa536 0%, #11b6e9 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Innovator Visa AI Assistant
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">
                UK's #1 Visa AI Assistant
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                Welcome, ${escapeHtml(displayName)}!
              </h2>
              <p style="margin: 0 0 32px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for signing up. Please verify your email address by entering this verification code:
              </p>
              
              <!-- Verification Code -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 48px; border-radius: 12px;">
                      <span style="color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                This code will expire in <strong>15 minutes</strong>. If you didn't request this verification, you can safely ignore this email.
              </p>
              
              <!-- Security Notice -->
              <div style="margin-top: 32px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #ffa536; border-radius: 4px;">
                <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.5;">
                  <strong>Security Tip:</strong> Never share this code with anyone. Innovator Visa AI Assistant will never ask for your verification code via email or phone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #718096; font-size: 13px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@innovatorfoundervisaassistant.co.uk" style="color: #ffa536; text-decoration: none;">support@innovatorfoundervisaassistant.co.uk</a>
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                © 2024 Innovator Visa AI Assistant. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Disclaimer -->
        <p style="margin: 24px 0 0 0; color: #a0aec0; font-size: 12px; text-align: center; max-width: 600px;">
          You received this email because you signed up for Innovator Visa AI Assistant.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
