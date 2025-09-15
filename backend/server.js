const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
require("./config/passport"); // load passport config
const session = require("express-session");


connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "campus-sync-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => console.log(`🚀 Server running on port ${PORT}`));
