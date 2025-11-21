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
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                VisaPrep
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">
                Innovator Founder Visa Platform
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
              <div style="margin-top: 32px; padding: 16px; background-color: #f7fafc; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.5;">
                  <strong>🔒 Security Tip:</strong> Never share this code with anyone. VisaPrep AI will never ask for your verification code via email or phone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #718096; font-size: 13px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@visaprep.ai" style="color: #667eea; text-decoration: none;">support@visaprep.ai</a>
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                © 2024 VisaPrep AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Disclaimer -->
        <p style="margin: 24px 0 0 0; color: #a0aec0; font-size: 12px; text-align: center; max-width: 600px;">
          You received this email because you signed up for VisaPrep AI.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
