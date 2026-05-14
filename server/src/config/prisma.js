const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const env = require("./env");

const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
  });

  return new PrismaClient({
    adapter,
    log:
      env.nodeEnv === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;