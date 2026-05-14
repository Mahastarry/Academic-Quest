import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const processingJobsTable = pgTable("processing_jobs", {
  id: serial("id").primaryKey(),
  jobType: text("job_type").notNull(),
  status: text("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  uploadId: integer("upload_id").notNull(),
  uploadName: text("upload_name"),
  estimatedTime: integer("estimated_time"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProcessingJobSchema = createInsertSchema(processingJobsTable).omit({ id: true, createdAt: true });
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type ProcessingJob = typeof processingJobsTable.$inferSelect;
