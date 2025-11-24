/**
 * Build an Express app instance wired with routers for integration testing.
 * Avoid listening on a network port; export the app for Supertest.
 */
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import "../src/services/passport.js";
import authRouter from "../src/routes/authRoutes.js";
import homeRouter from "../src/routes/homeRoutes.js";
import dashboardRouter from "../src/routes/dashboardRoutes.js";
import insightRouter from "../src/routes/insightRoutes.js";
import verifyToken from "../src/middleware/verifyToken.js";

export function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use("/api/auth", authRouter);
  app.use("/api/home", homeRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/insights", insightRouter);

  // Simple health endpoint
  app.get("/health", (req, res) => res.json({ ok: true }));

  return app;
}

export default buildTestApp;
