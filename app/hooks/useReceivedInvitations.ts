import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "sonner";
import { logger } from "@/app/lib/logger.client";
import {
    DEFAULT_RECEIVED_INVITATIONS_FETCH_ERROR,
    DEFAULT_ACCEPT_INVITATION_ERROR,
    DEFAULT_REJECT_INVITATION_ERROR,
} from "@/app/utils/constants";

export type ReceivedInvitation = {
    id: string;
    email: string;
    role: string | null;
    status: string;
    organizationId: string;
    organizationName: string;
    organizationSlug?: string | null;
    organizationLogo?: string | null;
    inviterName?: string;
    expiresAt: Date;
    createdAt: Date;
};

export const useReceivedInvitations = () => {
    const [invitations, setInvitations] = useState<ReceivedInvitation[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // listUserInvitations returns invitations received by the current user
            const { data, error: err } = await authClient.organization.listUserInvitations();
            if (err) {
                if ((err as any).name === "AbortError") return;
                const msg = err.message || DEFAULT_RECEIVED_INVITATIONS_FETCH_ERROR;
                setError(msg);
                toast.error(msg);
                return;
            }
            setInvitations((data ?? []) as ReceivedInvitation[]);
        } catch (e: any) {
            if (e?.name === "AbortError") return;
            const msg = e instanceof Error ? e.message : DEFAULT_RECEIVED_INVITATIONS_FETCH_ERROR;
            logger.error({ err: e, msg });
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const accept = useCallback(
        async (invitationId: string) => {
            setActionLoading(invitationId);
            try {
                const { error: err } = await authClient.organization.acceptInvitation({
                    invitationId,
                });
                if (err) {
                    toast.error(err.message || DEFAULT_ACCEPT_INVITATION_ERROR);
                    return false;
                }
                toast.success("Invitation accepted!");
                await fetch();
                return true;
            } catch (e: any) {
                if (e?.name === "AbortError") return false;
                const msg = e instanceof Error ? e.message : DEFAULT_ACCEPT_INVITATION_ERROR;
                logger.error({ err: e, msg });
                toast.error(msg);
                return false;
            } finally {
                setActionLoading(null);
            }
        },
        [fetch]
    );

    const reject = useCallback(
        async (invitationId: string) => {
            setActionLoading(invitationId);
            try {
                const { error: err } = await authClient.organization.rejectInvitation({
                    invitationId,
                });
                if (err) {
                    toast.error(err.message || DEFAULT_REJECT_INVITATION_ERROR);
                    return false;
                }
                toast.success("Invitation declined.");
                await fetch();
                return true;
            } catch (e: any) {
                if (e?.name === "AbortError") return false;
                const msg = e instanceof Error ? e.message : DEFAULT_REJECT_INVITATION_ERROR;
                logger.error({ err: e, msg });
                toast.error(msg);
                return false;
            } finally {
                setActionLoading(null);
            }
        },
        [fetch]
    );

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { invitations, loading, actionLoading, error, accept, reject, refetch: fetch };
};
