const nodemailer = require("nodemailer");

/*==========================================
SMTP TRANSPORTER

Reads connection details from environment
variables so no credentials are hardcoded.

Required in .env:
  SMTP_HOST
  SMTP_PORT
  SMTP_USER
  SMTP_PASS
  SMTP_FROM_NAME   (optional, defaults to "FoodChain")
  SMTP_FROM_EMAIL  (optional, defaults to SMTP_USER)
  ADMIN_NOTIFY_EMAIL (optional, where "new submission" alerts go)
==========================================*/

let transporter = null;

function getTransporter() {

    if (transporter) return transporter;

    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {

        console.warn(
            "⚠️  SMTP is not configured (missing SMTP_HOST/PORT/USER/PASS in .env). " +
            "Emails will be skipped instead of sent."
        );

        return null;

    }

    transporter = nodemailer.createTransport({

        host: SMTP_HOST,

        port: Number(SMTP_PORT),

        secure: Number(SMTP_PORT) === 465, // true for port 465, false for 587/25

        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },

        // Without these, a blocked/slow SMTP connection hangs the
        // request indefinitely instead of failing with a clear error.
        connectionTimeout: 10000, // 10s to establish the connection
        greetingTimeout: 10000,   // 10s to receive the server's greeting
        socketTimeout: 15000      // 15s of socket inactivity before giving up

    });

    return transporter;

}

/*==========================================
BRANDED EMAIL WRAPPER

Wraps any inner HTML in a simple, mobile-friendly
FoodChain-branded template.
==========================================*/

function wrapTemplate({ title, bodyHtml }) {

    return `
    <div style="background:#f4f6f5;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <div style="background:#0B8F4D;padding:22px 28px;">
          <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">
            FoodChain
          </span>
        </div>
        <div style="padding:28px 28px 8px 28px;color:#1f2a24;">
          <h2 style="margin:0 0 14px 0;font-size:19px;color:#0B8F4D;">
            ${title}
          </h2>
          <div style="font-size:15px;line-height:1.6;color:#333;">
            ${bodyHtml}
          </div>
        </div>
        <div style="padding:18px 28px 26px 28px;color:#8a8a8a;font-size:12px;border-top:1px solid #eee;margin-top:12px;">
          <p style="margin:0;">FoodChain • Lagos, Nigeria</p>
          <p style="margin:4px 0 0 0;">This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
    `;

}

/*==========================================
CORE SEND FUNCTION

Never throws — logs and resolves so a failed
email never breaks the API request that triggered it.
==========================================*/

async function sendMail({ to, subject, title, bodyHtml, replyTo }) {

    try {

        const t = getTransporter();

        if (!t) return { sent: false, reason: "SMTP not configured" };

        const fromName = process.env.SMTP_FROM_NAME || "FoodChain";
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

        await t.sendMail({

            from: `"${fromName}" <${fromEmail}>`,

            to,

            subject,

            replyTo: replyTo || undefined,

            html: wrapTemplate({ title: title || subject, bodyHtml })

        });

        return { sent: true };

    } catch (error) {

        console.error(
            "✉️  Email send failed:",
            error.message,
            "| code:", error.code || "n/a",
            "| command:", error.command || "n/a"
        );

        return { sent: false, reason: error.message };

    }

}

/*==========================================
READY-MADE TEMPLATES
==========================================*/

const templates = {

    newsletterWelcome: (email) => ({
        subject: "You're subscribed to FoodChain 🎉",
        title: "Thanks for subscribing!",
        bodyHtml: `
            <p>Hi there,</p>
            <p>Thanks for subscribing to the FoodChain newsletter with <strong>${email}</strong>.</p>
            <p>You'll be the first to hear about new restaurants, launch updates, and promos as we roll out across Lagos.</p>
        `
    }),

    contactAck: (name) => ({
        subject: "We've received your message — FoodChain",
        title: `Thanks for reaching out, ${name}!`,
        bodyHtml: `
            <p>We've received your message and a member of the FoodChain team will get back to you shortly.</p>
            <p>In the meantime, feel free to explore our restaurants or check our FAQ page for quick answers.</p>
        `
    }),

    partnershipAck: (owner, businessName) => ({
        subject: "We've received your partnership request — FoodChain",
        title: `Thanks for reaching out, ${owner}!`,
        bodyHtml: `
            <p>We've received your request for <strong>${businessName}</strong> to partner with FoodChain.</p>
            <p>Our team will review your application and reach out with next steps soon.</p>
        `
    }),

    contactReply: (replyMessage) => ({
        subject: "Reply to your message — FoodChain",
        title: "A reply from the FoodChain team",
        bodyHtml: `<p style="white-space:pre-line;">${replyMessage}</p>`
    }),

    partnershipReply: (replyMessage) => ({
        subject: "Update on your partnership request — FoodChain",
        title: "A reply from the FoodChain team",
        bodyHtml: `<p style="white-space:pre-line;">${replyMessage}</p>`
    }),

    passwordReset: (resetUrl) => ({
        subject: "Reset your FoodChain admin password",
        title: "Password reset requested",
        bodyHtml: `
            <p>We received a request to reset your FoodChain admin password.</p>
            <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
            <p style="text-align:center;margin:26px 0;">
                <a href="${resetUrl}" style="background:#0B8F4D;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                    Reset Password
                </a>
            </p>
            <p style="font-size:12px;color:#888;">If you didn't request this, you can safely ignore this email.</p>
        `
    }),

    passwordChanged: () => ({
        subject: "Your FoodChain admin password was changed",
        title: "Password changed",
        bodyHtml: `<p>This confirms your admin password was just changed. If this wasn't you, please secure your account immediately.</p>`
    })

};

async function notifyAdmin(subject, bodyHtml) {

    const to = process.env.ADMIN_NOTIFY_EMAIL;

    if (!to) return { sent: false, reason: "ADMIN_NOTIFY_EMAIL not set" };

    return sendMail({ to, subject, title: subject, bodyHtml });

}

module.exports = { sendMail, templates, notifyAdmin };
