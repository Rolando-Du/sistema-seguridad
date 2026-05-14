const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = ["PORT", "CLIENT_URL"];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.warn(
    `⚠️ Variables de entorno faltantes: ${missingEnvVars.join(", ")}`
  );
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminSetupToken: process.env.ADMIN_SETUP_TOKEN || "",
};

module.exports = env;
