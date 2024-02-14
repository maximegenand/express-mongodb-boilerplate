import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

/*
dotenv.config() is called, with the path option
set to the absolute path of the .env file,
to load environment variables.

path.join() concatenates the __dirname variable
(current directory of the script file)
with the .env file's relative path,
which resolves the absolute path to the .env file.
*/
dotenv.config({ path: path.join(__dirname, "../../.env") });

const envValidationSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    DB_NAME: Joi.string().required().description("MongoDB Database name"),
    MONGODB_URL: Joi.string().required().description("MongoDB URL"),
    TOKEN_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(60)
      .description("Token access expiration in minutes"),
    TOKEN_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("Token refresh expiration in days"),
  })
  .unknown();

const { value: envSchema, error } = envValidationSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

export const config = {
  ENV: envSchema.NODE_ENV,
  PORT: envSchema.PORT,
  MONGOOSE: {
    URL: envSchema.MONGODB_URL,
    DB_NAME: envSchema.DB_NAME + (envSchema.NODE_ENV === "test" ? "-test" : ""),
  },
  TOKEN: {
    ACCESS_EXPIRATION_MINUTES: envSchema.TOKEN_ACCESS_EXPIRATION_MINUTES,
    REFRESH_EXPIRATION_DAYS: envSchema.TOKEN_REFRESH_EXPIRATION_DAYS,
  },
};
