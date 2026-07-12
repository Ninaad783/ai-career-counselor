const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load Environment Variables safely from your secure .env structure
dotenv.config();

const connectDB = require("./config/db");

// Import Application Routing Modules
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes"); 
const learningRoutes = require("./routes/learningRoutes");   

const app = express();

// 1. Connect Database Instance
connectDB();

// 2. Global Middleware Configuration (UPDATED FOR DEPLOYMENT)
// Global Middleware Configuration (UPDATED FOR FIREBASE TARGETS)
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);

// 3. Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes); 
app.use("/api/learning", learningRoutes);   

// 4. Base Check Route (Helpful for Render's automated ping health checks)
app.get("/", (req, res) => {
  res.status(200).send("API Running Successfully on Production Cluster...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});