"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useFullOrganization } from "@/app/hooks/useFullOrganization";
import { useSentInvitations } from "@/app/hooks/useSentInvitations";
import { useInviteMember } from "@/app/hooks/useInviteMember";
import { clientPaths } from "@/app/utils/path.client";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "sonner";
import { CreateTeamModal } from "./components/CreateTeamModal";

// ─── Icons ────────────────────────────────────────────────────────────────────
const MailSentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" />
    </svg>
);
const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const TeamIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);
const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);
const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5v14" />
    </svg>
);
const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
};

const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getRoleBadgeStyle = (role: string | null) => {
    switch (role?.toLowerCase()) {
        case "admin": return { bg: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "rgba(139,92,246,0.25)" };
        case "owner": return { bg: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "rgba(234,179,8,0.25)" };
        default: return { bg: "rgba(99,102,241,0.12)", color: "#818cf8", border: "rgba(99,102,241,0.25)" };
    }
};

const ACCENT = "oklch(0.6 0.2 250)";
const ACCENT_SOFT = "rgba(99,102,241,0.08)";

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: ACCENT_SOFT, color: ACCENT,
        }}>
            {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--foreground)" }}>{title}</h2>
        {count !== undefined && (
            <span style={{
                marginLeft: 4, fontSize: "0.72rem", fontWeight: 600,
                background: ACCENT_SOFT, color: ACCENT,
                padding: "2px 8px", borderRadius: 20,
            }}>{count}</span>
        )}
    </div>
);

const SkeletonRow = () => (
    <div style={{
        borderRadius: 12, padding: "14px 18px", marginBottom: 10,
        background: "var(--card)", border: "1px solid var(--border)",
        animation: "pulse 1.5s ease-in-out infinite",
    }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--muted)" }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: "40%", borderRadius: 6, background: "var(--muted)", marginBottom: 6 }} />
                <div style={{ height: 11, width: "25%", borderRadius: 6, background: "var(--muted)" }} />
            </div>
            <div style={{ width: 60, height: 22, borderRadius: 20, background: "var(--muted)" }} />
        </div>
    </div>
);

const EmptyState = ({ label }: { label: string }) => (
    <div style={{
        textAlign: "center", padding: "40px 20px",
        borderRadius: 14, border: "1px dashed var(--border)",
        color: "var(--muted-foreground)", fontSize: "0.875rem",
    }}>
        {label}
    </div>
);

// ─── Row Components ───────────────────────────────────────────────────────────
const SentInvitationRow = ({ inv }: { inv: { id: string; email: string; role: string | null; status: string; expiresAt: Date; createdAt: Date } }) => {
    const badge = getRoleBadgeStyle(inv.role);
    const statusColor = inv.status === "pending" ? "#fbbf24" : inv.status === "accepted" ? "#34d399" : "#f87171";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)",
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: ACCENT_SOFT, display: "flex", alignItems: "center", justifyContent: "center",
                color: ACCENT, fontWeight: 700, fontSize: "0.8rem",
            }}>
                {inv.email[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.email}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: 2 }}>Sent {formatDate(inv.createdAt)} · Expires {formatDate(inv.expiresAt)}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {inv.role ?? "member"}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                    {inv.status}
                </span>
            </div>
        </div>
    );
};

const MemberRow = ({ member, isCurrentUser }: { member: { user: { name: string; email: string; image?: string | null }; role: string; createdAt: Date }, isCurrentUser: boolean }) => {
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

// ─── Modals ───────────────────────────────────────────────────────────────────
const InviteMemberModal = ({
    isOpen,
    onClose,
    organizationId,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    onSuccess: () => void;
}) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const { inviteMember, loading } = useInviteMember();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await inviteMember(email, role, organizationId);
        if (success) {
            setEmail("");
            setRole("member");
            onSuccess();
            onClose();
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease",
        }}>
            <div style={{
                width: "100%", maxWidth: 400, background: "var(--card)",
                borderRadius: 20, padding: 32, border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
                animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem", fontWeight: 700, color: "var(--foreground)" }}>
                    Invite Member
                </h2>
                <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                    Send an invitation to join this organization.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            style={{
                                width: "100%", padding: "12px 14px", borderRadius: 10,
                                background: "var(--muted)", border: "1px solid var(--border)",
                                color: "var(--foreground)", fontSize: "0.95rem",
                                outline: "none", transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => e.target.style.borderColor = ACCENT}
                            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                        />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{
                                width: "100%", padding: "12px 14px", borderRadius: 10,
                                background: "var(--muted)", border: "1px solid var(--border)",
                                color: "var(--foreground)", fontSize: "0.95rem",
                                outline: "none", transition: "border-color 0.2s", cursor: "pointer",
                            }}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                                background: "transparent", border: "1px solid var(--border)",
                                color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.875rem",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!email || loading}
                            style={{
                                flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                                background: ACCENT, border: "none",
                                color: "#fff", fontWeight: 700, fontSize: "0.875rem",
                                opacity: (!email || loading) ? 0.5 : 1,
                                transition: "opacity 0.15s",
                            }}
                        >
                            {loading ? "Sending…" : "Send Invite"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const TeamRow = ({ team, onClick }: { team: { id: string; name: string; createdAt: Date }, onClick: () => void }) => {
    return (
        <div 
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)",
                cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; }}
        >
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.6 0.2 260), oklch(0.5 0.18 290))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.8rem",
            }}>
                {getInitials(team.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockIcon /> Created {formatDate(team.createdAt)}
                </div>
            </div>
        </div>
    );
};

