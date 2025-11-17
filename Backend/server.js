import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// register passport strategies (side-effect)
import "./src/services/passport.js";

import authRouter from "./src/routes/authRoutes.js";
import homeRouter from "./src/routes/homeRoutes.js";
import emissionRouter from "./src/routes/emissionRoutes.js";
import simulationRouter from "./src/routes/simulationRoutes.js";
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

    // Create HTTP server and attach Socket.IO
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: CLIENT_URL,
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("socket connected", socket.id);
      // Allow clients to join rooms for their homes: { homeId }
      socket.on("joinHome", (payload) => {
        try {
          const homeId = payload && payload.homeId;
          if (homeId) {
            socket.join(`home_${homeId}`);
            console.log(`socket ${socket.id} joined room home_${homeId}`);
          }
        } catch (e) {
          console.error("joinHome error:", e);
          // ignore
        }
      });
    });

    // Initialize scheduler that will use `io` to broadcast hourly updates
    try {
      initScheduler({ io });
    } catch (e) {
      console.error("Failed to initialize scheduler:", e);
    }

    server.listen(PORT, () => {
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
