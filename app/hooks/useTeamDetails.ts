import { useCallback, useEffect, useState } from "react";
import { getTeamDetails } from "../services/team-server.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export type TeamDetails = {
    id: string;
    name: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date | null;
    members: {
        id: string;
        userId: string;
        role: string;
        createdAt: Date | null;
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
};

export const useTeamDetails = (teamId: string) => {
    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!teamId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await getTeamDetails(teamId);
            if (err) {
                setError(err);
                toast.error(err);
                return;
            }
            setTeam(data as TeamDetails);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unable to fetch team details";
            logger.error({ err: e, msg });
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { team, loading, error, refetch: fetch };
};
