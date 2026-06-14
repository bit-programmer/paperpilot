import { useState } from "react";
import { organizationService } from "../services/organization.service";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";

export const useInviteMember = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inviteMember = async (email: string, role: string, organizationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error: err } = await organizationService.inviteMember(email, role, organizationId);
            if (err) {
                const msg = err.message || "Unable to send invitation";
                setError(msg);
                toast.error(msg);
                return false;
            }
            toast.success(`Invitation sent to ${email}`);
            return true;
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unable to send invitation";
            logger.error(msg);
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { inviteMember, loading, error };
};
