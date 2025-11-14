import Home from "../models/Home.js";
import User from "../models/User.js";
import { getOrFetchEmissionFactor } from "../services/emissionFactorService.js";

// @desc    Create a new home
// @route   POST /api/homes
// @access  Private
export const createHome = async (req, res) => {
  try {
    // Do not accept a 'name' field — the Home model does not include a name
    const { address, totalRooms, appliances } = req.body;

    // Prevent a user who already belongs to a home from creating another
    const existingHome = await Home.findOne({ "members.userId": req.user._id });
    if (existingHome) {
      return res.status(409).json({
        status: "error",
        code: "HOME_ALREADY_EXISTS",
        message:
          "You are already a member of a home. A user may only belong to one home.",
      });
    }

    // Fetch emission factor for the address (country-only lookup in service)
    let emissionFactor = null;
    if (address && address.country) {
      emissionFactor = await getOrFetchEmissionFactor({
        country: address.country,
      });
    }

    // If we couldn't determine an emission factor, return a clear 422 so frontend can prompt user
    if (emissionFactor === null) {
      return res.status(422).json({
        status: "error",
        code: "EMISSION_FACTOR_UNAVAILABLE",
        message:
          "Could not determine emission factor for the provided address. Please provide a more specific address or try again later.",
      });
    }

    // Create new home with current user as creator
    const home = await Home.create({
      address,
      totalRooms,
      appliances,
      emissionFactor,
      createdBy: req.user._id,
      members: [{ userId: req.user._id, role: "admin" }],
    });

    // Update user's householdId
    await User.findByIdAndUpdate(req.user._id, { householdId: home._id });

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

// @desc    Join a home using home code
// @route   POST /api/homes/join
// @access  Private
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

    // Backfill emissionFactor if missing (for older homes)
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
        } else {
          // If we couldn't backfill, return a 422 so the client can handle it explicitly
          return res.status(422).json({
            status: "error",
            code: "EMISSION_FACTOR_UNAVAILABLE",
            message:
              "Could not determine emission factor for the home's address. Please provide a more specific address or contact support.",
          });
        }
      }
    }

    // Update user's householdId
    await User.findByIdAndUpdate(req.user._id, { householdId: home._id });

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

// @desc    Get current user's home
// @route   GET /api/homes/me
// @access  Private
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

// @desc    Update home details
// @route   PATCH /api/homes
// @access  Private (Admin only)
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

    // Check if user is admin
    if (!home.isAdmin(req.user._id)) {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update home details",
      });
    }

    // Fields that can be updated (no 'name' field in model)
    const allowedUpdates = ["address", "totalRooms", "appliances"];

    // Filter out unwanted fields
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Update home
    Object.assign(home, updates);
    await home.save();

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

// @desc    Get home statistics
// @route   GET /api/homes/stats
// @access  Private
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

    // Calculate basic statistics
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

// @desc    Get members of the current user's home with user info and roles
// @route   GET /api/homes/members
// @access  Private
export const getHomeMembers = async (req, res) => {
  try {
    // Find the home that contains the requesting user and populate member user docs
    const home = await Home.findOne({ "members.userId": req.user._id })
      .populate("members.userId", "name email profilePic")
      .lean();

    if (!home) {
      return res.status(404).json({
        status: "error",
        message: "Home not found",
      });
    }

    // Map members to include role and populated user info. Filter out any empty entries.
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
