import http from "http";
import app from "./app";
import env from "./utils/env";
import logger from "./utils/logger";

const server = http.createServer(app);

const PORT = env.PORT;

server.listen(PORT, () => {
  logger.info(`The app listening on port ${PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
