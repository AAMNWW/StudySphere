import Image from "next/image";

/** The app's mark — paired with the "StudySphere AI" wordmark everywhere it
 * appears, so the image itself is decorative (empty alt) rather than
 * duplicating that text for screen readers. Only the header instance (above
 * the fold) should pass `priority`. */
export function Logo({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={417}
      height={459}
      priority={priority}
      className={className}
    />
  );
}
