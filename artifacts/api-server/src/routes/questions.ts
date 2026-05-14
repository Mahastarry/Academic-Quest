import { Router } from "express";
import { db } from "@workspace/db";
import { reviewQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateQuestionBody, ListQuestionsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatQuestion(q: typeof reviewQuestionsTable.$inferSelect) {
  return {
    ...q,
    createdAt: q.createdAt.toISOString(),
  };
}

router.get("/questions", async (req, res) => {
  const parsed = ListQuestionsQueryParams.safeParse(req.query);
  const { difficulty, bloom_level, chapter, search } = parsed.success
    ? parsed.data
    : { difficulty: undefined, bloom_level: undefined, chapter: undefined, search: undefined };

  let questions = await db.select().from(reviewQuestionsTable).orderBy(reviewQuestionsTable.createdAt);

  if (difficulty) questions = questions.filter((q) => q.difficulty === difficulty);
  if (bloom_level) questions = questions.filter((q) => q.bloomLevel === bloom_level);
  if (chapter) questions = questions.filter((q) => q.chapter === chapter);
  if (search) {
    const s = search.toLowerCase();
    questions = questions.filter((q) => q.question.toLowerCase().includes(s));
  }

  res.json(questions.map(formatQuestion));
});

router.post("/questions", async (req, res) => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { question, options, correctAnswer, bloomLevel, difficulty, chapter, evidenceQuote, uploadId } = parsed.data;
  const [q] = await db
    .insert(reviewQuestionsTable)
    .values({
      question,
      options,
      correctAnswer,
      bloomLevel,
      difficulty,
      chapter,
      evidenceQuote: evidenceQuote ?? null,
      uploadId: uploadId ?? null,
    })
    .returning();
  res.status(201).json(formatQuestion(q));
});

router.delete("/questions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(reviewQuestionsTable).where(eq(reviewQuestionsTable.id, id));
  res.status(204).end();
});

export default router;
