import { Router, type IRouter } from "express";
import healthRouter from "./health";
import uploadsRouter from "./uploads";
import processingRouter from "./processing";
import notesRouter from "./notes";
import questionsRouter from "./questions";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(uploadsRouter);
router.use(processingRouter);
router.use(notesRouter);
router.use(questionsRouter);
router.use(analyticsRouter);

export default router;
