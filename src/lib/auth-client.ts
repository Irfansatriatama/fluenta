import { createAuthClient } from "better-auth/react";

// Same-origin auth client for the browser.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
