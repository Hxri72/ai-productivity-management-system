import env from "./env.js";

const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true, // Allow cookies (refresh token)
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
