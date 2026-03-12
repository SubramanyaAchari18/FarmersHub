import { Router } from "express";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await prisma.rating.findMany({ orderBy: { createdAt: "desc" } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyJwt, async (req, res, next) => {
  try {
    const data = req.body;
    const created = await prisma.rating.create({
      data: {
        farmerId: data.farmerId,
        buyerId: req.userId,
        rating: data.rating,
        reviewText: data.reviewText || null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;




