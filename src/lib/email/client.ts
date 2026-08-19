import nodemailer, { type Transporter } from "nodemailer";

// Gmail SMTP via an App Password (requires 2-Step Verification enabled on
// the Google account — https://myaccount.google.com/apppasswords). Gmail
// caps regular accounts at ~500 sends/day, which is fine for a personal
// deadline-reminder digest.
export const REMINDER_FROM_ADDRESS = process.env.EMAIL_USER ?? "";

let transporter: Transporter | undefined;

export function getMailTransporter(): Transporter {
  const user = process.env.EMAIL_USER;
  // Google displays app passwords grouped with spaces for readability
  // ("abcd efgh ijkl mnop"); the real password has none, so strip them —
  // passing the raw grouped string fails SMTP auth with a generic
  // "Username and Password not accepted" error.
  const pass = process.env.EMAIL_PASSWORD?.replaceAll(" ", "");

  if (!user || !pass) {
    throw new Error("EMAIL_USER / EMAIL_PASSWORD are not configured.");
  }

  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}
