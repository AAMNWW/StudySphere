import { z } from "zod";

/** A saved link to online study material. Only http(s) — a `javascript:`
 * or `data:` URL would run in the page when clicked. */
export const resourceSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Paste a link.")
    .max(2000, "That link is too long.")
    .transform((value) => (/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`))
    .refine((value) => {
      try {
        const url = new URL(value);
        return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
      } catch {
        return false;
      }
    }, "Enter a valid web link, like https://example.com."),
  title: z.string().trim().max(150, "Title must be 150 characters or fewer."),
  note: z.string().trim().max(500, "Note must be 500 characters or fewer."),
});
