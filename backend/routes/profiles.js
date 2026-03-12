import { Router } from "express";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const profiles = await prisma.profile.findMany();
    res.json(profiles);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: req.params.id } });
    if (!profile) return res.status(404).json({ error: "Not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", verifyJwt, async (req, res, next) => {
  try {
    if (req.userId !== req.params.id) return res.status(403).json({ error: "Forbidden" });
    const { fullName, phone, village, taluk, district, state, profilePhotoUrl } = req.body;
    const updated = await prisma.profile.update({
      where: { id: req.params.id },
      data: { fullName, phone, village, taluk, district, state, profilePhotoUrl },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;




