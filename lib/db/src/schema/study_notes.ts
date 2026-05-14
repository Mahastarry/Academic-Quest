import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studyNotesTable = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  chapter: text("chapter").notNull(),
  content: text("content").notNull(),
  keyTakeaways: text("key_takeaways").array().notNull().default([]),
  definitions: text("definitions").array().notNull().default([]),
  formulaBlocks: text("formula_blocks").array().notNull().default([]),
  uploadId: integer("upload_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudyNoteSchema = createInsertSchema(studyNotesTable).omit({ id: true, createdAt: true });
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;
export type StudyNote = typeof studyNotesTable.$inferSelect;
