"use server";

import db from "@/app/core/db";
import { team, teamMember, user, member } from "@/app/core/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "better-auth";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export async function getTeamDetails(teamId: string) {
    const teamData = await db.query.team.findFirst({
        where: eq(team.id, teamId),
    });

    if (!teamData) {
        return { data: null, error: "Team not found" };
    }

    const membersRaw = await db
        .select({
            id: teamMember.id,
            userId: teamMember.userId,
            role: teamMember.role,
            createdAt: teamMember.createdAt,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            }
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(eq(teamMember.teamId, teamId));

    return { 
        data: {
            ...teamData,
            members: membersRaw,
        }, 
        error: null 
    };
}

export async function addTeamMemberServer(teamId: string, userId: string, role: "admin" | "member") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { error: { message: "Unauthorized" } };
    }

    const requesterId = session.user.id;

    const teamData = await db.query.team.findFirst({
        where: eq(team.id, teamId),
    });
    if (!teamData) {
        return { error: { message: "Team not found" } };
    }

    const orgId = teamData.organizationId;

    // 1. Verify target user is in the org
    const targetOrgMembership = await db.query.member.findFirst({
        where: and(eq(member.userId, userId), eq(member.organizationId, orgId)),
    });
    if (!targetOrgMembership) {
        return { error: { message: "User is not a member of the organization" } };
    }

    // 2. Verify permissions: Requester must be Org Admin OR Team Admin
    const requesterOrgMembership = await db.query.member.findFirst({
        where: and(eq(member.userId, requesterId), eq(member.organizationId, orgId)),
    });
    const requesterTeamMembership = await db.query.teamMember.findFirst({
        where: and(eq(teamMember.userId, requesterId), eq(teamMember.teamId, teamId)),
    });

    const isOrgAdmin = requesterOrgMembership?.role === "admin";
    const isTeamAdmin = requesterTeamMembership?.role === "admin";

    if (!isOrgAdmin && !isTeamAdmin) {
        return { error: { message: "Only team admins or organization admins can add members to a team" } };
    }

    // 3. Prevent duplicate insertion
    const existing = await db.query.teamMember.findFirst({
        where: and(eq(teamMember.userId, userId), eq(teamMember.teamId, teamId)),
    });
    if (existing) {
        return { error: { message: "User is already a member of this team" } };
    }

    await db.insert(teamMember).values({
        id: generateId(32),
        teamId,
        userId,
        role,
        createdAt: new Date(),
    });

    return { success: true };
}
