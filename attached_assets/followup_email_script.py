import smtplib
import ssl
import csv
import random
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import quote_plus

# ==============================================================
# CONFIG — UPDATE THESE VALUES BEFORE RUNNING
# ==============================================================

SMTP_SERVER = "email-smtp.eu-north-1.amazonaws.com"
SMTP_PORT = 465

# 🔴 SES SMTP USER/PASS
SES_SMTP_USERNAME = "AKIAW5DSKK4M7XOGTQMV"
SES_SMTP_PASSWORD = "BIKsFvDxrI41WZAIfpKv5gnqklH5rQoj4mfXyIkTDH5s"

SENDER_EMAIL = "benedict.umeh@bhenmedia.com"
SENDER_NAME = "Benedict E. Umeh"

# Your CSV file (Apollo-style headers)
CONTACTS_FILE = r"C:\Users\ebuka\Desktop\job_blitz_system\apollo_exports\email.csv"

SUCCESS_LOG = "sent_success_followup.csv"
FAILED_LOG = "sent_failed_followup.csv"

# 🔴 GLOBAL BCC – you get a silent copy of every email
GLOBAL_BCC = "benedict.umeh@bhenmedia.com"

# 🔴 TRACKING BASE URL – where your tracking pixel points to
TRACKING_BASE_URL = "https://bhenmedia.com/trk/open.gif"

# ==============================================================
# SUBJECT ROTATION - FOLLOW UP
# ==============================================================

SUBJECTS = [
    "Following Up: I Built a Full AI Platform Since My Last Email",
    "Quick Update: See What I Built While Waiting",
    "Since We Last Spoke – A Complete AI SaaS Platform (Live Now)",
    "Follow-Up: From Application to Production in 3 Weeks"
]

# ==============================================================
# FULL HTML TEMPLATE - FOLLOW UP WITH INNOVATOR FOUNDER VISA ASSISTANT
# ==============================================================

HTML_TEMPLATE = """
<html>
<body style="font-family: Arial; line-height: 1.6; font-size: 15px; color: #222;">

<p>Dear {firstname},</p>

<p>I reached out recently about opportunities at {company}. Rather than send another follow-up with more words, I wanted to show you what I've been building.</p>

<hr>

<h3>Since My Last Email, I Built This:</h3>

<p style="font-size: 18px; margin: 16px 0;">
  <a href="https://innovatorfoundervisaassistant.co.uk" style="color: #e5533d; font-weight: bold;">
    UK Innovator Founder Visa Assistant
  </a><br>
  <span style="font-size: 14px; color: #555;">innovatorfoundervisaassistant.co.uk</span>
</p>

<p>A complete <b>AI-powered SaaS platform</b> I designed, developed, and deployed in 3 weeks:</p>

<table cellpadding="8" cellspacing="0" border="0" style="margin: 16px 0; font-size: 14px;">
  <tr>
    <td style="vertical-align: top; padding-right: 24px;">
      <b>Platform Features:</b><br>
      • 100+ professional visa guidance tools<br>
      • AI document review & voice interview practice<br>
      • 5-tier Stripe subscription system<br>
      • Full authentication (Google OAuth, email verification)<br>
      • Admin dashboard with real-time analytics<br>
      • PostgreSQL database with migrations
    </td>
    <td style="vertical-align: top;">
      <b>Tech Stack:</b><br>
      • React & TypeScript<br>
      • Node.js & Express<br>
      • PostgreSQL & Drizzle ORM<br>
      • TailwindCSS & Shadcn UI<br>
      • Stripe Payments<br>
      • OpenAI API Integration
    </td>
  </tr>
</table>

<p><b>This isn't a tutorial project or demo</b> — it's a live, monetizable product built from concept to deployment. This is the standard I bring to every project.</p>

<hr>

<h3>Why This Matters</h3>

<p>While job searching, I didn't sit idle. I identified a problem (visa applicants struggling with complex requirements) and built a complete solution. This is how I approach all my work — proactive, thorough, and always delivering production-ready results.</p>

<p>My visa deadline remains <b>December 8th, 2025</b>. If {company} has any need for a developer who builds at this level — whether full-stack, WordPress, AI integration, or data-driven solutions — I'm ready to start immediately.</p>

<p><b>A 10-minute call could be the start of something valuable for both of us.</b></p>

<hr>

<div style="margin-top:8px;">

  <p style="margin:0;">Best regards,</p>
  <p style="margin:0;">
    <b>Benedict E. Umeh</b><br>
    <a href="tel:+447493363351">+44 7493 363 351</a><br>
    <a href="mailto:benedict.umeh@bhenmedia.com">benedict.umeh@bhenmedia.com</a>
  </p>

  <p style="margin:8px 0 0 0; font-size:14px;">
    <a href="https://innovatorfoundervisaassistant.co.uk" style="color:#e5533d; text-decoration:none; font-weight:bold;">Live Platform</a>
    |
    <a href="https://bhenmedia.com/" style="color:#e5533d; text-decoration:none;">Portfolio</a>
    |
    <a href="https://linkedin.com/in/ebukaumeh" style="color:#1a73e8; text-decoration:none;">LinkedIn</a>
  </p>

  <hr>

  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
  <tr>
    <td>
      <img src="https://bhenmedia.com/website-storage/2025/11/unnamed_resized-removebg-preview.png"
           alt="BhenMedia"
           style="height:48px; width:auto; display:block;">
    </td>
    <td style="font-size:14px; padding-left:8px;">— Intelligent Web Development • AI Integration • UX + Data
    </td>
  </tr>
</table>

</div>

<p>{custom_ps}</p>

<p style="font-size:12px;color:#6b7280;">
  This is a follow-up to my previous email. Originally addressed to: <strong>{recipient}</strong>.
</p>

{tracking_pixel}

</body>
</html>
"""

