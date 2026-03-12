import { Router } from "express";
import { verifyJwt } from "../utils/verifyJwt.js";
import { askBot } from "../controllers/chatController.js";

const router = Router();

// This is the single endpoint your frontend will call
// POST /api/chat/ask
router.post("/ask", askBot);

export default router;