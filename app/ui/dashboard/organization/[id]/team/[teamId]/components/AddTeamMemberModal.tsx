"use client";

import { useState } from "react";
import { useAddTeamMember } from "@/app/hooks/useAddTeamMember";
import { useFullOrganization } from "@/app/hooks/useFullOrganization";

const ACCENT = "oklch(0.5 0.25 290)";

export const AddTeamMemberModal = ({
    isOpen,
    onClose,
    organizationId,
    teamId,
    existingMemberIds,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    teamId: string;
    existingMemberIds: string[];
    onSuccess: () => void;
}) => {
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("member");
    const { addTeamMember, loading } = useAddTeamMember();
    
    // Fetch org members to populate the dropdown
    const { organization: org, loading: orgLoading } = useFullOrganization(organizationId);

    const availableMembers = org?.members?.filter(m => !existingMemberIds.includes(m.userId)) || [];
    const selectedOrgMember = org?.members?.find(m => m.userId === userId);
    const isSelectedUserOrgAdmin = selectedOrgMember?.role === "admin";

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        const finalRole = isSelectedUserOrgAdmin ? "admin" : (role as "admin" | "member");
        const success = await addTeamMember(teamId, userId, finalRole);
        if (success) {
            setUserId("");
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)" }}>Add Team Member</h2>
                    <button onClick={onClose} style={{
                        background: "var(--muted)", border: "none", width: 32, height: 32, borderRadius: 16,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        color: "var(--muted-foreground)"
                    }}>
                        ✕
                    </button>
                </div>
                
                {orgLoading ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--muted-foreground)" }}>Loading organization members...</div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>Select Member</label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                                style={{
                                    width: "100%", padding: "12px 16px", borderRadius: 12,
                                    border: "1px solid var(--border)", background: "var(--background)",
                                    color: "var(--foreground)", fontSize: "0.95rem", outline: "none",
                                }}
                            >
                                <option value="" disabled>Select an existing member</option>
                                {availableMembers.map((member) => (
                                    <option key={member.userId} value={member.userId}>
                                        {member.user.name} ({member.user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isSelectedUserOrgAdmin ? (
                            <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--muted)", border: "1px dashed var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>Role: Admin (Inherited)</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                                    This user is an Organization Admin and will automatically have full admin capabilities in this team.
                                </span>
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>Role in Team</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    style={{
                                        width: "100%", padding: "12px 16px", borderRadius: 12,
                                        border: "1px solid var(--border)", background: "var(--background)",
                                        color: "var(--foreground)", fontSize: "0.95rem", outline: "none",
                                    }}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !userId}
                            style={{
                                padding: "12px", borderRadius: 12, border: "none", cursor: loading || !userId ? "not-allowed" : "pointer",
                                background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                                opacity: loading || !userId ? 0.7 : 1, transition: "opacity 0.2s",
                                marginTop: 8
                            }}
                        >
                            {loading ? "Adding..." : "Add Member"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
