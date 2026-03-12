import { Router } from "express";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

router.get("/me", verifyJwt, async (req, res, next) => {
  try {
    const roles = await prisma.userRole.findMany({ where: { userId: req.userId } });
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

export default router;




