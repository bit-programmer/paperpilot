import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "sonner";
import { logger } from "@/app/lib/logger.client";
import { DEFAULT_SENT_INVITATIONS_FETCH_ERROR } from "@/app/utils/constants";

export type SentInvitation = {
    id: string;
    email: string;
    role: string | null;
    status: string;
    organizationId: string;
    expiresAt: Date;
    createdAt: Date;
};

/**
 * Fetches invitations sent within a specific organization.
 * Only org admins can see the full list of invitations they've sent.
 * Pass `organizationId` of the currently active/selected organization.
 */
export const useSentInvitations = (organizationId: string | null) => {
    const [invitations, setInvitations] = useState<SentInvitation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!organizationId) {
            setInvitations([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // listInvitations requires an organizationId and returns all invites for that org
            const { data, error: err } = await authClient.organization.listInvitations({
                query: { organizationId }
            });
            if (err) {
                const msg = err.message || DEFAULT_SENT_INVITATIONS_FETCH_ERROR;
                setError(msg);
                toast.error(msg);
                return;
            }
            setInvitations((data ?? []) as SentInvitation[]);
        } catch (e) {
            const msg = e instanceof Error ? e.message : DEFAULT_SENT_INVITATIONS_FETCH_ERROR;
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

    const cancel = async (invitationId: string) => {
        try {
            const { error: err } = await authClient.organization.cancelInvitation({
                invitationId
            });
            if (err) {
                toast.error(err.message || "Failed to cancel invitation");
                return false;
            }
            toast.success("Invitation cancelled successfully");
            fetch();
            return true;
        } catch (e) {
            toast.error("Failed to cancel invitation");
            return false;
        }
    };

    return { invitations, loading, error, refetch: fetch, cancel };
};
