import jwt from "jsonwebtoken";

export function verifyJwt(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.userId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}




