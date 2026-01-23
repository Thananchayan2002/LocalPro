const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workerAuthRoutes = require("./routes/workerAuthRoutes");
const otpRoutes = require("./routes/otpRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes")
dotenv.config();



// Connect to MongoDB
connectDB();

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// Parse CORS origins from environment (for production flexibility)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// CORS configuration - CRITICAL for HttpOnly cookie authentication
app.use(
  cors({
    origin: corsOrigins,
    credentials: true, // Required for HttpOnly cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerAuthRoutes);
app.use("/api/otp", otpRoutes);

const serviceRoutes = require("./routes/serviceRoutes");
const issueRoutes = require("./routes/issueRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const pushNotificationRoutes = require("./routes/pushNotificationRoutes");
app.use("/api/services", serviceRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/push", pushNotificationRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

console.log(process.env.MONGO_URI);

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
