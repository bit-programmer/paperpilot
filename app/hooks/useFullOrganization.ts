import { useCallback, useEffect, useState } from "react";
import { organizationService } from "../services/organization.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export type FullOrganization = {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    metadata?: unknown;
    members: {
        id: string;
        userId: string;
        role: string;
        createdAt: Date;
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
        }
    }[];
    invitations: {
        id: string;
        email: string;
        role: string | null;
        status: string;
        expiresAt: Date;
        createdAt: Date;
    }[];
    teams: {
        id: string;
        name: string;
        createdAt: Date;
    }[];
};

export const useFullOrganization = (organizationId: string) => {
    const [organization, setOrganization] = useState<FullOrganization | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await organizationService.getFullOrganization(organizationId);
            if (err) {
                const msg = err.message || "Unable to fetch organization details";
                setError(msg);
                toast.error(msg);
                return;
            }
            setOrganization(data as unknown as FullOrganization);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unable to fetch organization details";
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

    return { organization, loading, error, refetch: fetch };
};
