import { useCallback, useEffect, useState } from "react";
import { getVisibleTeamsServer } from "../services/team-server.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export const useVisibleTeams = (organizationId: string) => {
    const [teams, setTeams] = useState<{ id: string; name: string; createdAt: Date }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getVisibleTeamsServer(organizationId);
            if (result?.error) {
                const msg = result.error.message || "Unable to fetch teams";
                setError(msg);
                toast.error(msg);
                return;
            }
            if (result?.data) {
                setTeams(result.data);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unable to fetch teams";
            logger.error(msg);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { teams, loading, error, refetch: fetch };
};
