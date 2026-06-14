import { useState } from "react";
import { teamService } from "../services/team.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export const useCreateTeam = () => {
    const [loading, setLoading] = useState(false);

    const createTeam = async (name: string, organizationId: string) => {
        setLoading(true);
        try {
            const { data, error } = await teamService.createTeam(name, organizationId);
            if (error) {
                toast.error(error.message || "Failed to create team");
                return false;
            }
            toast.success("Team created successfully!");
            return true;
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to create team";
            logger.error({ err: e, msg });
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createTeam, loading };
};
