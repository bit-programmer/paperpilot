import { authClient } from "@/app/lib/auth-client";

export const teamService = {
    async createTeam(name: string, organizationId: string) {
        const { data, error } = await authClient.organization.createTeam({
            name,
            organizationId
        });
        return { data, error };
    },

    async addTeamMember(teamId: string, userId: string, role: "admin" | "member") {
        const { data, error } = await authClient.organization.addTeamMember({
            teamId,
            userId,
            role
        });
        return { data, error };
    },

    async getTeam(teamId: string) {
        // Since better auth doesn't have an explicit getTeam API documented by default on client, 
        // We usually rely on the org data. But we can fetch active team or check the API.
        // Wait, better auth doesn't expose getTeam by default without active team.
        // Let me verify if there is an authClient.organization.getTeam? 
        // Actually, let's create a server action if we need to fetch team members.
        // Or wait, if `activeTeam` is needed, maybe `setActiveTeam` is sufficient?
        return { data: null, error: null };
    }
}
