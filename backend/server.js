import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./src/routes/authRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import fileRoutes from "./src/routes/fileRoutes.js";
import { initDatabase } from "./src/config/initDb.js";

dotenv.config();

const app = express();
console.log("🔥🔥🔥 THIS SERVER FILE IS RUNNING 🔥🔥🔥");
/* ================= CORS FIX ================= */
app.use(cors()); // ✅ allow all origins for now

// ✅ VERY IMPORTANT: handle preflight properly
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
/* =========================================== */

app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("CIO Verified API running");
});
app.get("/test", (req, res) => {
  console.log("🔥 TEST ROUTE HIT");
  res.send("🔥 THIS IS NEW SERVER");
});
/* ================= START ================= */
const startServer = async () => {
  try {
    await initDatabase();
    app.listen( 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });

  } catch (error) {
    console.error("❌ Server startup error:", error.message);
  }
};

startServer();
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";

// import authRoutes from "./src/routes/authRoutes.js";
// import applicationRoutes from "./src/routes/applicationRoutes.js";
// import fileRoutes from "./src/routes/fileRoutes.js";
// import { initDatabase } from "./src/config/initDb.js";

// dotenv.config(); // ✅ simple, no custom path

// const app = express();

// /* ================= CORS FIX ================= */
// // ✅ SIMPLE & RELIABLE (no errors, no preflight issues)
// app.use(cors({
//   origin: "http://localhost:5173",
// }));

// /* =========================================== */

// app.use(express.json());

// /* ================= ROUTES ================= */
// app.use("/api/auth", authRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/files", fileRoutes);
// app.use((req, res, next) => {
//   console.log(`👉 Incoming: ${req.method} ${req.url}`);
//   next();
// });
// /* ================= TEST ================= */
// app.get("/", (req, res) => {
//   res.send("CIO Verified API running");
// });

// /* ================= START SERVER ================= */
// const startServer = async () => {
//   try {
//     await initDatabase();

//     app.listen(process.env.PORT || 5000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
//     });

//   } catch (error) {
//     console.error("❌ Server startup error:", error.message);
//   }
// };

// startServer();