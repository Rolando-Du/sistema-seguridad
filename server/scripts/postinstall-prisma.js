const { execSync } = require("node:child_process");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

if (!process.env.DATABASE_URL) {
  console.log("ℹ️ DATABASE_URL no definida. Se omite prisma generate en postinstall.");
  process.exit(0);
}

console.log("✅ DATABASE_URL detectada. Ejecutando prisma generate...");

execSync("prisma generate", {
  stdio: "inherit",
});
