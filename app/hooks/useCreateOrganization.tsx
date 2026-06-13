import { useState } from "react"
import { NewOrganization } from "../interfaces/organization.interface";
import { organizationService } from "../services/organization.service";
import { toast } from "sonner";
import { DEFAULT_CREATE_ORGANIZATION_ERROR } from "../utils/constants";
import { logger } from "../lib/logger.client";

export const useCreateOrganization = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrganization = async (organization: NewOrganization, onSuccess: (id: string) => void) => {

        // Reset the state
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await organizationService.createNewOrganization(organization);
            if(error || data == null) {
                const msg = error?.message || DEFAULT_CREATE_ORGANIZATION_ERROR;
                toast.error(msg, { position: "top-right" });
                setError(msg);
                setLoading(false);
                return;
            }
            onSuccess(data.id);
        } catch(e) {
            const msg = e instanceof Error ? e.message : DEFAULT_CREATE_ORGANIZATION_ERROR;
            logger.error(msg);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return {
        loading, error, createOrganization
    }

}