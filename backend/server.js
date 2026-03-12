import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import cropRoutes from "./routes/crops.js";
import pricePredictionRoutes from "./routes/pricePredictions.js";
import profileRoutes from "./routes/profiles.js";
import ratingRoutes from "./routes/ratings.js";
import roleRoutes from "./routes/roles.js";
import transportRoutes from "./routes/transportation.js";

import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration - Allow all localhost origins in development
const corsOptions = {
  origin: function (origin, callback) {
    // Default allowed origins (for development)
    const defaultOrigins = [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8081",
      "http://127.0.0.1:3000"
    ];
    
    // Get allowed origins from environment or use defaults
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
      : defaultOrigins;
    
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins regardless of port
    if (process.env.NODE_ENV !== "production") {
      // Allow any localhost or 127.0.0.1 origin
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
      // Also allow if in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, allow all origins for easier testing
      return callback(null, true);
    }
    
    // In production, check against allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Apply CORS middleware BEFORE any routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests for all routes
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "desi-bazaar-backend" });
});

console.log("--- CHAT ROUTE IS NOW REGISTERED ---");

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/price-predictions", pricePredictionRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});




