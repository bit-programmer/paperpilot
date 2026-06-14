import { authClient } from "@/app/lib/auth-client";
import { NewOrganization } from "../interfaces/organization.interface";

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
    },
    async checkSlug(slug: string) {
        const { data, error } = await authClient.organization.checkSlug({
            slug
        });
        return { data, error };
    },

    /** Invitations the current user sent (as inviter) */
    async getSentInvitations(organizationId: string) {
        const { data, error } = await authClient.organization.listInvitations({
            query: { organizationId }
        });
        return { data, error };
    },

    /** Invitations the current user received (pending) */
    async getReceivedInvitations() {
        const { data, error } = await authClient.organization.listUserInvitations();
        return { data, error };
    },

    async acceptInvitation(invitationId: string) {
        const { data, error } = await authClient.organization.acceptInvitation({
            invitationId
        });
        return { data, error };
    },

    async rejectInvitation(invitationId: string) {
        const { data, error } = await authClient.organization.rejectInvitation({
            invitationId
        });
        return { data, error };
    },

    async getFullOrganization(organizationId: string) {
        // We set active to fetch it, but usually Better Auth provides a query arg.
        // If query args aren't supported via getFullOrganization, we can just setActive and then get.
        // Actually, getFullOrganization in better-auth client is often tied to activeOrg,
        // but we can pass `query: { organizationId }` per the API definition.
        const { data, error } = await authClient.organization.getFullOrganization({
            query: { organizationId }
        });
        return { data, error };
    },

    async inviteMember(email: string, role: string, organizationId: string) {
        const { data, error } = await authClient.organization.inviteMember({
            email,
            role: role as any,
            organizationId
        });
        return { data, error };
    }
}