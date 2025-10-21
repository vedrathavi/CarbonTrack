import Home from "../models/Home.js";
import { getOrFetchEmissionFactor } from "../services/emissionFactorService.js";

// @desc    Create a new home
// @route   POST /api/homes
// @access  Private
export const createHome = async (req, res) => {
  try {
    const { name, address, totalRooms, appliances } = req.body;

    // Fetch emission factor for the address
    let emissionFactor = null;
    if (address && address.city && address.country) {
      emissionFactor = await getOrFetchEmissionFactor({
        city: address.city,
        state: address.state,
        country: address.country,
      });
    }

    // Create new home with current user as creator
    const home = await Home.create({
      name,
      address,
      totalRooms,
      appliances,
      emissionFactor,
      createdBy: req.user._id,
      members: [{ userId: req.user._id, role: "admin" }],
    });

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
      if (addr.city && addr.country) {
        const factor = await getOrFetchEmissionFactor({
          city: addr.city,
          state: addr.state,
          country: addr.country,
        });
        if (typeof factor === "number") {
          home.emissionFactor = factor;
          await home.save();
        }
      }
    }

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

    // Fields that can be updated
    const allowedUpdates = ["name", "address", "totalRooms", "appliances"];

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
