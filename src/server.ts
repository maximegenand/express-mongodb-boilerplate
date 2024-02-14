import app from "./app";

import { config, logger } from "@config";
import { connectDatabase } from "@database/connection";

import type { Server } from "http";

let server: Server | null = null;
connectDatabase().then(({ isConnected }) => {
  if (isConnected)
    return (server = app.listen(config.PORT, () =>
      logger.info(`[SERVER] ... Listening on port ${config.PORT} ...`)
    ));
});

const exitHandler = () => {
  if (server)
    return server.close(() => {
      logger.info("[SERVER TERMINATED — CLEAN EXIT]");
      process.exit(1);
    });
  else return process.exit(1);
};

const unexpectedErrorHandler = (error: void) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

// SIGTERM means TERMinate SIGnal (signal to terminate the running process)
process.on("SIGTERM", () => {
  logger.info("[SIGTERM RECEIVED — SERVER TERMINATED]");
  if (server) server.close();
});

//! DEBUG
// const _processLog = process;
// const _memoryUsage = process.memoryUsage();
// console.log(_memoryUsage);
// console.log(_processLog);
