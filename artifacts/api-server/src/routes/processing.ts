import { Router } from "express";
import { db } from "@workspace/db";
import { processingJobsTable, uploadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateProcessingJobBody, UpdateProcessingJobBody } from "@workspace/api-zod";

const router = Router();

function formatJob(job: typeof processingJobsTable.$inferSelect) {
  return {
    ...job,
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
  };
}

router.get("/processing", async (req, res) => {
  const jobs = await db.select().from(processingJobsTable).orderBy(processingJobsTable.createdAt);
  res.json(jobs.map(formatJob));
});

router.post("/processing", async (req, res) => {
  const parsed = CreateProcessingJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { jobType, uploadId } = parsed.data;
  let uploadName: string | null = null;
  const uploads = await db.select().from(uploadsTable).where(eq(uploadsTable.id, uploadId));
  if (uploads.length > 0) uploadName = uploads[0].fileName;

  const [job] = await db
    .insert(processingJobsTable)
    .values({
      jobType,
      uploadId,
      uploadName,
      status: "queued",
      progress: 0,
      estimatedTime: 120,
    })
    .returning();
  res.status(201).json(formatJob(job));
});

router.patch("/processing/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProcessingJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.progress !== undefined) updateData.progress = parsed.data.progress;
  if (parsed.data.estimatedTime !== undefined) updateData.estimatedTime = parsed.data.estimatedTime;
  if (parsed.data.completedAt !== undefined) {
    updateData.completedAt = parsed.data.completedAt ? new Date(parsed.data.completedAt) : null;
  }

  const [updated] = await db
    .update(processingJobsTable)
    .set(updateData)
    .where(eq(processingJobsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatJob(updated));
});

export default router;
