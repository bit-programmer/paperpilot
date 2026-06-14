"use client";

import { useState } from "react";
import { useCreateTeam } from "@/app/hooks/useCreateTeam";

const ACCENT = "oklch(0.5 0.25 290)";

export const CreateTeamModal = ({
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
    const [name, setName] = useState("");
    const { createTeam, loading } = useCreateTeam();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createTeam(name, organizationId);
        if (success) {
            setName("");
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
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)" }}>Create Team</h2>
                    <button onClick={onClose} style={{
                        background: "var(--muted)", border: "none", width: 32, height: 32, borderRadius: 16,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        color: "var(--muted-foreground)"
                    }}>
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>Team Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Engineering"
                            required
                            style={{
                                width: "100%", padding: "12px 16px", borderRadius: 12,
                                border: "1px solid var(--border)", background: "var(--background)",
                                color: "var(--foreground)", fontSize: "0.95rem", outline: "none",
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        style={{
                            padding: "12px", borderRadius: 12, border: "none", cursor: loading || !name.trim() ? "not-allowed" : "pointer",
                            background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                            opacity: loading || !name.trim() ? 0.7 : 1, transition: "opacity 0.2s",
                            marginTop: 8
                        }}
                    >
                        {loading ? "Creating..." : "Create Team"}
                    </button>
                </form>
            </div>
        </div>
    );
};
