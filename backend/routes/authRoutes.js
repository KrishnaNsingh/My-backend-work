const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// helper function
const generateToken = (id) => {
  return jwt.sign({ id }, "your_jwt_secret", { expiresIn: "7d" }); 
};

// Register User
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "teacher", "admin", "parent"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({
      message: `${role} registered successfully`,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: "User not found for this role" });

    // compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: `${role} login successful`,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
