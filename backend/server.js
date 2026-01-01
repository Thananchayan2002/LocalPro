const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const workerAuthRoutes = require("./routes/workerAuthRoutes");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerAuthRoutes);

const serviceRoutes = require("./routes/serviceRoutes");
const issueRoutes = require("./routes/issueRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
app.use("/api/services", serviceRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/professionals", professionalRoutes);

console.log(process.env.MONGO_URI);

// Server start
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
