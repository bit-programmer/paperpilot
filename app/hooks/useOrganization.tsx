import { useCallback, useEffect, useRef, useState } from "react";
import { organizationService } from "../services/organization.service";
import { DEFAULT_ORGANIZATIONS_FETCH_ERROR } from "../utils/constants";
import { toast } from "sonner";
import { logger } from "../lib/logger.client";
import { Organization } from "../interfaces/organization.interface";

export const useOrganization = (limit: number, offset: number) => {

    const [organizations, setOrganizations] = useState<Organization[] | null>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortController = useRef<AbortController | null>(null);

    const fetchOrganizations = useCallback(async () => {
        abortController.current?.abort(); // cancel the existing request if not served yet
        const controller = new AbortController();
        abortController.current = controller;

        setLoading(true);
        setError(null);

        // Fetch all the organizations with the given range
        try {
            const { organizations, error } = await organizationService.getByPageAndLimit(limit, offset, controller.signal);
            if(error) {
                const msg = error.message || DEFAULT_ORGANIZATIONS_FETCH_ERROR;
                setError(msg);
                setLoading(false);
                toast.error(msg);
            }
            setOrganizations(organizations);
        } catch(e) {
            const msg = e instanceof Error ? e.message : DEFAULT_ORGANIZATIONS_FETCH_ERROR;
            logger.error(msg);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }

    }, [limit, offset]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrganizations();
        return () => {
            abortController.current?.abort()
        };
    }, [fetchOrganizations]);

    return {
        loading, error, organizations
    }

};