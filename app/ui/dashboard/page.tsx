"use client";

import { useCreateOrganization } from "@/app/hooks/useCreateOrganization";
import { useOrganization } from "@/app/hooks/useOrganization";
import { useReceivedInvitations } from "@/app/hooks/useReceivedInvitations";
import { NewOrganization, Organization } from "@/app/interfaces/organization.interface";
import { clientPaths } from "@/app/utils/path.client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useCheckSlugAvailability } from "@/app/hooks/useCheckSlugAvailability";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "sonner";

// ─── Icons ────────────────────────────────────────────────────────────────────
const BuildingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
);
const MailSentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" />
    </svg>
);
const MailInboxIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
    </svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const ArrowRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);
const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);
const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const SpinnerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getOrgInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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

const SkeletonCard = () => (
    <div style={{
        borderRadius: 14, padding: "18px 20px",
        background: "var(--card)", border: "1px solid var(--border)",
        animation: "pulse 1.5s ease-in-out infinite",
    }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--muted)" }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: "55%", borderRadius: 6, background: "var(--muted)", marginBottom: 8 }} />
                <div style={{ height: 11, width: "35%", borderRadius: 6, background: "var(--muted)" }} />
            </div>
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

// ─── Organization Card ────────────────────────────────────────────────────────
const OrgCard = ({ org, onClick }: { org: Organization; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            all: "unset", cursor: "pointer", display: "block", width: "100%",
            borderRadius: 14, padding: "18px 20px",
            background: "var(--card)", border: "1px solid var(--border)",
            transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${ACCENT}, 0 4px 20px rgba(99,102,241,0.1)`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}, oklch(0.5 0.25 290))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "0.875rem", letterSpacing: 1,
            }}>
                {org.logo ? <img src={org.logo} alt={org.name} style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} /> : getOrgInitials(org.name)}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: "0.925rem", color: "var(--foreground)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</div>
                <div style={{ fontSize: "0.775rem", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{org.slug}</div>
            </div>
            {/* Arrow */}
            <div style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
                <ArrowRightIcon />
            </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
            <ClockIcon />
            <span>Created {formatDate(org.createdAt)}</span>
        </div>
    </button>
);

// ─── Received Invitation Card ─────────────────────────────────────────────────
const ReceivedInvitationCard = ({
    inv,
    onAccept,
    onReject,
    actionLoading,
}: {
    inv: { id: string; email: string; role: string | null; organizationName: string; organizationLogo?: string | null; inviterName?: string; expiresAt: Date; createdAt: Date };
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    actionLoading: string | null;
}) => {
    const badge = getRoleBadgeStyle(inv.role);
    const isLoading = actionLoading === inv.id;
    return (
        <div style={{
            borderRadius: 14, padding: "18px 20px",
            background: "var(--card)", border: "1px solid var(--border)",
            transition: "box-shadow 0.2s",
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, oklch(0.55 0.22 145), oklch(0.45 0.2 180))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "0.875rem",
                }}>
                    {inv.organizationLogo
                        ? <img src={inv.organizationLogo} alt={inv.organizationName} style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} />
                        : getOrgInitials(inv.organizationName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.925rem", color: "var(--foreground)" }}>{inv.organizationName}</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                            {inv.role ?? "member"}
                        </span>
                    </div>
                    {inv.inviterName && (
                        <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: 4 }}>
                            Invited by <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{inv.inviterName}</span>
                        </div>
                    )}
                    <div style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: 3, display: "flex", gap: 6, alignItems: "center" }}>
                        <ClockIcon /> Expires {formatDate(inv.expiresAt)}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                    id={`accept-inv-${inv.id}`}
                    onClick={() => onAccept(inv.id)}
                    disabled={isLoading}
                    style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "9px 0", borderRadius: 10, border: "none", cursor: isLoading ? "wait" : "pointer",
                        background: "oklch(0.5 0.18 145)", color: "#fff", fontWeight: 600, fontSize: "0.82rem",
                        opacity: isLoading ? 0.7 : 1, transition: "opacity 0.15s",
                    }}
                >
                    {isLoading ? <SpinnerIcon /> : <CheckIcon />} Accept
                </button>
                <button
                    id={`reject-inv-${inv.id}`}
                    onClick={() => onReject(inv.id)}
                    disabled={isLoading}
                    style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "9px 0", borderRadius: 10, cursor: isLoading ? "wait" : "pointer",
                        background: "transparent", color: "var(--muted-foreground)",
                        border: "1px solid var(--border)", fontWeight: 600, fontSize: "0.82rem",
                        opacity: isLoading ? 0.7 : 1, transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f87171"; (e.currentTarget as HTMLElement).style.borderColor = "#f87171"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                    {isLoading ? <SpinnerIcon /> : <XIcon />} Decline
                </button>
            </div>
        </div>
    );
};

// ─── Create Org Modal ─────────────────────────────────────────────────────────
const CreateOrgModal = ({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (org: NewOrganization, cb: (id: string) => void) => void;
}) => {
    const [name, setName] = useState("");
    const { isChecking, isAvailable, slug } = useCheckSlugAvailability(name);
    const { createOrganization, loading } = useCreateOrganization();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug || isAvailable !== true || loading) return;
        createOrganization(
            { name, slug, logo: null, metadata: {}, keepCurrentActiveOrganization: false },
            (id) => { router.replace(clientPaths.organizationPage.getHref(id)); onClose(); }
        );
    };

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
                animation: "fadeIn 0.15s ease",
            }}
        >
            <div style={{
                background: "var(--card)", borderRadius: 18, padding: "32px 28px",
                width: "100%", maxWidth: 420, border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                animation: "slideUp 0.2s ease",
            }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 700, color: "var(--foreground)" }}>New Organization</h3>
                <p style={{ margin: "0 0 24px", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Create a workspace for your team.</p>
                <form onSubmit={handleSubmit}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>Organization Name</label>
                    <input
                        id="new-org-name"
                        type="text"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Acme Corp"
                        style={{
                            width: "100%", boxSizing: "border-box", padding: "10px 14px",
                            borderRadius: 10, border: "1px solid var(--border)", background: "var(--background)",
                            color: "var(--foreground)", fontSize: "0.9rem", outline: "none",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                    {/* Slug preview */}
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            flex: 1, padding: "8px 12px", borderRadius: 8,
                            background: "var(--muted)", fontSize: "0.78rem",
                            color: "var(--muted-foreground)", fontFamily: "var(--font-mono)",
                        }}>
                            {slug || "your-org-slug"}
                        </div>
                        {name && (
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                {isChecking && <span style={{ color: "var(--muted-foreground)" }}>checking…</span>}
                                {!isChecking && isAvailable === true && <span style={{ color: "#34d399" }}>✓ available</span>}
                                {!isChecking && isAvailable === false && <span style={{ color: "#f87171" }}>✗ taken</span>}
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
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
                            id="create-org-submit"
                            type="submit"
                            disabled={!slug || isAvailable !== true || loading || isChecking}
                            style={{
                                flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer",
                                background: ACCENT, border: "none",
                                color: "#fff", fontWeight: 700, fontSize: "0.875rem",
                                opacity: (!slug || isAvailable !== true || loading || isChecking) ? 0.5 : 1,
                                transition: "opacity 0.15s",
                            }}
                        >
                            {loading ? "Creating…" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { data: session } = authClient.useSession();
    const [limit] = useState(20);
    const [offset] = useState(0);
    const { organizations, loading: orgsLoading, refetch: refetchOrganizations } = useOrganization(limit, offset);

    const { invitations: receivedInvitations, loading: receivedLoading, actionLoading, accept, reject } = useReceivedInvitations();

    const handleAccept = async (id: string) => {
        const success = await accept(id);
        if (success) {
            refetchOrganizations();
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const { createOrganization } = useCreateOrganization();

    const router = useRouter();
    const goToOrg = useCallback((id: string) => {
        router.push(clientPaths.organizationPage.getHref(id));
    }, [router]);

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
                .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
                @media (max-width: 860px) { .dash-grid { grid-template-columns: 1fr; } }
            `}</style>

            <div style={{
                minHeight: "100vh", background: "var(--background)",
                padding: "40px 24px", maxWidth: 1080, margin: "0 auto",
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                            Dashboard
                        </h1>
                        <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--muted-foreground)" }}>
                            Your organizations and invitations at a glance.
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                        <button
                            id="new-org-btn"
                            onClick={() => setShowCreateModal(true)}
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
                            <PlusIcon /> New Organization
                        </button>
                    </div>
                </div>
            </div>

                {/* Stats strip */}
                <div style={{ display: "flex", gap: 14, marginBottom: 36, flexWrap: "wrap" }}>
                    {[
                        { label: "Organizations", value: organizations?.length ?? 0, color: ACCENT },
                        { label: "Pending Invites", value: receivedInvitations.length, color: "#34d399" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{
                            flex: "1 1 140px", padding: "16px 20px", borderRadius: 14,
                            background: "var(--card)", border: "1px solid var(--border)",
                        }}>
                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color }}>{value}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Main grid */}
                <div className="dash-grid">

                    {/* ── Organizations ── */}
                    <div style={{ gridColumn: "1 / -1" }}>
                        <SectionHeader icon={<BuildingIcon />} title="My Organizations" count={organizations?.length} />
                        {orgsLoading ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : !organizations?.length ? (
                            <EmptyState label="You're not part of any organization yet. Create one to get started." />
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                                {organizations.map((org) => (
                                    <OrgCard key={org.id} org={org} onClick={() => goToOrg(org.id)} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Received Invitations ── */}
                    <div>
                        <SectionHeader icon={<MailInboxIcon />} title="Invitations Received" count={receivedInvitations.length} />
                        {receivedLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {[1, 2].map((i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : !receivedInvitations.length ? (
                            <EmptyState label="No pending invitations." />
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {receivedInvitations.map((inv) => (
                                    <ReceivedInvitationCard
                                        key={inv.id}
                                        inv={inv}
                                        onAccept={handleAccept}
                                        onReject={reject}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Create Org Modal */}
            {showCreateModal && (
                <CreateOrgModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createOrganization}
                />
            )}
        </>
    );
};

export default Dashboard;