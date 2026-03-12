import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prismaClient.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, fullName, phone, village, taluk, district, state, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: "email, password, role are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    await prisma.profile.create({
      data: {
        id: user.id,
        fullName: fullName || "",
        phone: phone || null,
        village: village || null,
        taluk: taluk || null,
        district: district || null,
        state: state || null,
        profilePhotoUrl: null,
      },
    });

    await prisma.userRole.create({ data: { userId: user.id, role } });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email }, role });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const roleData = await prisma.userRole.findFirst({
      where: { userId: user.id },
      select: { role: true },
    });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email }, role: roleData?.role });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  // Stateless JWT: client should delete token
  res.json({ ok: true });
});

router.get("/me", verifyJwt, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const roles = await prisma.userRole.findMany({
      where: { userId: req.userId },
      select: { role: true },
    });
    
    res.json({ user, roles: roles.map(r => r.role) });
  } catch (err) {
    next(err);
  }
});

export default router;


