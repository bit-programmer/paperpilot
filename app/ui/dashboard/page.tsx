"use client";

import { useCreateOrganization } from "@/app/hooks/useCreateOrganization";
import { useOrganization } from "@/app/hooks/useOrganization";
import { NewOrganization } from "@/app/interfaces/organization.interface";
import { clientPaths } from "@/app/utils/path.client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useCheckSlugAvailability } from "@/app/hooks/useCheckSlugAvailability";

const Dashboard = () => {

    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const { organizations, loading: fetchLoading } = useOrganization(limit, offset);

    const [organizationName, setOrganizationName] = useState("");
    const { isChecking: isCheckingSlug, isAvailable: isSlugAvailable, slug } = useCheckSlugAvailability(organizationName);

    const { createOrganization, loading: createLoading } = useCreateOrganization();

    const router = useRouter();
    const onSuccessNewOrganizationCb = useCallback((id: string) => {
        router.replace(clientPaths.organizationPage.getHref(id));
    }, [router]);

    const onNewOrganizationSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!slug || isSlugAvailable !== true) {
            return;
        }
        const org : NewOrganization = {
            name: organizationName,
            slug,
            logo: null,
            metadata: {},
            keepCurrentActiveOrganization: false
        };
        createOrganization(org, onSuccessNewOrganizationCb);
    }

    return (
        <>
            <div>Welcome to Dashboard</div>
            <div>
                {organizations && organizations.map(organization => <p key={organization.id}>{organization.id}</p>)}
            </div>
            <div>Create new organization</div>
            <div>
                <form onSubmit={onNewOrganizationSubmit}>
                    <input type="text" value={organizationName} onChange={e => setOrganizationName(e.target.value)} />
                    <button type="submit" disabled={isCheckingSlug || isSlugAvailable !== true || createLoading}>Create</button>
                    {isCheckingSlug && <div style={{ color: "gray", fontSize: "0.875rem", marginTop: "4px" }}>Checking slug availability...</div>}
                    {!isCheckingSlug && isSlugAvailable === true && <div style={{ color: "green", fontSize: "0.875rem", marginTop: "4px" }}>Slug is available!</div>}
                    {!isCheckingSlug && isSlugAvailable === false && <div style={{ color: "red", fontSize: "0.875rem", marginTop: "4px" }}>Slug is already taken.</div>}
                    {createLoading && <div>create loading...</div>}
                </form>
            </div>
        </>
    );
}

export default Dashboard;