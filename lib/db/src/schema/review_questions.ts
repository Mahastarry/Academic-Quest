import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewQuestionsTable = pgTable("review_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  bloomLevel: text("bloom_level").notNull(),
  difficulty: text("difficulty").notNull(),
  chapter: text("chapter").notNull(),
  evidenceQuote: text("evidence_quote"),
  uploadId: integer("upload_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewQuestionSchema = createInsertSchema(reviewQuestionsTable).omit({ id: true, createdAt: true });
export type InsertReviewQuestion = z.infer<typeof insertReviewQuestionSchema>;
export type ReviewQuestion = typeof reviewQuestionsTable.$inferSelect;
