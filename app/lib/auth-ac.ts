import { createAccessControl } from "better-auth/plugins/access";

/**
 * Resource-level permission statements for the organization plugin.
 * These are used to build org-level roles (admin, member).
 * Note: `organization`, `member`, and `invitation` include statements
 * that the Better Auth organization plugin uses internally.
 */
const statement = {
    organization: ["update", "delete"] as const,
    member: ["create", "update", "delete", "read"] as const,
    invitation: ["create", "cancel"] as const,
    team: ["create", "update", "delete", "read"] as const,
    project: ["create", "update", "delete", "read"] as const,
    article: ["create", "update", "delete", "read"] as const,
};

export const ac = createAccessControl(statement);

/**
 * Org Admin — full control over everything:
 * inviting members, managing teams, projects and articles.
 */
export const orgAdminRole = ac.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete", "read"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete", "read"],
    project: ["create", "update", "delete", "read"],
    article: ["create", "update", "delete", "read"],
});

/**
 * Org Member — limited control:
 * - Can create teams and manage articles
 * - Cannot invite other people to the organization
 */
export const orgMemberRole = ac.newRole({
    organization: [],
    member: ["read"],
    invitation: [],
    team: ["create", "read"],
    project: ["create", "read"],
    article: ["create", "update", "delete", "read"],
});

/**
 * Team-level role constants.
 * These are stored in `team_member.role` and enforced via
 * the `beforeAddTeamMember` hook in auth.ts — not via the AC system.
 *
 * team.admin  → can add/remove org members to/from the team; full article access
 * team.member → article access only; cannot add/remove team members
 */
export const TEAM_ROLES = {
    admin: "admin",
    member: "member",
} as const;

export type TeamRole = (typeof TEAM_ROLES)[keyof typeof TEAM_ROLES];