export default function OrganizationDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { data: session } = authClient.useSession();

    const { organization: org, loading: orgLoading, refetch: refetchOrg } = useFullOrganization(id);
    const { invitations: sentInvitations, loading: sentLoading, refetch: refetchInvites } = useSentInvitations(id);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

    const pendingInvitations = sentInvitations.filter(i => i.status === "pending");
    const isOrgAdmin = org?.members?.find(m => m.userId === session?.user.id)?.role === "admin";

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
                .org-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
                @media (max-width: 860px) { .org-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div style={{
                minHeight: "100vh", background: "var(--background)",
                padding: "40px 24px", maxWidth: 1080, margin: "0 auto",
                animation: "fadeIn 0.3s ease",
            }}>
                {/* Back Link */}
                <button
                    onClick={() => router.push(clientPaths.dashboard.getHref())}
                    style={{
                        all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        color: "var(--muted-foreground)", fontSize: "0.85rem", fontWeight: 600,
                        marginBottom: 24, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; }}
                >
                    <ArrowLeftIcon /> Back to Dashboard
                </button>

                {/* Header Profile */}
                {orgLoading ? (
                    <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 40 }}>
                        <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--muted)", animation: "pulse 1.5s infinite" }} />
                        <div>
                            <div style={{ width: 200, height: 28, borderRadius: 8, background: "var(--muted)", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
                            <div style={{ width: 120, height: 16, borderRadius: 6, background: "var(--muted)", animation: "pulse 1.5s infinite" }} />
                        </div>
                    </div>
                ) : org ? (
                    <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 40 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                            background: `linear-gradient(135deg, ${ACCENT}, oklch(0.5 0.25 290))`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "1.8rem", letterSpacing: 1,
                            boxShadow: `0 8px 24px rgba(99,102,241,0.2)`,
                        }}>
                            {org.logo ? <img src={org.logo} alt={org.name} style={{ width: "100%", height: "100%", borderRadius: 20, objectFit: "cover" }} /> : getInitials(org.name)}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
                                {org.name}
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                                <span style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                                    {org.slug}
                                </span>
                                <span style={{ color: "var(--border)" }}>|</span>
                                <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <ClockIcon /> Created {formatDate(org.createdAt)}
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
                                <button
                                    onClick={async () => {
                                        const { error } = await authClient.signOut();
                                        if (error) toast.error("Failed to sign out");
                                        else router.push(clientPaths.signin.getHref());
                                    }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "10px 18px", borderRadius: 12, border: "1px solid var(--border)",
                                        background: "transparent", color: "var(--foreground)",
                                        fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                >
                                    <LogoutIcon /> Logout
                                </button>
                            {isOrgAdmin && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
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
                                    <PlusIcon /> Invite Member
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                ) : (
                    <EmptyState label="Organization not found." />
                )}

                {/* Main Content Grid */}
                {org && (
                    <div className="org-grid">
                        {/* ── Members ── */}
                        <div>
                            <SectionHeader icon={<UsersIcon />} title="Members" count={org.members?.length || 0} />
                            {!org.members?.length ? (
                                <EmptyState label="No members in this organization." />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {org.members.map((member) => (
                                        <MemberRow key={member.id} member={member} isCurrentUser={member.user.email === session?.user.email} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Sent Invitations ── */}
                        {isOrgAdmin && (
                            <div>
                                <SectionHeader icon={<MailSentIcon />} title="Pending Invitations" count={pendingInvitations.length} />
                                {sentLoading ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {[1, 2].map((i) => <SkeletonRow key={i} />)}
                                    </div>
                                ) : !pendingInvitations.length ? (
                                    <EmptyState label="No pending invitations sent from this organization." />
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {pendingInvitations.map((inv) => (
                                            <SentInvitationRow key={inv.id} inv={inv} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Teams ── */}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <SectionHeader icon={<TeamIcon />} title="Teams" count={org.teams?.length || 0} />
                                <button
                                    onClick={() => setShowCreateTeamModal(true)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)",
                                        background: "transparent", color: "var(--foreground)",
                                        fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                                    }}
                                >
                                    <PlusIcon /> Create Team
                                </button>
                            </div>
                            {!org.teams?.length ? (
                                <EmptyState label="No teams in this organization yet." />
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                                    {org.teams.map((team) => (
                                        <TeamRow key={team.id} team={team} onClick={() => router.push(clientPaths.organizationPage.getHref(id) + `/team/${team.id}`)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                organizationId={id}
                onSuccess={() => {
                    refetchOrg();
                    refetchInvites();
                }}
            />

            <CreateTeamModal
                isOpen={showCreateTeamModal}
                onClose={() => setShowCreateTeamModal(false)}
                organizationId={id}
                onSuccess={() => refetchOrg()}
            />
        </>
    );
}
