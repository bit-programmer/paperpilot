"use server";

import db from "@/app/core/db";
import { article, articleReview } from "@/app/core/db/schema";
import { teamMember } from "@/app/core/db/schema";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { generateId } from "better-auth";

export async function importArticlesServer(teamId: string, articlesData: any[]) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return { error: { message: "Unauthorized" } };

        const memberCheck = await db.query.teamMember.findFirst({
            where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, session.user.id))
        });
        if (!memberCheck) return { error: { message: "You are not a member of this team" } };

        const recordsToInsert = articlesData.map(data => ({
            id: generateId(15),
            teamId,
            uploadedByUserId: session.user.id,
            pmid: data.pmid ? String(data.pmid) : null,
            title: data.title,
            authors: data.authors,
            citation: data.citation,
            firstAuthor: data.firstAuthor,
            journal: data.journal,
            publicationYear: data.publicationYear ? String(data.publicationYear) : null,
            createDate: data.createDate,
            pmcid: data.pmcid,
            nihmsId: data.nihmsId,
            doi: data.doi,
        }));

        await db.insert(article).values(recordsToInsert);
        return { success: true };
    } catch (e: any) {
        console.error("importArticlesServer error:", e);
        return { error: { message: e.message || "Failed to import articles" } };
    }
}

export async function getArticlesWithReviewsServer(teamId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return { data: [], error: { message: "Unauthorized" } };

        const memberCheck = await db.query.teamMember.findFirst({
            where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, session.user.id))
        });
        if (!memberCheck) return { data: [], error: { message: "You are not a member of this team" } };

        const data = await db.query.article.findMany({
            where: eq(article.teamId, teamId),
            with: {
                reviews: {
                    with: {
                        user: {
                            columns: { id: true, name: true, image: true, email: true }
                        }
                    }
                },
                uploadedBy: {
                    columns: { id: true, name: true, image: true, email: true }
                }
            },
            orderBy: (articles, { desc }) => [desc(articles.createdAt)]
        });

        return { data, error: null };
    } catch (e: any) {
        console.error("getArticlesWithReviewsServer error:", e);
        return { data: [], error: { message: e.message || "Failed to fetch articles" } };
    }
}

export async function getArticleDetailsServer(articleId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return { data: null, error: { message: "Unauthorized" } };

        const data = await db.query.article.findFirst({
            where: eq(article.id, articleId),
            with: {
                reviews: {
                    with: {
                        user: {
                            columns: { id: true, name: true, image: true, email: true }
                        }
                    }
                },
                uploadedBy: {
                    columns: { id: true, name: true, image: true, email: true }
                }
            }
        });

        if (!data) return { data: null, error: { message: "Article not found" } };

        const memberCheck = await db.query.teamMember.findFirst({
            where: and(eq(teamMember.teamId, data.teamId), eq(teamMember.userId, session.user.id))
        });
        if (!memberCheck) return { data: null, error: { message: "You are not a member of this team" } };

        return { data, error: null };
    } catch (e: any) {
        console.error("getArticleDetailsServer error:", e);
        return { data: null, error: { message: e.message || "Failed to fetch article details" } };
    }
}

export async function submitArticleReviewServer(articleId: string, reviewData: { decision?: string; priority?: string; notes?: string; checklist?: any }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return { error: { message: "Unauthorized" } };

        const art = await db.query.article.findFirst({ where: eq(article.id, articleId) });
        if (!art) return { error: { message: "Article not found" } };

        const memberCheck = await db.query.teamMember.findFirst({
            where: and(eq(teamMember.teamId, art.teamId), eq(teamMember.userId, session.user.id))
        });
        if (!memberCheck) return { error: { message: "You are not a member of this team" } };

        const existing = await db.query.articleReview.findFirst({
            where: and(eq(articleReview.articleId, articleId), eq(articleReview.userId, session.user.id))
        });

        if (existing) {
            await db.update(articleReview)
                .set({ ...reviewData, updatedAt: new Date() })
                .where(eq(articleReview.id, existing.id));
        } else {
            await db.insert(articleReview).values({
                id: generateId(15),
                articleId,
                userId: session.user.id,
                ...reviewData
            });
        }

        return { success: true };
    } catch (e: any) {
        console.error("submitArticleReviewServer error:", e);
        return { error: { message: e.message || "Failed to submit review" } };
    }
}
