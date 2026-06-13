import { authClient } from "@/app/lib/auth-client";

export const organizationService = {
    async getAll() {
        const { data: organizations, error } = await authClient.organization.list();
        return { organizations, error };
    },
    async getByPageAndLimit(limit: number, offset: number, signal?: AbortSignal) {
        const { data: organizations, error } = await authClient.organization.list({
            fetchOptions: {
                signal,
                query: {
                    limit, offset
                }
            }
        })

        return { organizations, error };
    }
}