# ==============================================================
# NORMALISE ROW
# ==============================================================

def normalise_row(raw_row):
    """
    Takes a DictReader row and:
      - strips whitespace from keys
      - lowercases keys (so 'Email' or ' email ' both become 'email')
      - strips whitespace from values
    """
    clean = {}
    for k, v in raw_row.items():
        if k is None:
            continue
        key = k.strip().lower()
        if isinstance(v, str):
            v = v.strip()
        clean[key] = v
    return clean

# ==============================================================
# SEND EMAIL FUNCTION
# ==============================================================

def send_email(row):
    # row has already been normalised
    recipient = row.get("email")
    if not recipient:
        print("[SKIP] Row without email:", row)
        return False

    # First name: supports "First Name" and "firstname"
    firstname = (
        row.get("first name")      # from CSV: "First Name"
        or row.get("firstname")    # future-proof
        or ""
    ).strip() or "there"

    # Company: supports "Company Name" and "company"
    company = (
        row.get("company name")    # from CSV: "Company Name"
        or row.get("company")
        or ""
    ).strip() or "your company"

    # Optional PS (supported if you add a custom_ps column later)
    custom_ps = (row.get("custom_ps") or "").strip()

    # Random subject from follow-up subjects
    subject = random.choice(SUBJECTS)

    # ==========================================================
    # 🔴 BUILD TRACKING PIXEL
    # ==========================================================
    tracking_id = f"{int(time.time())}_{random.randint(1000, 9999)}"
    encoded_email = quote_plus(recipient)

    tracking_pixel = (
        f'<img src="{TRACKING_BASE_URL}?eid={tracking_id}&email={encoded_email}" '
        f'style="width:1px;height:1px;display:none;" alt="" />'
    )

    html_body = HTML_TEMPLATE.format(
        firstname=firstname,
        company=company,
        custom_ps=custom_ps,
        recipient=recipient,
        tracking_pixel=tracking_pixel,
    )

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    msg["To"] = recipient
    msg["Subject"] = subject

    # 🔴 BCC – you silently receive a copy
    if GLOBAL_BCC:
        msg["Bcc"] = GLOBAL_BCC

    msg.attach(MIMEText(html_body, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SES_SMTP_USERNAME, SES_SMTP_PASSWORD)

            all_recipients = [recipient]
            if GLOBAL_BCC:
                all_recipients.append(GLOBAL_BCC)

            server.sendmail(SENDER_EMAIL, all_recipients, msg.as_string())

        print(f"[SENT] {recipient}")
        return True

    except Exception as e:
        print(f"[FAILED] {recipient} — {e}")
        return False


# ==============================================================
# MAIN LOOP
# ==============================================================

def main():
    print("Using contacts file:", CONTACTS_FILE)

    with open(CONTACTS_FILE, newline="", encoding="utf-8") as f, \
         open(SUCCESS_LOG, "w", newline="", encoding="utf-8") as success, \
         open(FAILED_LOG, "w", newline="", encoding="utf-8") as failed:

        reader = csv.DictReader(f)
        print("Detected CSV headers:", reader.fieldnames)

        success_writer = csv.writer(success)
        failed_writer = csv.writer(failed)

        success_writer.writerow(["email"])
        failed_writer.writerow(["email", "error"])

        for raw_row in reader:
            row = normalise_row(raw_row)
            ok = send_email(row)
            if ok:
                success_writer.writerow([row.get("email", "")])
            else:
                failed_writer.writerow([row.get("email", ""), "error"])


if __name__ == "__main__":
    main()
