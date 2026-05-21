import env from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

startServer();
