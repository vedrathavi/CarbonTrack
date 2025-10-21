import express from "express";
import { getEmissionFactor } from "../controllers/emissionController.js";

const router = express.Router();

// GET /api/emission-factor?city=&state=&country=
router.get("/", getEmissionFactor);

export default router;
