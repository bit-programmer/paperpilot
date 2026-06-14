"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getArticlesWithReviewsServer } from "@/app/services/article-server.service";
import { toast } from "sonner";
import { authClient } from "@/app/lib/auth-client";
import { useRouter, useParams } from "next/navigation";

interface ArticleReviewWorkspaceProps {
    teamId: string;
}

export function ArticleReviewWorkspace({ teamId }: ArticleReviewWorkspaceProps) {
    const router = useRouter();
    const params = useParams();
    const organizationId = params.id as string;

    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDecision, setFilterDecision] = useState<string>("All");

    // Form state for current user's review
    const [reviewState, setReviewState] = useState<Record<string, { decision: string; priority: string; notes: string }>>({});
    
    const { data: session } = authClient.useSession();
    const currentUserId = session?.user?.id;

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await getArticlesWithReviewsServer(teamId);
        if (error) {
            toast.error(error.message);
        } else {
            setArticles(data || []);
            // Initialize review state from existing user reviews
            const newReviewState: Record<string, any> = {};
            data?.forEach(art => {
                const myReview = art.reviews?.find((r: any) => r.userId === currentUserId);
                newReviewState[art.id] = {
                    decision: myReview?.decision || "Unreviewed",
                    priority: myReview?.priority || "Medium",
                    notes: myReview?.notes || ""
                };
            });
            setReviewState(newReviewState);
        }
        setLoading(false);
    }, [teamId, currentUserId]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const getDecisionBadge = (decision: string) => {
        switch (decision) {
            case "Include": return <span style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "4px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>Include</span>;
            case "Exclude": return <span style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", padding: "4px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>Exclude</span>;
            case "Maybe": return <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", padding: "4px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>Maybe</span>;
            default: return <span style={{ background: "var(--muted)", color: "var(--muted-foreground)", padding: "4px 8px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 700 }}>Unreviewed</span>;
        }
    };

    // Filter articles based on CURRENT user's decision
    const filteredArticles = articles.filter(art => {
        if (filterDecision === "All") return true;
        const myReview = reviewState[art.id]?.decision || "Unreviewed";
        return myReview === filterDecision;
    });

    if (loading) {
        return <div style={{ padding: 40, textAlign: "center", color: "var(--muted-foreground)" }}>Loading workspace...</div>;
    }

    if (articles.length === 0) {
        return (
            <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--card)", borderRadius: 16, border: "1px dashed var(--border)" }}>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No articles imported yet. Click "Upload Excel" to get started.</div>
            </div>
        );
    }

    return (
        <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Filters:</div>
                <select 
                    value={filterDecision} 
                    onChange={e => setFilterDecision(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: 8, background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "0.85rem" }}
                >
                    <option value="All">All Articles</option>
                    <option value="Unreviewed">Unreviewed</option>
                    <option value="Include">Include</option>
                    <option value="Exclude">Exclude</option>
                    <option value="Maybe">Maybe</option>
                </select>
                <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                    Showing {filteredArticles.length} of {articles.length} articles
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>PMID</th>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>Title</th>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>Journal/Year</th>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>My Decision</th>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>Progress</th>
                            <th style={{ padding: "12px 20px", fontWeight: 600 }}>Agreements</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map((art) => {
                            const myRev = reviewState[art.id];
                            
                            // Calculate aggregate decisions
                            const includes = art.reviews?.filter((r: any) => r.decision === "Include").length || 0;
                            const excludes = art.reviews?.filter((r: any) => r.decision === "Exclude").length || 0;

                            const myChecklist = myRev?.checklist || [];
                            const cCount = myChecklist.filter((t:any) => t.completed).length;
                            const total = myChecklist.length || 3; // Default 3 tasks
                            const pct = Math.round((cCount / total) * 100) || 0;

                            return (
                                <React.Fragment key={art.id}>
                                    <tr 
                                        onClick={() => router.push(`/ui/dashboard/organization/${organizationId}/team/${teamId}/article/${art.id}`)}
                                        style={{ 
                                            borderBottom: "1px solid var(--border)", 
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "14px 20px", color: "oklch(0.6 0.2 250)" }}>{art.pmid || "N/A"}</td>
                                        <td style={{ padding: "14px 20px", fontWeight: 500, maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {art.title}
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "var(--muted-foreground)" }}>
                                            {art.journal} {art.publicationYear ? `(${art.publicationYear})` : ""}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            {getDecisionBadge(myRev?.decision || "Unreviewed")}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 40, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                                                    <div style={{ width: `${pct}%`, height: "100%", background: "oklch(0.6 0.2 250)" }} />
                                                </div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                            {includes > 0 && <span style={{ color: "#34d399", marginRight: 8 }}>↑ {includes}</span>}
                                            {excludes > 0 && <span style={{ color: "#f87171" }}>↓ {excludes}</span>}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
