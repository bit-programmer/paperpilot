"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { clientPaths } from "@/app/utils/path.client";
import { useTeamDetails } from "@/app/hooks/useTeamDetails";
import { useFullOrganization } from "@/app/hooks/useFullOrganization";
import { AddTeamMemberModal } from "./components/AddTeamMemberModal";
import { toast } from "sonner";

const ACCENT = "oklch(0.5 0.25 290)";

// ─── Icons ────────────────────────────────────────────────────────────────────
const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5v14" />
    </svg>
);
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
};

const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
};

const getRoleBadgeStyle = (role: string) => {
    if (role === "admin") return { bg: "oklch(0.9 0.05 140)", color: "oklch(0.4 0.15 140)", border: "oklch(0.8 0.1 140)" };
    return { bg: "var(--muted)", color: "var(--muted-foreground)", border: "var(--border)" };
};

// ─── Shared Components ────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode, title: string, count?: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ color: "var(--muted-foreground)", display: "flex" }}>{icon}</div>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>{title}</h2>
        {count !== undefined && (
            <span style={{ background: "var(--muted)", color: "var(--muted-foreground)", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>
                {count}
            </span>
        )}
    </div>
);

const EmptyState = ({ label }: { label: string }) => (
    <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--card)", borderRadius: 16, border: "1px dashed var(--border)" }}>
        <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{label}</div>
    </div>
);

const MemberRow = ({ member, isCurrentUser }: { member: { user: { name: string; email: string; image?: string | null }; role: string; createdAt: Date | null }, isCurrentUser: boolean }) => {
    const badge = getRoleBadgeStyle(member.role);
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 12, background: "var(--card)", border: isCurrentUser ? `1px solid ${ACCENT}` : "1px solid var(--border)",
            boxShadow: isCurrentUser ? `0 0 0 1px ${ACCENT}` : "none",
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.55 0.22 145), oklch(0.45 0.2 180))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.8rem",
            }}>
                {member.user.image ? <img src={member.user.image} alt={member.user.name} style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }} /> : getInitials(member.user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.user.name} {isCurrentUser && <span style={{ color: ACCENT, fontSize: "0.75rem", marginLeft: 4 }}>(You)</span>}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: 2 }}>{member.user.email}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {member.role}
                </span>
                <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockIcon /> Joined {formatDate(member.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default function TeamDashboard({ params }: { params: Promise<{ id: string, teamId: string }> }) {
    const { id: organizationId, teamId } = use(params);
    const router = useRouter();

    const { data: session } = authClient.useSession();
    // Using useActiveOrganization could be another way, but we will rely on session for checking user.

    const { team, loading: teamLoading, refetch: refetchTeam } = useTeamDetails(teamId);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const { organization: org } = useFullOrganization(organizationId);
    const isOrgAdmin = org?.members?.find(m => m.userId === session?.user.id)?.role === "admin";

    // Allow Team Admin to invite/add members. We also consider Org Admins can unconditionally do this.
    const isTeamAdmin = isOrgAdmin || team?.members?.find(m => m.userId === session?.user.id)?.role === "admin";

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
                .team-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
            `}</style>

            <div style={{
                minHeight: "100vh", background: "var(--background)",
                padding: "40px 24px", maxWidth: 1080, margin: "0 auto",
                animation: "fadeIn 0.3s ease",
            }}>
                {/* Back Link */}
                <button
                    onClick={() => router.push(clientPaths.organizationPage.getHref(organizationId))}
                    style={{
                        all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        color: "var(--muted-foreground)", fontSize: "0.85rem", fontWeight: 600,
                        marginBottom: 24, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; }}
                >
                    <ArrowLeftIcon /> Back to Organization
                </button>

                {/* Header Profile */}
                {teamLoading ? (
                    <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 40 }}>
                        <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--muted)", animation: "pulse 1.5s infinite" }} />
                        <div>
                            <div style={{ width: 200, height: 28, borderRadius: 8, background: "var(--muted)", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
                            <div style={{ width: 120, height: 16, borderRadius: 6, background: "var(--muted)", animation: "pulse 1.5s infinite" }} />
                        </div>
                    </div>
                ) : team ? (
                    <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 40 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                            background: `linear-gradient(135deg, oklch(0.6 0.2 260), oklch(0.5 0.18 290))`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "1.8rem", letterSpacing: 1,
                            boxShadow: `0 8px 24px rgba(99,102,241,0.2)`,
                        }}>
                            {getInitials(team.name)}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
                                {team.name}
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                                <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <ClockIcon /> Created {formatDate(team.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                            {session?.user && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: "1px solid var(--border)" }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: "50%", background: ACCENT, color: "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem",
                                    }}>
                                        {session.user.image ? <img src={session.user.image} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} /> : session.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>{session.user.name}</span>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>{session.user.email}</span>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 12 }}>
                                {isTeamAdmin && (
                                    <button
                                        onClick={() => setShowAddMemberModal(true)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 8,
                                            padding: "10px 18px", borderRadius: 12, border: "none",
                                            background: ACCENT, color: "#fff",
                                            fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                                            boxShadow: `0 4px 16px rgba(99,102,241,0.35)`,
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}
                                    >
                                        <PlusIcon /> Add Member
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState label="Team not found." />
                )}

                {/* Main Content Grid */}
                {team && (
                    <div className="team-grid">
                        {/* ── Members ── */}
                        <div>
                            <SectionHeader icon={<UsersIcon />} title="Team Members" count={team.members?.length || 0} />
                            {!team.members?.length ? (
                                <EmptyState label="No members in this team." />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {team.members.map((member) => (
                                        <MemberRow key={member.id} member={member} isCurrentUser={member.user.email === session?.user.email} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AddTeamMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                organizationId={organizationId}
                teamId={teamId}
                existingMemberIds={team?.members?.map(m => m.userId) || []}
                onSuccess={() => refetchTeam()}
            />
        </>
    );
}
