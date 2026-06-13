"use client";

import { useCreateOrganization } from "@/app/hooks/useCreateOrganization";
import { useOrganization } from "@/app/hooks/useOrganization";
import { NewOrganization } from "@/app/interfaces/organization.interface";
import { clientPaths } from "@/app/utils/path.client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const Dashboard = () => {

    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const { organizations, loading: fetchLoading } = useOrganization(limit, offset);

    const [organizationName, setOrganizationName] = useState("");
    const { createOrganization, loading: createLoading } = useCreateOrganization();

    const router = useRouter();
    const onSuccessNewOrganizationCb = useCallback((id: string) => {
        router.replace(clientPaths.organizationPage.getHref(id));
    }, [router]);

    const onNewOrganizationSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const org : NewOrganization = {
            name: organizationName,
            slug: organizationName,
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
                    <button type="submit">Create</button>
                    {createLoading && <div>create loading...</div>}
                </form>
            </div>
        </>
    );
}

export default Dashboard;