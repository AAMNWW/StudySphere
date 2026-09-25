import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="25 September 2026">
      <p>
        These terms apply to your use of Academique (academique.vercel.app). By
        creating an account or using the app, you agree to them.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your login details secure and for
        activity on your account. Please give accurate information when you
        sign up.
      </p>

      <h2>Your content</h2>
      <p>
        You keep ownership of everything you create or upload. You give us
        permission to store and process it only as needed to run the app for
        you, including sending it to AI providers when you use an AI feature,
        as described in our <Link href="/privacy">Privacy Policy</Link>. Only
        upload material you have the right to use.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Don&apos;t use the app for anything illegal or to harm others.</li>
        <li>Don&apos;t try to access other people&apos;s accounts or data, or disrupt the service.</li>
        <li>Don&apos;t upload malware or content that infringes someone else&apos;s rights.</li>
      </ul>

      <h2>AI features</h2>
      <p>
        Summaries, quizzes, flashcards, chat answers and other AI-generated
        content can be incomplete or wrong. Use them as a study aid and check
        important information against your course material.
      </p>

      <h2>Third-party services</h2>
      <p>
        Optional integrations such as Google Calendar are also subject to that
        provider&apos;s terms. You can disconnect them at any time from
        Settings.
      </p>

      <h2>Availability</h2>
      <p>
        The app is provided &quot;as is&quot;, free of charge, without
        guarantees that it will always be available or error-free. We may
        change or discontinue features over time. Keep your own copies of
        anything important.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can stop using the app at any time and ask us to delete your
        account. We may suspend accounts that break these terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
