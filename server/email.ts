import crypto from "crypto";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
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
        from: "VisaPrep <onboarding@resend.dev>",
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
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to UK Innovator Founder Visa Assistant! 🇬🇧</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${firstName},</p>
        
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
            ✅ Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #11b6e9; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffa536; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            ⏰ <strong>This link expires in 24 hours</strong>
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
                Welcome, ${displayName}!
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
                  <strong>🔒 Security Tip:</strong> Never share this code with anyone. Innovator Visa AI Assistant will never ask for your verification code via email or phone.
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
