import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac } from "./auth-ac";

export const authClient = createAuthClient({
    plugins: [
        /**
         * Pass the shared `ac` instance so the client gets full TypeScript
         * inference for org-level permissions (e.g. authClient.organization.checkRole).
         */
        organizationClient({ ac }),
    ],
});