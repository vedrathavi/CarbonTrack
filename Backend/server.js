import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

// register passport strategies (side-effect)
import "./src/services/passport.js";

import authRouter from "./src/routes/authRoutes.js";
import homeRouter from "./src/routes/homeRoutes.js";
import emissionRouter from "./src/routes/emissionRoutes.js";
import simulationRouter from "./src/routes/simulationRoutes.js";
import dashboardRouter from "./src/routes/dashboardRoutes.js";
import insightRouter from "./src/routes/insightRoutes.js";
import healthRouter from "./src/routes/healthRoutes.js";
import { initScheduler } from "./src/services/scheduler.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  next();
});

// mount auth routes (passport callback URL expects this mount)
app.use("/api/auth", authRouter);
// mount home routes
app.use("/api/home", homeRouter);
// mount emission factor routes
app.use("/api/emission-factor", emissionRouter);
// simulation routes (manual triggers)
app.use("/api/simulation", simulationRouter);
// dashboard endpoints
app.use("/api/dashboard", dashboardRouter);
// insight endpoints
app.use("/api/insights", insightRouter);
// health endpoints (wake up server)
app.use("/api/health", healthRouter);

// Connect to Mongo and start server after success
const MONGO_URI = process.env.MONGO_URI;

// Provide explicit connection options to improve diagnostics and handle common network issues.
const mongooseOptions = {
  // time to try selecting servers (ms)
  serverSelectionTimeoutMS: 10000,
  // socket/connect timeout
  connectTimeoutMS: 10000,
  // prefer IPv4 to avoid some DNS/IPv6 issues on Windows networks
  family: 4,
};

mongoose
  .connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("MongoDB connected");
    app.get("/", (req, res) => res.send("Server is running!"));

    // Initialize scheduler (no realtime sockets)
    try {
      initScheduler();
    } catch (e) {
      console.error("Failed to initialize scheduler:", e);
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", {
      name: err?.name,
      message: err?.message,
      reason: err?.reason || err?.stack,
    });
    // Helpful troubleshooting tips for the developer
    console.error(
      "Tips: check MONGO_URI, internet access, and MongoDB Atlas IP whitelist (or allow 0.0.0.0/0 for testing).\n" +
        "You can also try increasing serverSelectionTimeoutMS in server.js if your network is slow."
    );
    process.exit(1);
  });
