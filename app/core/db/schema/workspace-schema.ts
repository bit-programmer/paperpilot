import { pgTable, text, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { user, team } from "./auth-schema";

export const article = pgTable("article", {
    id: text("id").primaryKey(),
    teamId: text("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
    uploadedByUserId: text("uploaded_by_user_id").references(() => user.id, { onDelete: "set null" }),

    pmid: varchar("pmid", { length: 50 }),
    title: text("title"),
    authors: text("authors"),
    citation: text("citation"),
    firstAuthor: text("first_author"),
    journal: text("journal"),
    publicationYear: varchar("publication_year", { length: 20 }),
    createDate: varchar("create_date", { length: 50 }),
    pmcid: varchar("pmcid", { length: 50 }),
    nihmsId: varchar("nihms_id", { length: 50 }),
    doi: varchar("doi", { length: 100 }),

    // To store any extra fields dynamically
    customData: json("custom_data"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleReview = pgTable("article_review", {
    id: text("id").primaryKey(),
    articleId: text("article_id").notNull().references(() => article.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),

    decision: varchar("decision", { length: 20 }), // e.g. "Include", "Exclude", "Maybe", "Unreviewed"
    notes: text("notes"),
    labels: json("labels"), // array of strings for tagging
    priority: varchar("priority", { length: 20 }), // e.g. "High", "Medium", "Low"
    checklist: json("checklist"), // array of { id, text, completed }

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const articleRelations = relations(article, ({ one, many }) => ({
    team: one(team, {
        fields: [article.teamId],
        references: [team.id],
    }),
    uploadedBy: one(user, {
        fields: [article.uploadedByUserId],
        references: [user.id],
    }),
    reviews: many(articleReview),
}));

export const articleReviewRelations = relations(articleReview, ({ one }) => ({
    article: one(article, {
        fields: [articleReview.articleId],
        references: [article.id],
    }),
    user: one(user, {
        fields: [articleReview.userId],
        references: [user.id],
    }),
}));
