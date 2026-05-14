import { Router } from "express";
import { db } from "@workspace/db";
import { uploadsTable, processingJobsTable, studyNotesTable, reviewQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/analytics/summary", async (req, res) => {
  const uploads = await db.select().from(uploadsTable);
  const notes = await db.select().from(studyNotesTable);
  const questions = await db.select().from(reviewQuestionsTable);
  const jobs = await db.select().from(processingJobsTable);

  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const totalNotes = notes.length;
  const totalQuestions = questions.length;

  const studyCompletionPercent = totalNotes > 0 ? Math.min(Math.round((completedJobs / Math.max(1, jobs.length)) * 100), 100) : 0;

  const difficultyCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of questions) {
    if (q.difficulty in difficultyCounts) difficultyCounts[q.difficulty]++;
  }
  const maxDiff = Object.entries(difficultyCounts).sort((a, b) => b[1] - a[1])[0];
  const avgDifficulty = maxDiff ? maxDiff[0] : "medium";

  res.json({
    totalUploads: uploads.length,
    totalNotes,
    totalQuestions,
    studyCompletionPercent,
    avgDifficulty,
    processingJobsCompleted: completedJobs,
  });
});

router.get("/analytics/bloom-distribution", async (req, res) => {
  const questions = await db.select().from(reviewQuestionsTable);
  const levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
  const counts: Record<string, number> = {};
  for (const l of levels) counts[l] = 0;
  for (const q of questions) {
    if (q.bloomLevel in counts) counts[q.bloomLevel]++;
  }
  const total = questions.length || 1;
  const result = levels.map((l) => ({
    label: l.charAt(0).toUpperCase() + l.slice(1),
    count: counts[l],
    percent: Math.round((counts[l] / total) * 100),
  }));
  res.json(result);
});

router.get("/analytics/difficulty-distribution", async (req, res) => {
  const questions = await db.select().from(reviewQuestionsTable);
  const levels = ["easy", "medium", "hard"];
  const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of questions) {
    if (q.difficulty in counts) counts[q.difficulty]++;
  }
  const total = questions.length || 1;
  const result = levels.map((l) => ({
    label: l.charAt(0).toUpperCase() + l.slice(1),
    count: counts[l],
    percent: Math.round((counts[l] / total) * 100),
  }));
  res.json(result);
});

router.get("/analytics/topic-coverage", async (req, res) => {
  const notes = await db.select().from(studyNotesTable);
  const questions = await db.select().from(reviewQuestionsTable);

  const topicMap: Record<string, { notesCount: number; questionsCount: number }> = {};

  for (const n of notes) {
    if (!topicMap[n.chapter]) topicMap[n.chapter] = { notesCount: 0, questionsCount: 0 };
    topicMap[n.chapter].notesCount++;
  }
  for (const q of questions) {
    if (!topicMap[q.chapter]) topicMap[q.chapter] = { notesCount: 0, questionsCount: 0 };
    topicMap[q.chapter].questionsCount++;
  }

  const totalNotes = notes.length || 1;
  const result = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    notesCount: data.notesCount,
    questionsCount: data.questionsCount,
    coveragePercent: Math.round((data.notesCount / totalNotes) * 100),
  }));

  res.json(result);
});

export default router;
