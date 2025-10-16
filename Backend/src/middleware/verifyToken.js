import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const COOKIE_NAME = "token";

const verifyToken = (req, res, next) => {
  // 1) Try Authorization header
  const authHeader = req.headers.authorization || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // 2) Fallback to cookie
  const cookieToken = req.cookies?.[COOKIE_NAME];

  const token = headerToken || cookieToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;
