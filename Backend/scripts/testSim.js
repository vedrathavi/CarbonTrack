#!/usr/bin/env node
import simulate from "../src/services/simulationService.js";

async function run() {
  try {
    const sample = simulate({
      appliances: { tv: 1, refrigerator: 1, airConditioner: 1 },
      countryCode: "US",
      date: new Date(),
      emissionFactor: 0.475, // kgCO2/kWh
    });

    console.log("--- Simulation Summary ---");
    console.log(sample);
    console.log("Total emissions (g):", sample.summary.totalEmissions);
    console.log("Top appliance:", sample.summary.topAppliance);
    console.log("Hourly totals (24):", sample.totalHourly);
    console.log("Appliances:", Object.keys(sample.emissions));
  } catch (err) {
    console.error("Simulation failed:", err);
    process.exitCode = 1;
  }
}

run();
