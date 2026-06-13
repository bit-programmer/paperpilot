import { authClient } from "@/app/lib/auth-client";
import { NewOrganization, Organization } from "../interfaces/organization.interface";

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
    },
    async createNewOrganization(organization: NewOrganization) {
        const { data, error } = await authClient.organization.create(organization);
        return { data, error };
    }
}