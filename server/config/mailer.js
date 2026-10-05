const nodemailer = require('nodemailer');

let transporter = null;

// Initialize mail transporter with support for Google OAuth2, traditional SMTP, and Ethereal fallback
const initMailer = async () => {
  // Option 1: Gmail OAuth2 using GOOGLE_REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_USER
  if (
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_USER
  ) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GOOGLE_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        },
      });
      console.log(`[Mailer] Initialized Gmail OAuth2 transporter for user: ${process.env.GOOGLE_USER}`);
      return;
    } catch (err) {
      console.warn('[Mailer] Gmail OAuth2 initialization failed, checking SMTP fallback:', err.message);
    }
  }

  // Option 2: Traditional SMTP (EMAIL_USER / EMAIL_PASS or SMTP_USER / SMTP_PASS)
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log(`[Mailer] Initialized standard SMTP transporter for user: ${smtpUser}`);
    return;
  }

  // Option 3: Ethereal test account for dev mode / testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Mailer] Initialized Ethereal test mailer for development');
    console.log(`[Mailer] Ethereal user: ${testAccount.user}`);
  } catch (err) {
    console.warn('[Mailer] Could not create Ethereal account, falling back to console logger:', err.message);
    transporter = {
      sendMail: async (options) => {
        console.log('[Mailer Fallback Log] Email would be sent to:', options.to);
        console.log('[Mailer Fallback Log] Subject:', options.subject);
        return { messageId: 'mock-mail-id-' + Date.now() };
      },
    };
  }
};

const sendOtpEmail = async (toEmail, otp) => {
  if (!transporter) {
    await initMailer();
  }

  const senderEmail = process.env.GOOGLE_USER || process.env.EMAIL_USER || 'noreply@taskflow.dev';
  const mailOptions = {
    from: process.env.SMTP_FROM || `"TaskFlow Security" <${senderEmail}>`,
    to: toEmail,
    subject: `Your TaskFlow Verification Code: ${otp}`,
    text: `Your verification code is: ${otp}. It will expire in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 12px; margin-bottom: 12px;">
            <span style="font-size: 28px;">⚡</span>
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">TaskFlow</h1>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Sign-in & Verification</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 14px; font-size: 14px; color: #cbd5e1;">Use the following one-time code to sign in to your workspace:</p>
          <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 14px 20px; border-radius: 8px; display: inline-block; border: 1px dashed #38bdf8; font-family: monospace;">
            ${otp}
          </div>
          <p style="margin: 16px 0 0; font-size: 12px; color: #64748b;">
            ⏳ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] OTP email dispatched to ${toEmail}. MessageId: ${info.messageId}`);
    
    // If using Ethereal, log the preview URL in console
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log(`[Mailer] Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Mailer] Error sending OTP email to ${toEmail}:`, error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

module.exports = {
  initMailer,
  sendOtpEmail,
};
