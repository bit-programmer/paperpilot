import { createAuthClient } from "better-auth/react";
import env from "@/app/utils/env";

export const authClient = createAuthClient({
    baseURL: env.BETTER_AUTH_URL
});