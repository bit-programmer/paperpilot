import { betterAuth, generateId } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/app/core/db";
import { sendMail } from "@/app/utils/mailer";
import env from "@/app/utils/env.server";
import { render } from "react-email";
import VerifyEmail from "@/app/mail-templates/verification-mail";
import InvitationEmail from "@/app/mail-templates/invitation-mail";
import React from "react";
import { logger } from "./logger.server";
import { organization } from "better-auth/plugins";
import { ac, orgAdminRole, orgMemberRole } from "./auth-ac";
import { eq, and } from "drizzle-orm";
import { member, teamMember } from "@/app/core/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            logger.info(`Sending verification mail to ${user.email}`);
            await sendMail({
                from: env.MAIL_ID,
                to: user.email,
                subject: "Verify your email address",
                html: await render(
                    React.createElement(VerifyEmail, {
                        companyName: env.APP_NAME,
                        url,
                        userName: user.name,
                    })
                ),
            });
        },
    },
    plugins: [
        organization({
            /**
             * Attach the shared access control instance so Better Auth
             * can enforce org-level permissions on its built-in endpoints.
             */
            ac,
            roles: {
                admin: orgAdminRole,
                member: orgMemberRole,
            },

            /**
             * The user who creates an organization is automatically
             * assigned the "admin" role in the `member` table.
             */
            creatorRole: "admin",

            /**
             * Enable the teams feature within organizations.
             * Teams live inside an org; members must be org members first.
             */
            teams: {
                enabled: true,
                defaultTeam: {
                    enabled: false
                }
            },

            /**
             * Send an invitation email whenever an org admin invites
             * someone by email (authClient.organization.inviteMember).
             *
             * Better Auth passes a signed `url` that the invitee must
             * visit to accept (it calls the /organization/accept-invitation
             * API endpoint internally and then redirects).
             */
            sendInvitationEmail: async (data: any) => {
                const { invitation, inviter, organization: org } = data;
                // Construct URL explicitly since better-auth no longer provides it in the payload
                const url = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/ui/dashboard`;
                logger.info(
                    { inviteeEmail: invitation.email, orgId: org.id, role: invitation.role },
                    "Sending org invitation email"
                );
                await sendMail({
                    from: env.MAIL_ID,
                    to: invitation.email,
                    subject: `You're invited to join ${org.name} on ${env.APP_NAME}`,
                    html: await render(
                        React.createElement(InvitationEmail, {
                            companyName: env.APP_NAME,
                            organizationName: org.name,
                            inviterName: inviter.name,
                            role: invitation.role ?? "member",
                            url,
                        })
                    ),
                });
            },

            organizationHooks: {
                afterCreateTeam: async ({ team, user }) => {
                    if (!user) return;
                    const existing = await db.query.teamMember.findFirst({
                        where: and(
                            eq(teamMember.teamId, team.id),
                            eq(teamMember.userId, user.id)
                        )
                    });
                    if (existing) {
                        await db.update(teamMember)
                            .set({ role: "admin" })
                            .where(eq(teamMember.id, existing.id));
                    } else {
                        await db.insert(teamMember).values({
                            id: generateId(32),
                            teamId: team.id,
                            userId: user.id,
                            role: "admin",
                            createdAt: new Date(),
                        });
                    }
                },

                /**
                 * Enforce team-member addition rules before writing to `team_member`:
                 *
                 * 1. The user being added MUST already be an org member.
                 * 2. Org admins can add anyone → bypass team-role check.
                 * 3. Team admins can add org members → allowed.
                 * 4. Team members cannot add anyone → rejected.
                 */
                beforeAddTeamMember: async ({ teamMember: newTeamMember, team, user }) => {
                    if (!user) return;
                    const orgId = team.organizationId;

                    // ── 1. Verify the person being added is an org member ──────────
                    const targetOrgMembership = await db.query.member.findFirst({
                        where: and(
                            eq(member.userId, newTeamMember.userId),
                            eq(member.organizationId, orgId)
                        ),
                    });

                    if (!targetOrgMembership) {
                        throw new Error(
                            "The user must be a member of the organization before being added to a team."
                        );
                    }

                    // ── 2. Check requester's org role — org admins override everything ──
                    const requesterOrgMembership = await db.query.member.findFirst({
                        where: and(
                            eq(member.userId, user.id),
                            eq(member.organizationId, orgId)
                        ),
                    });

                    if (requesterOrgMembership?.role === "admin") {
                        // Org admin: allow unconditionally
                        return;
                    }

                    // ── 3. Check requester's team role — only team admins may add members ──
                    const requesterTeamMembership = await db.query.teamMember.findFirst({
                        where: and(
                            eq(teamMember.userId, user.id),
                            eq(teamMember.teamId, team.id)
                        ),
                    });

                    if (requesterTeamMembership?.role !== "admin") {
                        throw new Error(
                            "Only team admins or organization admins can add members to a team."
                        );
                    }
                },
            },
        }),
    ],
});