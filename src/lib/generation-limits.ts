/**
 * Shared between server-side validation (src/lib/validations/generate-content.ts)
 * and the client-side document picker (src/components/document-multi-select.tsx).
 * Kept in a plain module with no "use client"/"use server" directive so
 * either side can import it directly without crossing the boundary.
 */
export const MAX_SELECTABLE_DOCUMENTS = 5;
