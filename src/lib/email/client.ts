import nodemailer, { type Transporter } from "nodemailer";

// Gmail SMTP via an App Password (requires 2-Step Verification enabled on
// the Google account — https://myaccount.google.com/apppasswords). Gmail
// caps regular accounts at ~500 sends/day, which is fine for a personal
// deadline-reminder digest.
export const REMINDER_FROM_ADDRESS = process.env.GMAIL_USER ?? "";

let transporter: Transporter | undefined;

export function getMailTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD are not configured.");
  }

  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}
