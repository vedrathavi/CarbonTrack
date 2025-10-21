import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const COOKIE_NAME = "token";

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax", // change to "none" + secure=true for cross-site in prod
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const googleCallback = (req, res) => {
  if (!req.user) return res.redirect(`${CLIENT_URL}/login?error=auth`);

  const payload = { id: req.user._id, email: req.user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  // set httpOnly cookie then redirect to client
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return res.redirect(CLIENT_URL);
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "No token provided" });

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        profilePic: picture,
      });
    } else {
      user.googleId = user.googleId || googleId;
      user.profilePic = picture || user.profilePic;
      user.authProvider = "google";
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie (httpOnly) and return sanitized user
    res.cookie(COOKIE_NAME, token, cookieOptions);
    return res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const authFailure = (req, res) => {
  return res.status(401).json({ ok: false, message: "Authentication failed" });
};

// logout handler - clears cookie and redirects to client
export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.status(200).json({ ok: true, message: "Logged out" });
};

export const me = async (req, res) => {
  try {
    const userId = req.userId; // set by verifyToken middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
