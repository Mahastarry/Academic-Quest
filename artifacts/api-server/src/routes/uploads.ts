import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { uploadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
]);

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt|md)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, DOC, TXT, and MD files are allowed"));
    }
  },
});

function detectFileType(fileName: string): "syllabus" | "textbook" | "notes" | "other" {
  const lower = fileName.toLowerCase();
  if (lower.includes("syllabus") || lower.includes("curriculum") || lower.includes("outline")) return "syllabus";
  if (lower.includes("textbook") || lower.includes("book") || lower.includes("edition")) return "textbook";
  if (lower.includes("notes") || lower.includes("lecture") || lower.includes("summary")) return "notes";
  return "other";
}

function formatUpload(u: typeof uploadsTable.$inferSelect) {
  return { ...u, createdAt: u.createdAt.toISOString() };
}

router.get("/uploads", async (req, res) => {
  const uploads = await db.select().from(uploadsTable).orderBy(uploadsTable.createdAt);
  res.json(uploads.map(formatUpload));
});

router.post("/uploads/file", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const overrideType = req.body?.fileType as string | undefined;
  const validTypes = ["syllabus", "textbook", "notes", "other"];
  const fileType = validTypes.includes(overrideType ?? "") ? (overrideType as "syllabus" | "textbook" | "notes" | "other") : detectFileType(req.file.originalname);

  const [upload] = await db
    .insert(uploadsTable)
    .values({
      fileName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      status: "ready",
      progress: 100,
    })
    .returning();

  res.status(201).json(formatUpload(upload));
});

router.post("/uploads", async (req, res) => {
  const { fileName, fileType, fileSize } = req.body ?? {};
  if (!fileName || !fileSize) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const validTypes = ["syllabus", "textbook", "notes", "other"];
  const safeType = validTypes.includes(fileType) ? fileType : detectFileType(fileName);
  const [upload] = await db
    .insert(uploadsTable)
    .values({ fileName, fileType: safeType, fileSize: Number(fileSize), status: "ready", progress: 100 })
    .returning();
  res.status(201).json(formatUpload(upload));
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
