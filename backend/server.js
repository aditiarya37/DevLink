const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const passport = require("passport");
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

require("./config/passportConfig");

connectDB();

const app = express();

const corsOptions = {
  // Check if we are in production, otherwise default to localhost
  origin:
    process.env.NODE_ENV === "production"
      ? "https://devlink-umber.vercel.app"
      : "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

app.get("/api/test", (req, res) => {
  res.json({
    message:
      "Hello from the DevLink backend! Test successful. CORS is working!",
  });
});
app.get("/api/db-status", (req, res) => {
  const dbState = mongoose.connection.readyState;
  let statusMessage = "Database status unknown";
  switch (dbState) {
    case 0:
      statusMessage = "MongoDB Disconnected";
      break;
    case 1:
      statusMessage = "MongoDB Connected";
      break;
    case 2:
      statusMessage = "MongoDB Connecting";
      break;
    case 3:
      statusMessage = "MongoDB Disconnecting";
      break;
  }
  res.json({ db_connection_state: dbState, message: statusMessage });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  // Adding "0.0.0.0" helps Render's health checks
  console.log(`Server is running on port ${PORT}`);
});
