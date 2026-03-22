import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { initDatabase } from "./config/initDb.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/files", fileRoutes);

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