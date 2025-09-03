import { createAuthClient } from "better-auth/react";

// Use the current page origin in the browser to avoid cross-origin requests
// Fallback to NEXT_PUBLIC_APP_URL or localhost when rendering on the server
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
