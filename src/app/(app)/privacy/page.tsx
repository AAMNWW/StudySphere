import type { Metadata } from "next";

import { LEGAL_CONTACT_EMAIL, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="25 September 2026">
      <p>
        Academique (academique.vercel.app) is a study workspace for organising
        courses, notes, assignments and study material. This policy explains
        what information the app collects, how it is used, and the choices you
        have.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name and email address. If you
          sign up with a password, it is stored only as a secure hash. If you
          sign in with Google, we receive your name, email address and profile
          picture from Google.
        </li>
        <li>
          <strong>Content you create:</strong> courses, notes, tasks,
          assignments, exams, grades, topics, quizzes, flashcards, chat
          conversations, resumes and job applications.
        </li>
        <li>
          <strong>Files you upload:</strong> documents such as PDFs, Word and
          PowerPoint files, stored with our hosting provider.
        </li>
        <li>
          <strong>Google Calendar data</strong>, only if you choose to connect
          Google Calendar (see below).
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide the app&apos;s features to you and keep your content tied to your account.</li>
        <li>To send emails you have asked for, such as email verification, password resets and deadline reminders (which you can turn off in Settings).</li>
        <li>
          To power AI features. When you use an AI feature on a document or in
          a chat — for example summarising, chatting, or generating a quiz or
          flashcards — the relevant content is sent to our AI providers
          (Google Gemini, and Anthropic Claude for chat) to generate the
          response. Content is only sent when you use one of these features,
          never on upload.
        </li>
      </ul>
      <p>We do not sell your information, and we do not use it for advertising.</p>

      <h2>Google Calendar</h2>
      <p>
        Connecting Google Calendar is optional. If you connect it, Academique
        requests permission to view and edit events on your calendars
        (<code>calendar.events</code>) and uses it only to:
      </p>
      <ul>
        <li>add your assignment due dates and exam dates to your primary Google Calendar, and update or remove those events when you change, complete or delete them in the app;</li>
        <li>show your existing Google Calendar events on the app&apos;s own calendar page, visible only to you.</li>
      </ul>
      <p>
        We store the access tokens needed to do this and a record of which
        calendar events the app created. We do not store copies of your other
        calendar events. You can disconnect at any time from Settings, which
        deletes the stored tokens; you can also revoke access from your Google
        Account&apos;s security settings.
      </p>
      <p>
        Academique&apos;s use and transfer to any other app of information
        received from Google APIs will adhere to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. Google user data is not
        used to train AI models, is not sold, and is not transferred to third
        parties except as needed to provide the features described here.
      </p>

      <h2>Service providers</h2>
      <p>
        We rely on a small number of providers to run the app: Vercel (hosting
        and file storage), our database host, Google (sign-in, Calendar and
        Gemini AI), Anthropic (Claude AI) and our email provider. They process
        data only on our behalf to provide these services.
      </p>

      <h2>Keeping and deleting your data</h2>
      <p>
        Your data is kept for as long as your account exists. To delete your
        account and everything in it, email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> from
        the address you signed up with, and we will delete it. You can delete
        individual items (notes, documents, courses and so on) yourself at any
        time.
      </p>

      <h2>Security</h2>
      <p>
        Your content is only accessible to your own account. Connections to
        the app are encrypted (HTTPS), and passwords are stored as hashes, never
        in plain text.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we will update the date at the top of this
        page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or your data:{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
