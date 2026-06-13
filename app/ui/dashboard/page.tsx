"use client";

import { useOrganization } from "@/app/hooks/useOrganization";
import { useState } from "react";

const Dashboard = () => {

    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

    const { organizations } = useOrganization(limit, offset);

    return (
        <>
            <div>Welcome to Dashboard</div>
            <div>
                {organizations && organizations.map(organization => <p key={organization.id}>{organization.id}</p>)}
            </div>
        </>
    );
}

export default Dashboard;