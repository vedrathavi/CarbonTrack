import Home from "../models/Home.js";
import User from "../models/User.js";
import { getOrFetchEmissionFactor } from "../services/emissionFactorService.js";

export const createHome = async (req, res) => {
  try {
    const { address, totalRooms, appliances } = req.body;

    const existingHome = await Home.findOne({ "members.userId": req.user._id });
    if (existingHome) {
      return res.status(409).json({
        status: "error",
        code: "HOME_ALREADY_EXISTS",
        message:
          "You are already a member of a home. A user may only belong to one home.",
      });
    }

    let emissionFactor = null;
    if (address && address.country) {
      emissionFactor = await getOrFetchEmissionFactor({
        country: address.country,
      });
    }

    if (emissionFactor === null) {
      console.warn(
        `Could not determine emission factor for country: ${address?.country}`
      );
      return res.status(422).json({
        status: "error",
        code: "EMISSION_FACTOR_UNAVAILABLE",
        message:
          "Could not determine emission factor for the provided address. Please provide a more specific address or try again later.",
      });
    }

    const home = await Home.create({
      address,
      totalRooms,
      appliances,
      emissionFactor,
      createdBy: req.user._id,
      members: [{ userId: req.user._id, role: "admin" }],
    });

    await User.findByIdAndUpdate(req.user._id, { householdId: home._id });

    console.log(
      `Home created successfully with emission factor: ${emissionFactor} gCO₂/kWh`
    );
    res.status(201).json({
      status: "success",
      data: {
        home,
        message: "Home created successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating home",
      error: error.message,
    });
  }
};

export const joinHome = async (req, res) => {
  try {
    const { homeCode } = req.body;

    if (!homeCode) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a home code",
      });
    }

    const home = await Home.joinByHomeCode(homeCode, req.user._id);

    if (
      home &&
      (home.emissionFactor === null || home.emissionFactor === undefined)
    ) {
      const addr = home.address || {};
      if (addr.country) {
        const factor = await getOrFetchEmissionFactor({
          country: addr.country,
        });
        if (typeof factor === "number") {
          home.emissionFactor = factor;
          await home.save();
          console.log(`Backfilled emission factor: ${factor} gCO₂/kWh`);
        } else {
          console.warn(
            `Could not backfill emission factor for country: ${addr.country}`
          );
          return res.status(422).json({
            status: "error",
            code: "EMISSION_FACTOR_UNAVAILABLE",
            message:
              "Could not determine emission factor for the home's address. Please provide a more specific address or contact support.",
          });
        }
      }
    }

    await User.findByIdAndUpdate(req.user._id, { householdId: home._id });
    console.log(`User ${req.user.email} joined home with code: ${homeCode}`);

    res.status(200).json({
      status: "success",
      data: {
        home,
        message: "Successfully joined home",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error joining home",
      error: error.message,
    });
  }
};

export const getMyHome = async (req, res) => {
  try {
    const home = await Home.findOne({
      "members.userId": req.user._id,
    }).populate("members.userId", "name email profilePic");

    if (!home) {
      return res.status(404).json({
        status: "error",
        message: "You are not a member of any home",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        home,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching home",
      error: error.message,
    });
  }
};

export const updateHome = async (req, res) => {
  try {
    const home = await Home.findOne({
      "members.userId": req.user._id,
    });

    if (!home) {
      return res.status(404).json({
        status: "error",
        message: "Home not found",
      });
    }

    if (!home.isAdmin(req.user._id)) {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update home details",
      });
    }

    const allowedUpdates = ["address", "totalRooms", "appliances"];

    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(home, updates);
    await home.save();
    console.log(`Home updated by ${req.user.email}`);

    res.status(200).json({
      status: "success",
      data: {
        home,
        message: "Home updated successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating home",
      error: error.message,
    });
  }
};

export const getHomeStats = async (req, res) => {
  try {
    const home = await Home.findOne({
      "members.userId": req.user._id,
    });

    if (!home) {
      return res.status(404).json({
        status: "error",
        message: "Home not found",
      });
    }

    const stats = {
      totalMembers: home.members.length,
      totalAppliances: Object.values(home.appliances).reduce(
        (a, b) => a + b,
        0
      ),
      isAdmin: home.isAdmin(req.user._id),
    };

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching home stats",
      error: error.message,
    });
  }
};

export const getHomeMembers = async (req, res) => {
  try {
    const home = await Home.findOne({ "members.userId": req.user._id })
      .populate("members.userId", "name email profilePic")
      .lean();

    if (!home) {
      return res.status(404).json({
        status: "error",
        message: "Home not found",
      });
    }

    const members = (home.members || [])
      .filter((m) => m && m.userId)
      .map((m) => ({ role: m.role, user: m.userId }));

    res.status(200).json({
      status: "success",
      data: {
        members,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching home members",
      error: error.message,
    });
  }
};
