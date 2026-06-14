import { useState } from "react";
import { addTeamMemberServer } from "../services/team-server.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export const useAddTeamMember = () => {
    const [loading, setLoading] = useState(false);

    const addTeamMember = async (teamId: string, userId: string, role: "admin" | "member") => {
        setLoading(true);
        try {
            const result = await addTeamMemberServer(teamId, userId, role);
            if (result?.error) {
                toast.error(result.error.message || "Failed to add team member");
                return false;
            }
            toast.success("Team member added successfully!");
            return true;
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to add team member";
            logger.error({ err: e, msg });
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addTeamMember, loading };
};
