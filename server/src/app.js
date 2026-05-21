import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import corsOptions from "./config/cors.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Rate limiting
app.use("/api/", apiLimiter);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
