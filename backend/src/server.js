import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { initDatabase } from "./config/initDb.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminPermissionRoutes from "./routes/adminPermissionRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
// import { authenticateUser } from "./middleware/authMiddleware.js";
import assessorRoutes from "./routes/assessorRoutes.js";
dotenv.config({ path: "../.env" });

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", profileRoutes);
app.use("/api", adminPermissionRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/assessor", assessorRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("CIO Verified API running");
});

// ✅ Start server + init DB
const startServer = async () => {
  try {
    await initDatabase(); // 🔥 run first

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup error:", error.message);
  }
};

startServer();