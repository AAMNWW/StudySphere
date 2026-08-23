"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once the component has hydrated on the client. Needed by anything
 * that reads client-only state (theme, localStorage) to avoid a
 * server/client markup mismatch on first paint. Implemented with
 * useSyncExternalStore (rather than `useState` + a mount `useEffect`) so
 * there's no synchronous setState-in-effect for react-hooks/set-state-in-effect
 * to flag — the "external system" here is just "are we on the client yet".
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
