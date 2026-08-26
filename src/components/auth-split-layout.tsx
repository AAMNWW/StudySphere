import Image from "next/image";

/** Two-column shell for the login/signup pages: a real photo of students
 * studying on one side, the form on the other. Collapses to just the form
 * below `lg` — there's no good way to keep a meaningful photo at phone
 * width without either cropping it unrecognizably or pushing the form
 * below the fold. */
export function AuthSplitLayout({
  photoSrc,
  photoAlt,
  quote,
  children,
}: {
  photoSrc: string;
  photoAlt: string;
  quote: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src={photoSrc}
          alt={photoAlt}
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <p className="absolute inset-x-8 bottom-8 text-lg font-medium text-balance text-white">
          {quote}
        </p>
      </div>
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
