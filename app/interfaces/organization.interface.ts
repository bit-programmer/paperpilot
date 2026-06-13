export interface Organization {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    logo?: string | null | undefined;
    metadata?: unknown;
}

export interface NewOrganization {
    name: string;
    slug: string;
    logo?: string | null | undefined;
    metadata: Record<string, unknown>;
    userId?: string;
    keepCurrentActiveOrganization: boolean
}