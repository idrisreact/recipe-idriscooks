import nodemailer from 'nodemailer';

/**
 * Shared mail transport (Gmail via EMAIL_USER / EMAIL_PASS).
 * Used by the contact form and catering inquiries.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/** Escape user-provided text before interpolating it into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface SendEmailOptions {
  subject: string;
  html: string;
  /** Defaults to the site inbox (EMAIL_USER). */
  to?: string;
  replyTo?: string;
}

export async function sendEmail({ subject, html, to, replyTo }: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: `Idris Cooks <${process.env.EMAIL_USER}>`,
    to: to ?? process.env.EMAIL_USER,
    subject,
    html,
    replyTo,
  });
}
