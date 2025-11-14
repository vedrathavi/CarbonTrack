import express from "express";
import {
  runSimulationForHome,
  runSimulationForAll,
  getLatestHourlyEmission,
  getHourlyEmissionAt,
} from "../controllers/simulationController.js";

const router = express.Router();

// POST /api/simulation/run - { homeId, date? }
router.post("/run", runSimulationForHome);

// POST /api/simulation/run-all - { date? }
router.post("/run-all", runSimulationForAll);

// GET /api/simulation/latest/:homeId
router.get("/latest/:homeId", getLatestHourlyEmission);

// GET /api/simulation/hourly/:homeId?hour=15&date=YYYY-MM-DD
router.get("/hourly/:homeId", getHourlyEmissionAt);

export default router;
