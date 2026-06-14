"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArticleDetailsServer, submitArticleReviewServer } from "@/app/services/article-server.service";
import { authClient } from "@/app/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

const DEFAULT_CHECKLIST = [
    { id: "c1", text: "Read abstract and verify inclusion criteria" },
    { id: "c2", text: "Evaluate methodology and risk of bias" },
    { id: "c3", text: "Extract relevant data points" }
];

export default function ArticleEditorPage() {
    const params = useParams();
    const router = useRouter();
    const organizationId = params.id as string;
    const teamId = params.teamId as string;
    const articleId = params.articleId as string;

    const { data: session } = authClient.useSession();
    const currentUserId = session?.user?.id;

    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [myDecision, setMyDecision] = useState("Unreviewed");
    const [myPriority, setMyPriority] = useState("Medium");
    const [myNotes, setMyNotes] = useState("");
    const [myChecklist, setMyChecklist] = useState<any[]>([]);

    const fetchArticle = useCallback(async () => {
        setLoading(true);
        const { data, error } = await getArticleDetailsServer(articleId);
        if (error) {
            toast.error(error.message);
        } else {
            setArticle(data);
            const myReview = data?.reviews?.find((r: any) => r.userId === currentUserId);
            setMyDecision(myReview?.decision || "Unreviewed");
            setMyPriority(myReview?.priority || "Medium");
            setMyNotes(myReview?.notes || "");
            
            // Initialize checklist
            let loadedChecklist = myReview?.checklist;
            if (!loadedChecklist || loadedChecklist.length === 0) {
                loadedChecklist = DEFAULT_CHECKLIST.map(c => ({ ...c, completed: false }));
            }
            setMyChecklist(loadedChecklist);
        }
        setLoading(false);
    }, [articleId, currentUserId]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    const handleSaveReview = async () => {
        const loadingToast = toast.loading("Saving review...");
        const { error } = await submitArticleReviewServer(articleId, {
            decision: myDecision,
            priority: myPriority,
            notes: myNotes,
            checklist: myChecklist
        });

        if (error) {
            toast.error(error.message, { id: loadingToast });
        } else {
            toast.success("Review saved successfully", { id: loadingToast });
            fetchArticle(); // refresh to show updated team progress
        }
    };

    const toggleChecklistItem = (id: string) => {
        setMyChecklist(prev => prev.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading article editor...</div>;
    if (!article) return <div style={{ padding: 40, textAlign: "center" }}>Article not found</div>;

    const completedCount = myChecklist.filter(c => c.completed).length;
    const progressPercent = Math.round((completedCount / myChecklist.length) * 100) || 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--background)" }}>
            {/* Header */}
            <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, background: "var(--card)" }}>
                <Link 
                    href={`/ui/dashboard/organization/${organizationId}/team/${teamId}`} 
                    style={{ textDecoration: "none", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
                >
                    &larr; Back to Team
                </Link>
                <div style={{ width: 1, height: 24, background: "var(--border)" }} />
                <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {article.title}
                </h1>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                        {progressPercent}% Complete
                    </div>
                    <div style={{ width: 100, height: 8, background: "var(--muted)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "oklch(0.6 0.2 250)", transition: "width 0.3s" }} />
                    </div>
                    <button 
                        onClick={handleSaveReview}
                        style={{ padding: "8px 16px", background: "oklch(0.6 0.2 250)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                    >
                        Save Progress
                    </button>
                </div>
            </div>

            {/* Split Screen */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                
                {/* Left: Article Reader */}
                <div style={{ flex: 1.5, overflowY: "auto", padding: 40, borderRight: "1px solid var(--border)" }}>
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                            <span style={{ padding: "4px 10px", background: "var(--muted)", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
                                PMID: {article.pmid || "N/A"}
                            </span>
                            <span style={{ padding: "4px 10px", background: "var(--muted)", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, color: "var(--muted-foreground)" }}>
                                {article.publicationYear || "Unknown Year"}
                            </span>
                        </div>
                        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{article.title}</h2>
                        <p style={{ fontSize: "1.1rem", color: "var(--muted-foreground)", marginBottom: 32, lineHeight: 1.6 }}>
                            {article.authors}
                        </p>

                        <div style={{ padding: 24, background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 32 }}>
                            <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "var(--foreground)" }}>Citation details</h3>
                            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                                {article.citation || "No citation provided."}
                            </p>
                        </div>

                        {article.pmid && (
                            <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noreferrer" 
                               style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "oklch(0.6 0.2 250 / 0.1)", color: "oklch(0.6 0.2 250)", borderRadius: 12, textDecoration: "none", fontWeight: 600 }}>
                                View Full Text on PubMed ↗
                            </a>
                        )}
                    </div>
                </div>

                {/* Right: Review Workspace */}
                <div style={{ flex: 1, overflowY: "auto", background: "var(--muted)", padding: 32 }}>
                    
                    {/* Checklist */}
                    <div style={{ background: "var(--card)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 24 }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>My To-Do List</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {myChecklist.map((item) => (
                                <label key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                                    <input 
                                        type="checkbox" 
                                        checked={item.completed} 
                                        onChange={() => toggleChecklistItem(item.id)}
                                        style={{ width: 20, height: 20, marginTop: 2, accentColor: "oklch(0.6 0.2 250)" }}
                                    />
                                    <span style={{ fontSize: "0.95rem", color: item.completed ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: item.completed ? "line-through" : "none", lineHeight: 1.4 }}>
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Review Form */}
                    <div style={{ background: "var(--card)", padding: 24, borderRadius: 16, border: "1px solid var(--border)", marginBottom: 24 }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Final Decision</h3>
                        
                        <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Decision</label>
                        <select 
                            value={myDecision} 
                            onChange={(e) => setMyDecision(e.target.value)}
                            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", marginBottom: 20, fontSize: "0.95rem" }}
                        >
                            <option value="Unreviewed">Unreviewed</option>
                            <option value="Include">Include</option>
                            <option value="Exclude">Exclude</option>
                            <option value="Maybe">Maybe</option>
                        </select>

                        <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Notes</label>
                        <textarea 
                            value={myNotes}
                            onChange={(e) => setMyNotes(e.target.value)}
                            placeholder="Provide your reasoning or exact data extractions here..."
                            style={{ width: "100%", height: 120, padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", resize: "none", fontSize: "0.95rem" }}
                        />
                    </div>

                    {/* Team Tracker */}
                    <div style={{ background: "var(--card)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Team Progress</h3>
                        {article.reviews?.length === 0 ? (
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted-foreground)" }}>No one has started reviewing this yet.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {article.reviews?.map((r: any) => {
                                    const tasks = r.checklist || [];
                                    const cCount = tasks.filter((t:any) => t.completed).length;
                                    const total = tasks.length || DEFAULT_CHECKLIST.length;
                                    const pct = Math.round((cCount / total) * 100) || 0;
                                    
                                    return (
                                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "var(--foreground)" }}>
                                                {r.user?.image ? <img src={r.user.image} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} /> : r.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{r.user?.name}</div>
                                                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Decision: {r.decision}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{pct}%</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{cCount}/{total} tasks</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
