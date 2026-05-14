import { Router } from "express";
import { db } from "@workspace/db";
import { studyNotesTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { CreateNoteBody, ListNotesQueryParams } from "@workspace/api-zod";

const router = Router();

function formatNote(note: typeof studyNotesTable.$inferSelect) {
  return {
    ...note,
    createdAt: note.createdAt.toISOString(),
  };
}

router.get("/notes", async (req, res) => {
  const parsed = ListNotesQueryParams.safeParse(req.query);
  const { search, chapter } = parsed.success ? parsed.data : { search: undefined, chapter: undefined };

  let notes = await db.select().from(studyNotesTable).orderBy(studyNotesTable.createdAt);

  if (search) {
    const q = search.toLowerCase();
    notes = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.chapter.toLowerCase().includes(q)
    );
  }
  if (chapter) {
    notes = notes.filter((n) => n.chapter === chapter);
  }

  res.json(notes.map(formatNote));
});

router.post("/notes", async (req, res) => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { title, chapter, content, keyTakeaways, definitions, formulaBlocks, uploadId } = parsed.data;
  const [note] = await db
    .insert(studyNotesTable)
    .values({
      title,
      chapter,
      content,
      keyTakeaways: keyTakeaways ?? [],
      definitions: definitions ?? [],
      formulaBlocks: formulaBlocks ?? [],
      uploadId: uploadId ?? null,
    })
    .returning();
  res.status(201).json(formatNote(note));
});

router.get("/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const notes = await db.select().from(studyNotesTable).where(eq(studyNotesTable.id, id));
  if (!notes[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatNote(notes[0]));
});

router.delete("/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(studyNotesTable).where(eq(studyNotesTable.id, id));
  res.status(204).end();
});

export default router;
