# 📘 Campus-Sync Backend Documentation

## 1. Overview
The backend is built using:
- **Node.js + Express** → REST API framework  
- **MongoDB (Atlas)** → Database  
- **Mongoose** → ODM (Object Data Modeling) for MongoDB  
- **bcryptjs** → For password hashing  
- **jsonwebtoken (JWT)** → For authentication tokens  
- **dotenv** → To load environment variables  

---

## 2. Project Structure

backend/
│── server.js # Entry point, starts Express server
│── routes/
│ └── authRoutes.js # Authentication routes (signup/login)
│── models/
│ └── User.js # User schema for MongoDB
│── .env # Environment variables (MongoDB URI, Port, JWT secret)
│── package.json # Dependencies and scripts


---

## 3. Environment Variables (`.env`)
```env
MONGO_URI = mongodb+srv://<username>:<password>@cluster.mongodb.net/CampusSync
PORT = 5000
JWT_SECRET = your_jwt_secret

---

## 4. Install Dependencies

    npm install express mongoose bcryptjs jsonwebtoken dotenv


## 5. User Model (models/User.js)

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin", "parent"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);


## 6. Authentication Routes (routes/authRoutes.js)

    const express = require("express");
    const router = express.Router();
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");

    // Helper function for token
    const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({
        message: `${role} registered successfully`,
        user,
        token: generateToken(user._id)
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
        }

        res.json({
        message: `${role} login successful`,
        user,
        token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
    });

    module.exports = router;



## 7. Server Setup (server.js)

    const express = require("express");
    const mongoose = require("mongoose");
    const dotenv = require("dotenv");
    dotenv.config();

    const app = express();
    app.use(express.json());

    // Routes
    app.use("/api/auth", require("./routes/authRoutes"));

    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


## 8. API Endpoints
🔹 Register User

    POST /api/auth/register

    Request Body : 
        {
        "email": "student@example.com",
        "password": "mypassword",
        "role": "student"
        }

    Response : 
        {
        "message": "student registered successfully",
        "user": {
            "_id": "6501234567890abc",
            "email": "student@example.com",
            "role": "student"
        },
        "token": "eyJhbGciOiJIUzI1NiIs..."
        }


🔹 Login User

POST /api/auth/login

Request Body

{
  "email": "student@example.com",
  "password": "mypassword",
  "role": "student"
}


Response

{
  "message": "student login successful",
  "user": {
    "_id": "6501234567890abc",
    "email": "student@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}



## 9. Workflow

    Start backend

    cd backend
    node server.js


    Runs on: http://localhost:5000

    Frontend calls APIs

    POST /api/auth/register → Signup

    POST /api/auth/login → Login

    MongoDB Atlas stores user details with hashed password

    JWT Token is returned → stored in frontend localStorage

## 10. Security Notes

    Always hash passwords (bcrypt)

    Keep JWT_SECRET safe in .env

    Use middleware later for protected routes

    Use HTTPS in production

## 11. Next Improvements

    Add fields: name, collegeName to User model

    Add JWT middleware for route protection

    Role-based access control (student vs teacher vs admin)

    Central error handling & logging




https://chatgpt.com/share/68c6be06-c49c-8008-9cad-e769bf3f6a53



## 12. Important changes to connect front to backend 

Frontend/src/page/Auth.tsx   

for more detail check https://chatgpt.com/share/68c6be06-c49c-8008-9cad-e769bf3f6a53