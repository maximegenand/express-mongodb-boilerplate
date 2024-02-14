import { connect, set } from "mongoose";
import { config, logger } from "@config";

// If strictQuery is set to true, mongoose removes any query conditions with a value of undefined.
// This is to avoid unintended CRUD operations when using variables in queries.
set("strictQuery", true);

interface DatabaseConnectionResult {
  isConnected: boolean;
}

export async function connectDatabase(): Promise<DatabaseConnectionResult> {
  try {
    await connect(config.MONGOOSE.URL + config.MONGOOSE.DB_NAME);
    logger.info(
      `[DATABASE] ... Connected to ${config.MONGOOSE.URL}${config.MONGOOSE.DB_NAME} ...`
    );
    return { isConnected: true };
  } catch (error) {
    logger.error("[DATABASE] ... Unable to connect:", error);
    return { isConnected: false };
  }
}
