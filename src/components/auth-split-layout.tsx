import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/logo";

/** Auth forms use taller, squarer fields than the dense in-app ones: a
 * sign-in screen is four controls on an empty page, so they carry the whole
 * layout and shouldn't read as toolbar-sized pills. */
export const AUTH_FIELD_CLASS = "h-11 rounded-md px-3.5 text-sm";

/** And the buttons match them, full width and the same height. */
export const AUTH_BUTTON_CLASS = "h-11 w-full rounded-md text-sm";

/**
 * Two-column shell for login/signup: a photo of students studying on one
 * side, the form on the other.
 *
 * The brand sits *on* the photo (logo top-left, the line bottom-left) rather
 * than floating above the page, so the photo panel does the branding and the
 * form side stays a clean, undecorated column. Below `lg` the photo is
 * dropped — there's no way to keep it meaningful at phone width without
 * either cropping it unrecognizably or pushing the form below the fold — so
 * the mark reappears above the form instead.
 */
export function AuthSplitLayout({
  photoSrc,
  photoAlt,
  quote,
  eyebrow,
  children,
}: {
  photoSrc: string;
  photoAlt: string;
  quote: string;
  /** Small line above the quote, e.g. what this screen is for. */
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1">
      <div className="relative hidden w-[45%] shrink-0 lg:block">
        <Image
          src={photoSrc}
          alt={photoAlt}
          fill
          sizes="45vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

        <div className="absolute inset-0 flex flex-col justify-between p-10">
          {/* The lockup sits in a solid white chip rather than as bare text
              on the photo: plain type on a photograph picks up whatever is
              behind it and reads as a caption, while a solid card gives the
              mark its own surface, keeps it legible over any crop, and lets
              the logo and wordmark render in their normal ink black instead
              of an inverted white. */}
          <Link
            href="/"
            // Locked to literal white/black rather than the `background`/
            // `foreground` tokens: this chip sits on a photo, not on the
            // page, so it should read the same regardless of light/dark
            // theme or which color palette the visitor has picked.
            className="inline-flex w-fit items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-black shadow-lg transition-opacity hover:opacity-90"
            aria-label="Academique home"
          >
            <Logo className="h-8 w-auto text-black" paper="#fff" />
            <span className="font-heading text-base font-bold tracking-tight text-black">
              Academique
            </span>
          </Link>

          <div className="max-w-sm">
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <p className="mt-3 text-2xl font-bold tracking-tight text-balance text-white">
              {quote}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-[25rem]">
          {/* This one sits on the ordinary page background, so it keeps
              following the theme (`currentColor`) rather than being forced
              black — the photo-panel version above is the one being pinned
              to literal black-on-white. Already reads near-black in the
              default light theme. */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 lg:hidden"
            aria-label="Academique home"
          >
            <Logo className="h-8 w-auto" />
            <span className="font-heading text-lg font-bold tracking-tight">
              Academique
            </span>
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
