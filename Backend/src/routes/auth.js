import express from "express";
import passport from "passport";
import {
  googleCallback,
  googleLogin,
  authFailure,
  logout,
  me,
} from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Browser redirect OAuth flow
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Callback - passport sets req.user, controller sets cookie & redirects
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  googleCallback
);

// Token-exchange flow (frontend sends Google idToken) -> sets cookie & returns user
router.post("/google", googleLogin);

// Protected endpoint: current user
router.get("/me", verifyToken, me);

router.get("/failure", authFailure);

// Logout clears cookie
router.get("/logout", logout);

export default router;
