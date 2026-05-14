import { Router } from "express";
import { db } from "@workspace/db";
import { uploadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUploadBody } from "@workspace/api-zod";

const router = Router();

router.get("/uploads", async (req, res) => {
  const uploads = await db.select().from(uploadsTable).orderBy(uploadsTable.createdAt);
  res.json(
    uploads.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }))
  );
});

router.post("/uploads", async (req, res) => {
  const parsed = CreateUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { fileName, fileType, fileSize } = parsed.data;
  const [upload] = await db
    .insert(uploadsTable)
    .values({ fileName, fileType, fileSize, status: "ready", progress: 100 })
    .returning();
  res.status(201).json({ ...upload, createdAt: upload.createdAt.toISOString() });
});

router.delete("/uploads/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(uploadsTable).where(eq(uploadsTable.id, id));
  res.status(204).end();
});

export default router;
